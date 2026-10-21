import Image from 'next/image';
import Link from 'next/link';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bandage, ChevronRight, Flag, Moon, Plane, QrCode, Receipt, TreePalm, User, UserRoundPen } from 'lucide-react';
import { InstallAppCard } from '@/components/app/install-app-card';
import { TTCCredencialDialog } from '@/components/tt-credencial-dialog';
import { PaymentReminder } from '@/components/payment-reminder';
import { MobileDayCard } from '@/components/schedule-view';
import { getAbsences, getMe, getMonthStatus, getRaces, getSchedules, type AbsenceType } from '@/lib/coachApi';
import { loadForAthlete, requireAthlete } from '@/lib/athlete-app';
import { listInSpanish, missingProfileFields } from '@/lib/profile-completion';
import {
  dayOn, isoWeekOf, isTrainingDay, parseLocalDate, scheduleTotalDays, sessionTitle, summarize,
  todayInArgentina,
} from '@/lib/athlete-days';
import { cn } from '@/lib/utils';

const ABSENCE_COPY: Record<AbsenceType, { label: string; icon: typeof Bandage; cls: string }> = {
  INJURY: { label: 'Estás con una lesión', icon: Bandage, cls: 'border-orange-500/30 bg-orange-500/10 text-orange-300' },
  VACATION: { label: 'Estás de vacaciones', icon: TreePalm, cls: 'border-sky-500/30 bg-sky-500/10 text-sky-300' },
  TRAVEL: { label: 'Estás de viaje', icon: Plane, cls: 'border-teal-500/30 bg-teal-500/10 text-teal-300' },
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function InicioPage() {
  const session = await requireAthlete();
  const now = new Date();
  const today = todayInArgentina(now);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Sólo la planilla puede cerrar la sesión (401); el resto, si falla, no se muestra.
  const data = await loadForAthlete(() =>
    Promise.all([
      getSchedules(session.token),
      getMe(session.token).catch(() => null),
      getMonthStatus(year, month, session.token).catch(() => null),
      getRaces(session.token).catch(() => []),
      getAbsences(session.token).catch(() => []),
    ]),
  );
  const [scheduleData, profile, monthStatus, races, absences] = data ?? [null, null, null, [], []];
  const schedules = scheduleData?.schedules ?? [];

  const todayDay = dayOn(schedules, today);
  const tomorrow = addDays(today, 1);
  const tomorrowDay = dayOn(schedules, tomorrow);

  const week = isoWeekOf(today);
  const weekSummary = summarize(schedules, week.start, week.end);
  const remaining = summarize(schedules, today, week.end);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(week.start, i));

  const nextRace = races
    .filter((r) => r.enrolled && parseLocalDate(r.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const daysToRace = nextRace ? differenceInCalendarDays(parseLocalDate(nextRace.date), today) : null;

  const currentAbsence = absences.find(
    (a) => parseLocalDate(a.startDate) <= today && today < parseLocalDate(a.endDate),
  );

  const coachNote = schedules.find((s) => {
    const start = parseLocalDate(s.period.startDate);
    return start <= today && differenceInCalendarDays(today, start) < scheduleTotalDays(s);
  })?.coachNoteExternal;

  const missingProfile = profile ? missingProfileFields(profile) : [];

  const firstName = cap((session.name ?? '').split(' ')[0]?.toLowerCase() ?? '');

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-6 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
      {/* ── Saludo ── */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {format(today, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <h1 className="truncate text-3xl font-black italic tracking-tight">Hola, {firstName}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          {monthStatus && !monthStatus.paid && (
            <PaymentReminder
              year={year}
              month={month}
              monthLabel={format(today, 'MMMM yyyy', { locale: es })}
              paid={false}
            />
          )}
          {/* La credencial es lo que se saca en el mostrador de un comercio: a un toque. */}
          <TTCCredencialDialog
            dni={session.dni}
            trigger={
              <button
                type="button"
                aria-label="Mi credencial TT"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-foreground hover:border-brand-orange"
              >
                <QrCode className="h-4 w-4" />
              </button>
            }
          />
          <Link
            href="/perfil"
            aria-label="Mi perfil"
            className="relative h-10 w-10 overflow-hidden rounded-full border border-neutral-700 bg-neutral-800"
          >
            {profile?.avatarKey ? (
              <Image src="/api/client/auth/avatar" alt="Mi perfil" fill className="object-cover" unoptimized />
            ) : (
              <User className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
          </Link>
        </div>
      </header>

      {missingProfile.length > 0 && (
        <Link
          href="/perfil#datos"
          className="flex items-center gap-3 rounded-2xl border border-red-600/50 bg-red-600/15 px-4 py-3 transition-colors hover:bg-red-600/20"
        >
          <UserRoundPen className="h-5 w-5 shrink-0 text-red-500" />
          <p className="flex-1 text-sm">
            <span className="font-semibold text-red-400">Completá tu perfil.</span>{' '}
            Te falta {listInSpanish(missingProfile)}.
          </p>
          <ChevronRight className="h-4 w-4 shrink-0 text-red-400" />
        </Link>
      )}

      {/* Recordatorio, no reclamo: se va solo cuando el atleta notifica el pago del mes. */}
      {monthStatus && !monthStatus.paid && (
        <PaymentReminder
          year={year}
          month={month}
          monthLabel={format(today, 'MMMM yyyy', { locale: es })}
          trigger={
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left transition-colors hover:bg-amber-500/15"
            >
              <Receipt className="h-5 w-5 shrink-0 text-amber-400" />
              <p className="flex-1 text-sm">
                <span className="font-semibold text-amber-300">Recordatorio de cuota.</span>{' '}
                Cuando pagues {format(today, 'MMMM', { locale: es })}, subí el comprobante desde acá. ¡Gracias!
              </p>
              <ChevronRight className="h-4 w-4 shrink-0 text-amber-400" />
            </button>
          }
        />
      )}

      {currentAbsence && (() => {
        const copy = ABSENCE_COPY[currentAbsence.type];
        const Icon = copy.icon;
        return (
          <div className={cn('flex items-center gap-3 rounded-2xl border px-4 py-3', copy.cls)}>
            <Icon className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">{copy.label}</span>
              {' · vuelve el '}
              {format(parseLocalDate(currentAbsence.endDate), "d 'de' MMMM", { locale: es })}
            </p>
          </div>
        );
      })()}

      {/* ── Hoy ── */}
      <section className="space-y-2">
        <SectionTitle title="Hoy" href="/entrenamiento" linkLabel="Ver semana" />
        {todayDay !== undefined ? (
          <MobileDayCard date={format(today, 'yyyy-MM-dd')} day={todayDay} defaultOpen />
        ) : (
          <div className="rounded-2xl border border-border bg-neutral-900 px-4 py-5 text-sm text-muted-foreground">
            Todavía no hay planilla para hoy. Cuando tu coach la publique, aparece acá.
          </div>
        )}
        {tomorrowDay !== undefined && (
          <p className="flex items-center gap-1.5 px-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Mañana:</span>
            {isTrainingDay(tomorrowDay) ? (
              <span className="truncate">{sessionTitle(tomorrowDay)}</span>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" /> Descanso
              </>
            )}
          </p>
        )}
      </section>

      {coachNote && (
        <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-orange">Mensaje de Rober</p>
          <p className="text-sm leading-relaxed">{coachNote}</p>
        </div>
      )}

      {/* ── Semana ── */}
      <section className="space-y-2">
        <SectionTitle title="Tu semana" />
        <div className="space-y-4 rounded-2xl border border-border bg-neutral-900 p-4">
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map((d) => {
              const day = dayOn(schedules, d);
              const training = isTrainingDay(day);
              const isToday = d.getTime() === today.getTime();
              const past = d < today;
              return (
                <div key={d.toISOString()} className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase',
                      isToday ? 'text-brand-orange' : 'text-muted-foreground',
                    )}
                  >
                    {format(d, 'EEEEE', { locale: es })}
                  </span>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                      training ? 'bg-brand-orange text-white' : 'bg-neutral-800 text-neutral-500',
                      training && past && 'opacity-50',
                      isToday && 'ring-2 ring-brand-orange ring-offset-2 ring-offset-neutral-900',
                    )}
                  >
                    {format(d, 'd')}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 divide-x divide-border text-center">
            <Stat value={String(weekSummary.sessions)} label="sesiones" />
            <Stat value={String(weekSummary.restDays)} label="descansos" />
            <Stat value={String(remaining.sessions)} label="te quedan" />
          </div>
        </div>
      </section>

      {/* ── Próxima carrera ── */}
      <section className="space-y-2">
        <SectionTitle title="Próxima carrera" href="/mis-carreras" linkLabel="Mis carreras" />
        {nextRace && daysToRace !== null ? (
          <Link
            href="/mis-carreras"
            className="flex items-center gap-4 rounded-2xl border border-border bg-neutral-900 p-4 transition-colors hover:bg-neutral-800/70"
          >
            <div className="flex w-16 shrink-0 flex-col items-center">
              <span className="text-3xl font-black italic leading-none text-brand-orange">{daysToRace}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {daysToRace === 1 ? 'día' : 'días'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{nextRace.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {format(parseLocalDate(nextRace.date), "d 'de' MMMM", { locale: es })}
                {nextRace.distance && ` · ${nextRace.distance}`}
                {nextRace.location && ` · ${nextRace.location}`}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-600" />
          </Link>
        ) : (
          <Link
            href="/mis-carreras"
            className="flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground transition-colors hover:bg-neutral-900"
          >
            <Flag className="h-5 w-5 shrink-0" />
            <span className="flex-1">No estás anotado a ninguna carrera. Elegí tu próximo objetivo.</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        )}
      </section>

      <InstallAppCard />
    </main>
  );
}

function SectionTitle({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between px-1">
      <h2 className="text-sm font-black uppercase italic tracking-wider">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-black italic leading-tight">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
