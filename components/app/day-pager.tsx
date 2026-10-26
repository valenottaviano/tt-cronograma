'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Moon, Plus } from 'lucide-react';
import { FitPreview } from '@/components/app/fit-preview';
import { RouteMap } from '@/components/app/route-map';
import { AttachmentLinks, CoachNote } from '@/components/schedule-view';
import { gpxProxyUrl, isGpxUrl } from '@/lib/gpx-proxy-url';
import type { OptionalDay, Schedule, Variant, Workout } from '@/lib/coachApi';
import { dayExtras, dayOn, isTrainingDay, parseLocalDate, sessionTitle, todayInArgentina } from '@/lib/athlete-days';

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 400;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** El día entra desde el lado hacia el que se navegó y sale por el opuesto. */
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 56 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -56 }),
};

/**
 * El detalle de un día, con paso al anterior y al siguiente.
 *
 * La planilla entera ya vino del servidor, así que cambiar de día es local e
 * instantáneo: sin pantalla de carga ni ida y vuelta al panel. La URL se
 * actualiza con `replaceState` (Next la sincroniza con su router), así «atrás»
 * vuelve a la planilla en vez de recorrer día por día.
 */
export function DayPager({ schedules, initialFecha }: { schedules: Schedule[]; initialFecha: string }) {
  const [fecha, setFecha] = useState(initialFecha);
  const [direction, setDirection] = useState<1 | -1>(1);

  const date = parseLocalDate(fecha);
  const day = dayOn(schedules, date);
  const isToday = date.getTime() === todayInArgentina().getTime();
  const optionals = (day?.optionals ?? []).filter((o) => o.workout);

  function go(delta: 1 | -1) {
    const next = format(addDays(date, delta), 'yyyy-MM-dd');
    setDirection(delta);
    setFecha(next);
    window.history.replaceState(null, '', `/entrenamiento/${next}`);
    window.scrollTo({ top: 0 });
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-2">
          <Link
            href="/entrenamiento"
            aria-label="Volver a la planilla"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:bg-neutral-800 active:scale-90"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-orange">
              {isToday ? 'Hoy' : '\u00a0'}
            </p>
            <p className="truncate text-sm font-semibold">
              {cap(format(date, "EEEE d 'de' MMMM", { locale: es }))}
            </p>
          </div>
          <DayNav onClick={() => go(-1)} label="Día anterior" icon={ChevronLeft} />
          <DayNav onClick={() => go(1)} label="Día siguiente" icon={ChevronRight} />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl overflow-x-hidden px-4 py-5">
        {/* popLayout: el día nuevo entra mientras el viejo sale, sin esperarlo. */}
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={fecha}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
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
                    variantFitUrl={day.variantFitUrl}
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
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

function DayNav({ onClick, label, icon: Icon }: { onClick: () => void; label: string; icon: typeof ChevronLeft }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-transform hover:bg-neutral-800 active:scale-90"
    >
      <Icon className="h-4 w-4" />
    </button>
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
      variantFitUrl={slot.variantFitUrl}
      showTitle={showTitle}
    />
  );
}

/** Un ejercicio con todo lo que tiene: km, consignas, nota del coach, recorrido y adjuntos. */
function Exercise({
  workout, variant, note, fileUrl, variantFileUrl, variantFitUrl, showTitle,
}: {
  workout: Workout;
  variant: Variant | null;
  note?: string | null;
  fileUrl: string | null;
  variantFileUrl: string | null;
  variantFitUrl?: string | null;
  showTitle?: boolean;
}) {
  // Roberto a veces sube el GPX como archivo del ejercicio y no de la variante:
  // también se dibuja, pero si están los dos manda el recorrido de la variante.
  const mapUrl = variantFileUrl ?? (fileUrl && isGpxUrl(fileUrl) ? fileUrl : null);
  return (
    <div className="space-y-3">
      {showTitle && <h2 className="text-xl font-bold leading-snug">{workout.name}</h2>}
      {/* El nombre de la variante ("Nivel 4") es de uso interno de Roberto: no se muestra. */}
      {(variant?.km ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-brand-orange/15 px-3 py-1 text-xs font-semibold text-brand-orange">
            {variant!.km} km
          </span>
        </div>
      )}
      {variant?.notes && (
        <p className="whitespace-pre-line text-base leading-relaxed text-neutral-100">{variant.notes}</p>
      )}
      {workout.description && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-300">{workout.description}</p>
      )}
      {note && <CoachNote note={note} />}
      {mapUrl && <RouteMap gpxUrl={gpxProxyUrl(mapUrl)} />}
      {variantFitUrl && <FitPreview url={gpxProxyUrl(variantFitUrl)} showRoute={!mapUrl} />}
      <AttachmentLinks
        fileUrl={fileUrl}
        variantFileUrl={variantFileUrl}
        variantFitUrl={variantFitUrl}
        workoutLink={workout.link}
        variantLink={variant?.link}
      />
    </div>
  );
}
