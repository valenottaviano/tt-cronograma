import { differenceInCalendarDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

/** El naranja de Strava: sólo para lo que es de Strava (botón, "Ver en Strava"). */
export const STRAVA_ORANGE = '#FC4C02';

export const stravaActivityUrl = (id: string) => `https://www.strava.com/activities/${id}`;

const SPORT_LABELS: Record<string, string> = {
  Run: 'Carrera',
  TrailRun: 'Trail',
  VirtualRun: 'Cinta',
  Walk: 'Caminata',
  Hike: 'Trekking',
  Ride: 'Bici',
  MountainBikeRide: 'MTB',
  GravelRide: 'Gravel',
  VirtualRide: 'Rodillo',
  EBikeRide: 'E-bike',
  Swim: 'Natación',
  WeightTraining: 'Gimnasio',
  Workout: 'Entrenamiento',
  Crossfit: 'Crossfit',
  Yoga: 'Yoga',
};

export const sportLabel = (sport: string) => SPORT_LABELS[sport] ?? sport.replace(/([a-z])([A-Z])/g, '$1 $2');

const isFootSport = (sport: string) => ['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike'].includes(sport);
const isBikeSport = (sport: string) => sport.includes('Ride');

/** "12,4" */
export const formatKm = (km: number, decimals = 1) =>
  km.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const formatInt = (n: number) => Math.round(n).toLocaleString('es-AR');

/** "1:18:32" o "47:10" */
export function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  const mm = String(m).padStart(h ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "3 h 42 min" o "48 min" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/**
 * La velocidad como la piensa cada deporte: ritmo (min/km) a pie, km/h en bici.
 * Para el resto no se muestra.
 */
export function formatSpeed(sport: string, metersPerSecond: number): { value: string; unit: string } | null {
  if (metersPerSecond <= 0) return null;
  if (isFootSport(sport)) {
    const secPerKm = 1000 / metersPerSecond;
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    return s === 60 ? { value: `${m + 1}:00`, unit: '/km' } : { value: `${m}:${String(s).padStart(2, '0')}`, unit: '/km' };
  }
  if (isBikeSport(sport)) return { value: formatKm(metersPerSecond * 3.6), unit: 'km/h' };
  return null;
}

/** "Hoy 07:10", "Ayer 18:40", "Lun 20 oct · 18:40" */
export function formatWhen(localIso: string, today: Date): string {
  const [datePart, time] = localIso.split('T');
  const [y, mo, d] = datePart.split('-').map(Number);
  const date = new Date(y, mo - 1, d);
  const diff = differenceInCalendarDays(today, date);
  if (diff === 0) return `Hoy ${time}`;
  if (diff === 1) return `Ayer ${time}`;
  const label = format(date, diff < 7 ? 'EEEE' : "EEE d 'de' MMM", { locale: es });
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} · ${time}`;
}

/** Decodifica la polyline de Strava (formato de Google, precisión 5). */
export function decodePolyline(encoded: string): { lat: number; lon: number }[] {
  const points: { lat: number; lon: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    for (const axis of [0, 1]) {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) lat += delta;
      else lng += delta;
    }
    points.push({ lat: lat / 1e5, lon: lng / 1e5 });
  }
  return points;
}
