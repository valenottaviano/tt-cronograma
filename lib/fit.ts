/**
 * Lectura de archivos .fit (Garmin, Coros, Suunto…) para la vista previa en la
 * app. Un .fit de una variante puede ser dos cosas muy distintas:
 *
 * - un **entrenamiento estructurado** (pasos: entrada en calor, 6 × 1000 m a
 *   tal ritmo, etc.), que el reloj guía en vivo;
 * - un **recorrido** (course, o una actividad grabada), con puntos GPS.
 *
 * El SDK oficial de Garmin pesa: se carga recién cuando hay un .fit para leer.
 */

export interface FitPoint {
  lat: number;
  lon: number;
  ele?: number;
}

export type FitStep =
  | { type: 'step'; name: string | null; intensity: string | null; duration: string; target: string | null }
  | { type: 'repeat'; times: number; steps: FitStep[] };

export type FitPreview =
  | {
      kind: 'workout';
      name: string | null;
      sport: string | null;
      steps: FitStep[];
      /** Lo que se puede sumar de antemano (los pasos "hasta tocar lap" no suman). */
      totalSeconds: number;
      totalMeters: number;
    }
  | { kind: 'route'; name: string | null; points: FitPoint[]; distanceKm: number; elevationGain: number }
  | { kind: 'other' };

// El SDK no trae tipos útiles para los mensajes: se leen como registros sueltos.
type Mesg = Record<string, unknown>;

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

export async function parseFit(bytes: ArrayBuffer): Promise<FitPreview> {
  const { Decoder, Stream } = await import('@garmin/fitsdk');
  const decoder = new Decoder(Stream.fromArrayBuffer(bytes));
  if (!decoder.isFIT()) throw new Error('No es un archivo FIT');
  const { messages } = decoder.read() as unknown as { messages: Record<string, Mesg[] | undefined> };

  const steps = messages.workoutStepMesgs ?? [];
  if (steps.length) {
    const workout = messages.workoutMesgs?.[0] ?? {};
    return { kind: 'workout', name: str(workout.wktName), sport: str(workout.sport), ...buildSteps(steps, str(workout.sport)) };
  }

  const points = (messages.recordMesgs ?? [])
    .map((r) => ({ lat: num(r.positionLat), lon: num(r.positionLong), ele: num(r.enhancedAltitude) ?? num(r.altitude) }))
    .filter((p): p is { lat: number; lon: number; ele: number | null } => p.lat !== null && p.lon !== null)
    .map((p) => ({ lat: semicirclesToDegrees(p.lat), lon: semicirclesToDegrees(p.lon), ele: p.ele ?? undefined }));
  if (points.length >= 2) {
    const name = str(messages.courseMesgs?.[0]?.name);
    return { kind: 'route', name, points, ...routeStats(points) };
  }

  return { kind: 'other' };
}

const semicirclesToDegrees = (s: number) => s * (180 / 2 ** 31);

function routeStats(points: FitPoint[]) {
  let meters = 0;
  let gain = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const toRad = Math.PI / 180;
    const h =
      Math.sin(((b.lat - a.lat) * toRad) / 2) ** 2 +
      Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(((b.lon - a.lon) * toRad) / 2) ** 2;
    meters += 2 * 6371e3 * Math.asin(Math.sqrt(h));
    // Igual que en el GPX: los saltitos de menos de 1 m son ruido del altímetro.
    if (a.ele !== undefined && b.ele !== undefined && b.ele - a.ele > 1) gain += b.ele - a.ele;
  }
  return { distanceKm: meters / 1000, elevationGain: gain };
}

/**
 * Arma el árbol de pasos. Un paso "repetir" del .fit no envuelve a nadie: dice
 * "volvé al paso N, tantas veces", así que agarra los pasos que ya se armaron
 * desde ese índice y los mete adentro.
 */
function buildSteps(raw: Mesg[], sport: string | null) {
  const items: { index: number; item: FitStep }[] = [];
  let totalSeconds = 0;
  let totalMeters = 0;
  // Lo sumado por cada paso, para multiplicar cuando aparece una repetición.
  const sums: { index: number; seconds: number; meters: number }[] = [];

  raw.forEach((s, i) => {
    const index = num(s.messageIndex) ?? i;
    if (s.durationType === 'repeatUntilStepsCmplt') {
      const from = num(s.durationStep) ?? num(s.durationValue) ?? 0;
      const times = num(s.repeatSteps) ?? num(s.targetValue) ?? 1;
      const start = items.findIndex((x) => x.index >= from);
      if (start === -1) return;
      const group = items.splice(start).map((x) => x.item);
      const inner = sums.splice(sums.findIndex((x) => x.index >= from));
      const seconds = inner.reduce((t, x) => t + x.seconds, 0) * times;
      const meters = inner.reduce((t, x) => t + x.meters, 0) * times;
      items.push({ index: from, item: { type: 'repeat', times, steps: group } });
      sums.push({ index: from, seconds, meters });
      return;
    }
    const seconds = s.durationType === 'time' ? num(s.durationTime) ?? 0 : 0;
    const meters = s.durationType === 'distance' ? num(s.durationDistance) ?? 0 : 0;
    items.push({
      index,
      item: { type: 'step', name: str(s.wktStepName) ?? str(s.notes), intensity: str(s.intensity), duration: formatDuration(s), target: formatTarget(s, sport) },
    });
    sums.push({ index, seconds, meters });
  });

  for (const x of sums) {
    totalSeconds += x.seconds;
    totalMeters += x.meters;
  }
  return { steps: items.map((x) => x.item), totalSeconds, totalMeters };
}

export function formatSeconds(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.round(total % 60);
  if (h) return m ? `${h} h ${m} min` : `${h} h`;
  if (m) return s ? `${m} min ${s} s` : `${m} min`;
  return `${s} s`;
}

export function formatMeters(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  const km = m / 1000;
  return `${km.toLocaleString('es-AR', { maximumFractionDigits: 2 })} km`;
}

function formatDuration(s: Mesg): string {
  switch (s.durationType) {
    case 'time':
      return formatSeconds(num(s.durationTime) ?? 0);
    case 'distance':
      return formatMeters(num(s.durationDistance) ?? 0);
    case 'hrLessThan':
      return `Hasta bajar de ${hr(num(s.durationHr))}`;
    case 'hrGreaterThan':
      return `Hasta pasar ${hr(num(s.durationHr))}`;
    case 'calories':
      return `${num(s.durationCalories) ?? '?'} kcal`;
    default:
      // 'open' y 'lapButton': el paso termina cuando el atleta toca la vuelta.
      return 'Hasta tocar vuelta';
  }
}

/** En los .fit, una FC de más de 100 es "ppm + 100"; hasta 100 es % de la máxima. */
function hr(v: number | null): string {
  if (v === null) return '?';
  return v > 100 ? `${v - 100} ppm` : `${v}% FC máx`;
}

/** La potencia igual: más de 1000 es "vatios + 1000"; hasta 1000 es % del FTP. */
function power(v: number): string {
  return v > 1000 ? `${v - 1000} W` : `${v}% FTP`;
}

function pace(metersPerSecond: number): string {
  const secPerKm = 1000 / metersPerSecond;
  let m = Math.floor(secPerKm / 60);
  let sec = Math.round(secPerKm % 60);
  if (sec === 60) {
    m += 1;
    sec = 0;
  }
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function formatTarget(s: Mesg, sport: string | null): string | null {
  const zone = num(s.targetValue);
  switch (s.targetType) {
    case 'speed': {
      const low = num(s.customTargetSpeedLow);
      const high = num(s.customTargetSpeedHigh);
      if (low && high) {
        // En bici se piensa en km/h; a pie, en ritmo (más velocidad = menos min/km).
        if (sport === 'cycling') return `${(low * 3.6).toFixed(0)}–${(high * 3.6).toFixed(0)} km/h`;
        return `${pace(high)}–${pace(low)} /km`;
      }
      return zone ? `Zona ${zone} de ritmo` : null;
    }
    case 'heartRate': {
      const low = num(s.customTargetHeartRateLow);
      const high = num(s.customTargetHeartRateHigh);
      if (low && high) {
        return low > 100 && high > 100 ? `${low - 100}–${high - 100} ppm` : `${low}–${high}% FC máx`;
      }
      return zone ? `Zona ${zone} de FC` : null;
    }
    case 'power': {
      const low = num(s.customTargetPowerLow);
      const high = num(s.customTargetPowerHigh);
      if (low && high) return `${power(low)} – ${power(high)}`;
      return zone ? `Zona ${zone} de potencia` : null;
    }
    case 'cadence': {
      const low = num(s.customTargetCadenceLow);
      const high = num(s.customTargetCadenceHigh);
      if (low && high) return `${low}–${high} ${sport === 'cycling' ? 'rpm' : 'pasos/min'}`;
      return null;
    }
    default:
      return null;
  }
}
