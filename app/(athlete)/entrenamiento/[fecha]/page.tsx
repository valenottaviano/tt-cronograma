import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addDays, format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, ChevronLeft, ChevronRight, Moon, Plus } from 'lucide-react';
import { AttachmentLinks, CoachNote } from '@/components/schedule-view';
import { RouteMap } from '@/components/app/route-map';
import { gpxProxyUrl } from '@/lib/gpx-proxy-url';
import { getSchedules, type OptionalDay, type Variant, type Workout } from '@/lib/coachApi';
import { loadForAthlete, requireAthlete } from '@/lib/athlete-app';
import { dayExtras, dayOn, isTrainingDay, parseLocalDate, sessionTitle, todayInArgentina } from '@/lib/athlete-days';

interface Props {
  params: Promise<{ fecha: string }>;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** El detalle de un día de la planilla: todo lo que en la tarjeta queda plegado. */
export default async function DiaPage({ params }: Props) {
  const { fecha } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) notFound();
  const date = parseLocalDate(fecha);
  if (!isValid(date)) notFound();

  const session = await requireAthlete();
  const data = await loadForAthlete(() => getSchedules(session.token));
  const schedules = data?.schedules ?? [];
  const day = dayOn(schedules, date);

  const prev = addDays(date, -1);
  const next = addDays(date, 1);
  const isToday = date.getTime() === todayInArgentina().getTime();
  const optionals = (day?.optionals ?? []).filter((o) => o.workout);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-2">
          <Link
            href="/entrenamiento"
            aria-label="Volver a la planilla"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-orange">
              {isToday ? 'Hoy' : ' '}
            </p>
            <p className="truncate text-sm font-semibold">
              {cap(format(date, "EEEE d 'de' MMMM", { locale: es }))}
            </p>
          </div>
          <DayNav href={`/entrenamiento/${format(prev, 'yyyy-MM-dd')}`} label="Día anterior" icon={ChevronLeft} />
          <DayNav href={`/entrenamiento/${format(next, 'yyyy-MM-dd')}`} label="Día siguiente" icon={ChevronRight} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-5">
        {day === undefined ? (
          <Empty text="No hay planilla publicada para este día." />
        ) : !isTrainingDay(day) ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Moon className="h-8 w-8" />
            <p className="text-lg font-semibold text-foreground">Descanso</p>
            <p className="text-sm">Recuperar también es entrenar.</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black italic leading-tight tracking-tight">{sessionTitle(day)}</h1>

            <Exercise
              workout={day.workout!}
              variant={day.variant}
              note={day.note}
              fileUrl={day.fileUrl}
              variantFileUrl={day.variantFileUrl}
            />

            {dayExtras(day).map((extra, i) => (
              <section key={i} className="space-y-3 border-t border-border pt-5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-orange">
                  <Plus className="h-3.5 w-3.5" /> En la misma sesión
                </p>
                <ExerciseFromSlot slot={extra} showTitle />
              </section>
            ))}

            {optionals.length > 0 && (
              <section className="space-y-5 border-t border-border pt-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Opcionales</p>
                {optionals.map((opt, i) => (
                  <ExerciseFromSlot key={i} slot={opt} showTitle />
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}

function DayNav({ href, label, icon: Icon }: { href: string; label: string; icon: typeof ChevronLeft }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-neutral-800"
    >
      <Icon className="h-4 w-4" />
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-16 text-center text-sm text-muted-foreground">{text}</p>;
}

function ExerciseFromSlot({ slot, showTitle }: { slot: OptionalDay; showTitle?: boolean }) {
  return (
    <Exercise
      workout={slot.workout}
      variant={slot.variant}
      note={slot.note}
      fileUrl={slot.fileUrl}
      variantFileUrl={slot.variantFileUrl}
      showTitle={showTitle}
    />
  );
}

/** Un ejercicio con todo lo que tiene: variante, km, consignas, nota del coach, recorrido y adjuntos. */
function Exercise({
  workout, variant, note, fileUrl, variantFileUrl, showTitle,
}: {
  workout: Workout;
  variant: Variant | null;
  note?: string | null;
  fileUrl: string | null;
  variantFileUrl: string | null;
  showTitle?: boolean;
}) {
  return (
    <div className="space-y-3">
      {showTitle && <h2 className="text-xl font-bold leading-snug">{workout.name}</h2>}
      {(variant?.label || (variant?.km ?? 0) > 0) && (
        <div className="flex flex-wrap gap-2">
          {variant?.label && (
            <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold">{variant.label}</span>
          )}
          {(variant?.km ?? 0) > 0 && (
            <span className="rounded-full bg-brand-orange/15 px-3 py-1 text-xs font-semibold text-brand-orange">
              {variant!.km} km
            </span>
          )}
        </div>
      )}
      {variant?.notes && (
        <p className="whitespace-pre-line text-base leading-relaxed text-neutral-100">{variant.notes}</p>
      )}
      {workout.description && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-300">{workout.description}</p>
      )}
      {note && <CoachNote note={note} />}
      {variantFileUrl && (
        <RouteMap gpxUrl={gpxProxyUrl(variantFileUrl)} />
      )}
      <AttachmentLinks
        fileUrl={fileUrl}
        variantFileUrl={variantFileUrl}
        workoutLink={workout.link}
        variantLink={variant?.link}
      />
    </div>
  );
}
