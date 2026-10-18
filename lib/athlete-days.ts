import { addDays, differenceInCalendarDays, endOfISOWeek, parseISO, startOfISOWeek } from 'date-fns';
import type { Day, Schedule } from '@/lib/coachApi';

/**
 * Cuentas sobre la planilla del atleta que comparten la pantalla de Inicio y
 * la de Entrenamiento: qué toca un día, y cuánto suma una semana o un mes.
 *
 * Por ahora es todo lo PLANIFICADO: la app no registra lo que el atleta hizo.
 */

/** Cualquier `startDate` se toma como medianoche local, venga con la zona que venga. */
export function parseLocalDate(dateStr: string): Date {
  return parseISO(dateStr.slice(0, 10) + 'T00:00:00');
}

/**
 * Hoy en Argentina, como medianoche local. En Vercel el servidor corre en UTC:
 * de 21 a 24 hs de Argentina ya sería «mañana» si se usara `new Date()` tal cual.
 */
export function todayInArgentina(now: Date = new Date()): Date {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(now);
  return parseLocalDate(ymd);
}

export function scheduleTotalDays(s: Schedule): number {
  return s.period.totalDays ?? (s.period.type === 'BIWEEKLY' ? 14 : 7);
}

/** `extras` son parte de la misma sesión que el principal («Fondo + Movilidad»). */
export function dayExtras(day: Day | undefined) {
  return (day?.extras ?? []).filter((e) => e.workout);
}

export function sessionTitle(day: Day | undefined): string {
  const names = [day?.workout?.name, ...dayExtras(day).map((e) => e.workout.name)].filter(Boolean);
  return names.length > 0 ? names.join(' + ') : '—';
}

/** Km de la sesión: el principal más los adicionales. Los opcionales no suman. */
export function sessionKm(day: Day | undefined): number {
  if (!day || day.isRest) return 0;
  return [day.variant?.km, ...dayExtras(day).map((e) => e.variant?.km)]
    .reduce<number>((sum, km) => sum + (km ?? 0), 0);
}

export function isTrainingDay(day: Day | undefined): day is Day {
  return !!day && !day.isRest && !!day.workout;
}

/**
 * Lo que toca en `date`, o `undefined` si ninguna planilla publicada la cubre.
 * Si dos planillas se pisan, gana la que empezó más tarde.
 */
export function dayOn(schedules: Schedule[], date: Date): Day | undefined {
  let found: { day: Day | undefined; start: Date } | null = null;
  for (const s of schedules) {
    const start = parseLocalDate(s.period.startDate);
    const idx = differenceInCalendarDays(date, start);
    if (idx < 0 || idx >= scheduleTotalDays(s)) continue;
    if (found && found.start > start) continue;
    found = { day: s.days.find((d) => d.dayIndex === idx), start };
  }
  return found?.day;
}

export interface PlannedSummary {
  /** Días con entrenamiento. */
  sessions: number;
  km: number;
  /** Días cubiertos por alguna planilla. */
  plannedDays: number;
}

export function summarize(schedules: Schedule[], from: Date, to: Date): PlannedSummary {
  const summary: PlannedSummary = { sessions: 0, km: 0, plannedDays: 0 };
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const day = dayOn(schedules, d);
    if (!day) continue;
    summary.plannedDays += 1;
    if (isTrainingDay(day)) {
      summary.sessions += 1;
      summary.km += sessionKm(day);
    }
  }
  return summary;
}

export function isoWeekOf(date: Date): { start: Date; end: Date } {
  return { start: startOfISOWeek(date), end: endOfISOWeek(date) };
}

export function formatKm(km: number): string {
  return km % 1 === 0 ? String(km) : km.toFixed(1).replace('.', ',');
}
