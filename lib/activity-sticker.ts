import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { StravaLatest } from '@/lib/coachApi';
import {
  decodePolyline, formatClock, formatInt, formatKm, formatSpeed, sportLabel,
} from '@/lib/strava-format';

/**
 * Stickers para compartir una actividad en las historias de Instagram: PNG con
 * fondo transparente, para pegarlos sobre una foto. Se dibujan en un canvas en
 * el celular, así que no cuestan ninguna llamada a la API.
 *
 * Llevan siempre el logo de Grupo TT y nunca la marca de Strava (pedido de Valentin).
 */

export type StickerDesign =
  | 'line' | 'route' | 'route-km' | 'giant' | 'day' | 'numbers' | 'classic' | 'banner' | 'ticket' | 'full';

export type StickerColor = 'white' | 'black' | 'red';

export type StickerField = 'distance' | 'time' | 'pace' | 'elevation' | 'heartrate';

export interface StickerOptions {
  design: StickerDesign;
  color: StickerColor;
  fields: StickerField[];
}

/** El logo listo para dibujar: la imagen original o un canvas con el logo teñido. */
type LogoSource = HTMLImageElement | HTMLCanvasElement;

export interface StickerAssets {
  fontFamily: string;
  logo: HTMLImageElement | null;
}

/** De menos a más información. `needsRoute`: sin recorrido (gimnasio) no se ofrece. */
export const STICKER_DESIGNS: { id: StickerDesign; label: string; needsRoute: boolean }[] = [
  { id: 'line', label: 'Línea', needsRoute: false },
  { id: 'route', label: 'Trazado', needsRoute: true },
  { id: 'route-km', label: 'Trazado + km', needsRoute: true },
  { id: 'giant', label: 'Gigante', needsRoute: false },
  { id: 'day', label: 'Día', needsRoute: false },
  { id: 'numbers', label: 'Números', needsRoute: false },
  { id: 'classic', label: 'Clásico', needsRoute: true },
  { id: 'banner', label: 'Banner', needsRoute: true },
  { id: 'ticket', label: 'Ticket', needsRoute: false },
  { id: 'full', label: 'Completo', needsRoute: false },
];

export const STICKER_COLORS: { id: StickerColor; label: string; hex: string }[] = [
  { id: 'white', label: 'Blanco', hex: '#FFFFFF' },
  { id: 'black', label: 'Negro', hex: '#0A0A0A' },
  { id: 'red', label: 'Rojo TT', hex: '#ED241F' },
];

export const STICKER_FIELD_LABELS: Record<StickerField, string> = {
  distance: 'Distancia',
  time: 'Tiempo',
  pace: 'Ritmo',
  elevation: 'Desnivel',
  heartrate: 'Pulso',
};

interface Stat {
  key: StickerField;
  label: string;
  value: string;
  unit: string;
}

/** Los datos que tiene esta actividad (un gimnasio no tiene distancia ni ritmo). */
export function availableStats(a: StravaLatest): Stat[] {
  const speed = formatSpeed(a.sportType, a.averageSpeed);
  const stats: (Stat | false)[] = [
    a.distance > 0 && { key: 'distance', label: 'Distancia', value: formatKm(a.distance / 1000, 2), unit: 'km' },
    { key: 'time', label: 'Tiempo', value: formatClock(a.movingTime), unit: '' },
    !!speed && {
      key: 'pace', label: speed.unit === '/km' ? 'Ritmo' : 'Velocidad', value: speed.value, unit: speed.unit,
    },
    a.elevationGain >= 1 && { key: 'elevation', label: 'Desnivel', value: `+${formatInt(a.elevationGain)}`, unit: 'm' },
    !!a.averageHeartrate && {
      key: 'heartrate', label: 'Pulso', value: String(Math.round(a.averageHeartrate ?? 0)), unit: 'ppm',
    },
  ];
  return stats.filter(Boolean) as Stat[];
}

// --- Dibujo -------------------------------------------------------------------

type Ctx = CanvasRenderingContext2D;

interface Painter {
  ctx: Ctx;
  color: string;
  font: (size: number, weight?: number, italic?: boolean) => string;
  logo: LogoSource | null;
}

const W = 1080;

/**
 * Dibuja el sticker y deja el canvas del tamaño justo. `scale` achica todo
 * (para las miniaturas del selector) sin cambiar el diseño.
 */
export function drawSticker(
  canvas: HTMLCanvasElement,
  activity: StravaLatest,
  options: StickerOptions,
  assets: StickerAssets,
  scale = 1,
): void {
  const color = STICKER_COLORS.find((c) => c.id === options.color)?.hex ?? '#FFFFFF';
  const all = availableStats(activity);
  const stats = all.filter((s) => options.fields.includes(s.key));
  const route = activity.polyline ? decodePolyline(activity.polyline) : [];
  // El logo de Grupo TT va siempre (pedido de Valentin): no es una opción.
  const logo = tintedLogo(assets.logo, options.color);

  const layout = LAYOUTS[options.design];
  const { width, height } = layout.size(stats, logo !== null);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.textBaseline = 'alphabetic';

  const p: Painter = {
    ctx,
    color,
    font: (size, weight = 800, italic = false) => `${italic ? 'italic ' : ''}${weight} ${size}px ${assets.fontFamily}`,
    logo,
  };
  layout.draw(p, { activity, stats, route, width, height });
}

interface DrawInput {
  activity: StravaLatest;
  stats: Stat[];
  route: { lat: number; lon: number }[];
  width: number;
  height: number;
}

interface Layout {
  size: (stats: Stat[], hasLogo: boolean) => { width: number; height: number };
  draw: (p: Painter, input: DrawInput) => void;
}

const LOGO_H = 90;

const LAYOUTS: Record<StickerDesign, Layout> = {
  // Una sola fila de datos, separados por barras: lo más discreto.
  line: {
    size: () => ({ width: 1800, height: 240 }),
    draw: (p, { stats }) => {
      const ctx = p.ctx;
      const items = stats.map((s) => ({ value: s.value, unit: s.unit ? ` ${s.unit}` : '' }));
      const gap = 70;
      const measure = (size: number) => {
        let total = 0;
        for (const it of items) {
          ctx.font = p.font(size, 900, true);
          total += ctx.measureText(it.value).width;
          ctx.font = p.font(size * 0.42, 700);
          total += it.unit ? ctx.measureText(it.unit).width : 0;
        }
        return total + gap * Math.max(items.length - 1, 0);
      };
      const logoW = p.logo ? (p.logo.width / p.logo.height) * 110 + gap : 0;
      let size = 120;
      while (size > 40 && measure(size) + logoW > 1740) size -= 4;
      let x = (1800 - measure(size) - logoW) / 2;
      const baseline = 120 + size * 0.36;
      if (p.logo) {
        drawLogo(p, x, 65, 'left', 110);
        x += logoW;
      }
      items.forEach((it, i) => {
        drawValue(p, it.value, it.unit, x, baseline, size, 'left');
        ctx.font = p.font(size, 900, true);
        x += ctx.measureText(it.value).width;
        ctx.font = p.font(size * 0.42, 700);
        x += it.unit ? ctx.measureText(it.unit).width : 0;
        if (i < items.length - 1) {
          ctx.globalAlpha = 0.6;
          ctx.fillRect(x + gap / 2 - 3, baseline - size * 0.72, 6, size * 0.8);
          ctx.globalAlpha = 1;
          x += gap;
        }
      });
    },
  },

  // El día bien grande, como un diario de entrenamiento.
  day: {
    size: (_s, logo) => ({ width: W, height: 820 + (logo ? LOGO_H + 40 : 0) }),
    draw: (p, { activity }) => {
      const ctx = p.ctx;
      const date = new Date(`${activity.startDateLocal}:00`);
      const weekday = format(date, 'EEEE', { locale: es }).toUpperCase();
      ctx.textAlign = 'center';
      ctx.font = p.font(fitText(p, weekday, W - 80, 250, 900, true), 900, true);
      ctx.fillText(weekday, W / 2, 260);
      ctx.font = p.font(54, 700);
      ctx.globalAlpha = 0.85;
      ctx.fillText(format(date, "d 'de' MMMM", { locale: es }).toUpperCase(), W / 2, 350);
      ctx.globalAlpha = 1;
      ctx.font = p.font(fitText(p, activity.name, W - 120, 64, 700), 700);
      ctx.fillText(activity.name, W / 2, 470);
      const main = activity.distance > 0
        ? { v: formatKm(activity.distance / 1000), u: ' km' }
        : { v: formatClock(activity.movingTime), u: '' };
      drawValue(p, main.v, main.u, W / 2, 700, 200, 'center');
      if (p.logo) drawLogo(p, W / 2, 790, 'center');
    },
  },

  // Sólo el recorrido.
  route: {
    size: (_s, logo) => ({ width: W, height: W + (logo ? LOGO_H + 40 : 0) }),
    draw: (p, { route, height }) => {
      drawRoute(p, route, { x: 60, y: 60, w: W - 120, h: W - 120 }, 22);
      if (p.logo) drawLogo(p, W / 2, height - LOGO_H - 30, 'center');
    },
  },

  // Recorrido y los km bien grandes.
  'route-km': {
    size: (_s, logo) => ({ width: W, height: 1000 + 260 + (logo ? LOGO_H + 50 : 0) }),
    draw: (p, { route, activity }) => {
      drawRoute(p, route, { x: 80, y: 60, w: W - 160, h: 880 }, 20);
      const km = activity.distance > 0 ? formatKm(activity.distance / 1000) : formatClock(activity.movingTime);
      const unit = activity.distance > 0 ? ' km' : '';
      drawValue(p, km, unit, W / 2, 1180, 210, 'center');
      if (p.logo) drawLogo(p, W / 2, 1260, 'center');
    },
  },

  // Un número gigante: los km (o el tiempo si no hubo distancia).
  giant: {
    size: (_s, logo) => ({ width: W, height: 760 + (logo ? LOGO_H + 40 : 0) }),
    draw: (p, { activity }) => {
      const hasKm = activity.distance > 0;
      const value = hasKm ? formatKm(activity.distance / 1000) : formatClock(activity.movingTime);
      const size = fitText(p, value, 900, 420, 900, true);
      p.ctx.textAlign = 'center';
      p.ctx.font = p.font(size, 900, true);
      p.ctx.fillText(value, W / 2, 470);
      p.ctx.font = p.font(76, 800, true);
      p.ctx.fillText(hasKm ? 'KILÓMETROS' : 'DE ENTRENAMIENTO', W / 2, 580);
      p.ctx.font = p.font(44, 600);
      p.ctx.globalAlpha = 0.85;
      p.ctx.fillText(sportLabel(activity.sportType).toUpperCase(), W / 2, 670);
      p.ctx.globalAlpha = 1;
      if (p.logo) drawLogo(p, W / 2, 720, 'center');
    },
  },

  // Distancia grande y una fila con el resto.
  numbers: {
    size: (stats, logo) => ({ width: W, height: (stats.length > 1 ? 640 : 400) + (logo ? LOGO_H + 50 : 0) }),
    draw: (p, { stats }) => {
      const [main, ...rest] = stats;
      if (main) {
        drawValue(p, main.value, main.unit ? ` ${main.unit}` : '', W / 2, 300, 240, 'center');
        drawLabel(p, main.label, W / 2, 370, 'center');
      }
      const row = rest.slice(0, 4);
      const colW = W / Math.max(row.length, 1);
      row.forEach((s, i) => {
        const cx = colW * i + colW / 2;
        drawValue(p, s.value, s.unit ? ` ${s.unit}` : '', cx, 540, fitStat(p, s, colW - 30, 96), 'center');
        drawLabel(p, s.label, cx, 600, 'center', 34);
      });
      if (p.logo) drawLogo(p, W / 2, stats.length > 1 ? 650 : 410, 'center');
    },
  },

  // Como el de Strava: recorrido arriba y los datos uno debajo del otro.
  classic: {
    size: (stats, logo) => ({ width: W, height: 860 + stats.length * 200 + (logo ? LOGO_H + 60 : 20) }),
    draw: (p, { route, stats }) => {
      drawRoute(p, route, { x: 140, y: 40, w: W - 280, h: 760 }, 18);
      stats.forEach((s, i) => {
        const y = 860 + i * 200;
        drawLabel(p, s.label, W / 2, y + 50, 'center', 42);
        drawValue(p, s.value, s.unit ? ` ${s.unit}` : '', W / 2, y + 160, 112, 'center');
      });
      if (p.logo) drawLogo(p, W / 2, 860 + stats.length * 200 + 20, 'center');
    },
  },

  // Apaisado: recorrido a la izquierda, datos a la derecha.
  banner: {
    size: () => ({ width: 1600, height: 620 }),
    draw: (p, { route, stats }) => {
      drawRoute(p, route, { x: 40, y: 40, w: 540, h: 540 }, 16);
      p.ctx.globalAlpha = 0.5;
      p.ctx.fillRect(640, 70, 6, 480);
      p.ctx.globalAlpha = 1;
      const shown = stats.slice(0, 4);
      shown.forEach((s, i) => {
        const col = i % 2;
        const rowI = Math.floor(i / 2);
        const x = 710 + col * 440;
        const y = (p.logo ? 70 : 120) + rowI * 230;
        drawLabel(p, s.label, x, y + 40, 'left', 38);
        drawValue(p, s.value, s.unit ? ` ${s.unit}` : '', x, y + 150, fitStat(p, s, 420, 104), 'left');
      });
      if (p.logo) drawLogo(p, 710, 500, 'left', 80);
    },
  },

  // Texto alineado a la izquierda, como un comprobante de la salida.
  ticket: {
    size: (stats) => ({ width: W, height: 470 + Math.ceil(stats.length / 2) * 190 }),
    draw: (p, { activity, stats, route }) => {
      const ctx = p.ctx;
      if (p.logo) drawLogo(p, 60, 50, 'left', 80);
      else {
        ctx.textAlign = 'left';
        ctx.font = p.font(64, 900, true);
        ctx.fillText('GRUPO TT', 60, 120);
      }
      if (route.length > 1) drawRoute(p, route, { x: W - 300, y: 40, w: 240, h: 240 }, 9);
      ctx.textAlign = 'left';
      ctx.font = p.font(40, 600);
      ctx.globalAlpha = 0.85;
      ctx.fillText(whenLabel(activity).toUpperCase(), 60, 250);
      ctx.globalAlpha = 1;
      ctx.font = p.font(fitText(p, activity.name, W - 120, 76, 800), 800);
      ctx.fillText(activity.name, 60, 340);
      ctx.fillRect(60, 390, W - 120, 5);
      stats.forEach((s, i) => {
        const x = 60 + (i % 2) * 500;
        const y = 440 + Math.floor(i / 2) * 190;
        drawLabel(p, s.label, x, y + 40, 'left', 36);
        drawValue(p, s.value, s.unit ? ` ${s.unit}` : '', x, y + 140, fitStat(p, s, 460, 96), 'left');
      });
    },
  },

  // Todo: marca, nombre, fecha, recorrido y la grilla de datos.
  full: {
    size: (stats) => ({ width: W, height: 500 + 640 + Math.ceil(stats.length / 2) * 220 }),
    draw: (p, { activity, stats, route }) => {
      const ctx = p.ctx;
      ctx.textAlign = 'center';
      if (p.logo) drawLogo(p, W / 2, 40, 'center', 110);
      else {
        ctx.font = p.font(80, 900, true);
        ctx.fillText('GRUPO TT', W / 2, 130);
      }
      ctx.font = p.font(42, 700);
      ctx.globalAlpha = 0.85;
      ctx.fillText(`${sportLabel(activity.sportType).toUpperCase()} · ${whenLabel(activity).toUpperCase()}`, W / 2, 260);
      ctx.globalAlpha = 1;
      ctx.font = p.font(fitText(p, activity.name, W - 120, 84, 900, true), 900, true);
      ctx.fillText(activity.name, W / 2, 370);
      const routeTop = 440;
      if (route.length > 1) drawRoute(p, route, { x: 160, y: routeTop, w: W - 320, h: 600 }, 16);
      else drawSportMark(p, activity.sportType, W / 2, routeTop + 300);
      stats.forEach((s, i) => {
        const cx = (i % 2 === 0 ? W / 4 : (3 * W) / 4) + (stats.length % 2 === 1 && i === stats.length - 1 ? W / 4 : 0);
        const y = routeTop + 660 + Math.floor(i / 2) * 220;
        drawValue(p, s.value, s.unit ? ` ${s.unit}` : '', cx, y + 100, fitStat(p, s, W / 2 - 60, 110), 'center');
        drawLabel(p, s.label, cx, y + 160, 'center', 38);
      });
    },
  },
};

// --- Piezas ---------------------------------------------------------------------

/** Fecha fija ("jue 22 oct · 18:40"): un sticker se puede compartir días después, y "Ayer" mentiría. */
function whenLabel(a: StravaLatest): string {
  const date = new Date(`${a.startDateLocal}:00`);
  return `${format(date, 'EEE d MMM', { locale: es })} · ${a.startDateLocal.slice(11, 16)}`;
}

/** El recorrido escalado a la caja, sin deformarlo (corrige la longitud por la latitud). */
function drawRoute(
  p: Painter,
  points: { lat: number; lon: number }[],
  box: { x: number; y: number; w: number; h: number },
  lineWidth: number,
): void {
  if (points.length < 2) return;
  const k = Math.cos((points[0].lat * Math.PI) / 180);
  const xs = points.map((pt) => pt.lon * k);
  const ys = points.map((pt) => -pt.lat);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const s = Math.min(box.w / (maxX - minX || 1), box.h / (maxY - minY || 1));
  const offX = box.x + (box.w - (maxX - minX) * s) / 2;
  const offY = box.y + (box.h - (maxY - minY) * s) / 2;
  const ctx = p.ctx;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  xs.forEach((x, i) => {
    const px = offX + (x - minX) * s;
    const py = offY + (ys[i] - minY) * s;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  // La salida, como un punto.
  ctx.beginPath();
  ctx.arc(offX + (xs[0] - minX) * s, offY + (ys[0] - minY) * s, lineWidth * 1.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawValue(p: Painter, value: string, unit: string, x: number, y: number, size: number, align: CanvasTextAlign) {
  const ctx = p.ctx;
  ctx.font = p.font(size, 900, true);
  const valueW = ctx.measureText(value).width;
  ctx.font = p.font(size * 0.42, 700);
  const unitW = unit ? ctx.measureText(unit).width : 0;
  const total = valueW + unitW;
  const start = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.textAlign = 'left';
  ctx.font = p.font(size, 900, true);
  ctx.fillText(value, start, y);
  if (unit) {
    ctx.font = p.font(size * 0.42, 700);
    ctx.fillText(unit, start + valueW, y);
  }
}

function drawLabel(p: Painter, text: string, x: number, y: number, align: CanvasTextAlign, size = 40) {
  const ctx = p.ctx;
  ctx.textAlign = align;
  ctx.font = p.font(size, 700);
  ctx.globalAlpha = 0.85;
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.globalAlpha = 1;
}

function drawLogo(p: Painter, x: number, y: number, align: 'left' | 'center', h = LOGO_H) {
  if (!p.logo) return;
  const w = (p.logo.width / p.logo.height) * h;
  p.ctx.drawImage(p.logo, align === 'center' ? x - w / 2 : x, y, w, h);
}

/** Sin recorrido: una marca grande con el nombre del deporte. */
function drawSportMark(p: Painter, sport: string, cx: number, cy: number) {
  const ctx = p.ctx;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, 200, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = p.font(fitText(p, sportLabel(sport).toUpperCase(), 340, 90, 900, true), 900, true);
  ctx.fillText(sportLabel(sport).toUpperCase(), cx, cy + 32);
}

/** El tamaño de letra más grande (hasta `max`) con el que el texto entra en `width`. */
function fitText(p: Painter, text: string, width: number, max: number, weight: number, italic = false): number {
  p.ctx.font = p.font(max, weight, italic);
  const w = p.ctx.measureText(text).width;
  return w <= width ? max : Math.floor((max * width) / w);
}

function fitStat(p: Painter, s: Stat, width: number, max: number): number {
  const full = `${s.value}${s.unit ? ` ${s.unit}` : ''}`;
  // La unidad va más chica: se mide con el valor y deja un poco de margen.
  return Math.min(max, fitText(p, full, width * 1.15, max, 900, true));
}

/** El logo de Grupo TT en el color elegido. En blanco va el original (T roja). */
const tintCache = new Map<string, HTMLCanvasElement>();

function tintedLogo(logo: HTMLImageElement | null, color: StickerColor): LogoSource | null {
  if (!logo) return null;
  if (color === 'white') return logo;
  const key = `${logo.src}|${color}`;
  let c = tintCache.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = logo.naturalWidth;
    c.height = logo.naturalHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return logo;
    ctx.drawImage(logo, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = STICKER_COLORS.find((x) => x.id === color)?.hex ?? '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    tintCache.set(key, c);
  }
  return c;
}
