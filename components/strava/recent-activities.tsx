'use client';

import { useRef, useState } from 'react';
import { Activity, Bike, Dumbbell, Heart, Share2, type LucideIcon } from 'lucide-react';
import type { StravaLatest } from '@/lib/coachApi';
import {
  STRAVA_ORANGE, formatClock, formatInt, formatKm, formatSpeed, formatWhen, sportLabel, stravaActivityUrl,
} from '@/lib/strava-format';
import { cn } from '@/lib/utils';
import { ActivityMap } from './activity-map';
import { ShareActivitySheet } from './share-activity-sheet';

/**
 * Las últimas actividades (hasta 5), de a una, deslizando con el dedo. Es un
 * scroll horizontal con snap: el navegador hace el gesto, acá sólo se siguen
 * los puntitos. Los mapas no se arrastran, así que no le roban el gesto.
 */
/**
 * `todayIso` va como texto ("yyyy-MM-dd"): un Date que viene del servidor (en
 * UTC en Vercel) cambia de día al leerse en Argentina, y "Hoy" pasaría a "Ayer".
 */
export function RecentActivities({ activities, todayIso }: { activities: StravaLatest[]; todayIso: string }) {
  const [y, m, d] = todayIso.split('-').map(Number);
  const today = new Date(y, m - 1, d);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i: number) {
    const el = trackRef.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  }

  if (activities.length === 1) return <ActivityCard activity={activities[0]} today={today} isLatest />;

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {activities.map((a, i) => (
          <div key={a.id} className="w-full shrink-0 snap-center px-px" aria-roledescription="slide" aria-label={`${i + 1} de ${activities.length}`}>
            <ActivityCard activity={a} today={today} isLatest={i === 0} />
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        {activities.map((a, i) => (
          <button
            key={a.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ver actividad ${i + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === index ? 'w-5 bg-brand-orange' : 'w-1.5 bg-neutral-700 hover:bg-neutral-500',
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity, today, isLatest }: { activity: StravaLatest; today: Date; isLatest: boolean }) {
  const [sharing, setSharing] = useState(false);
  const speed = formatSpeed(activity.sportType, activity.averageSpeed);
  const metrics = [
    activity.distance > 0 && { value: formatKm(activity.distance / 1000, 2), unit: 'km', label: 'Distancia' },
    { value: formatClock(activity.movingTime), unit: '', label: 'Tiempo' },
    speed && { value: speed.value, unit: speed.unit, label: speed.unit === '/km' ? 'Ritmo' : 'Velocidad' },
    activity.elevationGain >= 1 && { value: `+${formatInt(activity.elevationGain)}`, unit: 'm', label: 'Desnivel' },
  ].filter(Boolean) as { value: string; unit: string; label: string }[];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-neutral-900">
      {activity.polyline ? (
        <div className="relative h-48 bg-neutral-800">
          <ActivityMap polyline={activity.polyline} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-neutral-900 to-transparent" />
          <span className="absolute left-3 top-3 z-[1] rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            {sportLabel(activity.sportType)}
          </span>
        </div>
      ) : (
        // Sin recorrido (gimnasio, cinta): la misma altura que un mapa, para que
        // al deslizar las tarjetas no salten.
        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
          <div aria-hidden className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-orange/15 blur-3xl" />
          <SportIcon sport={activity.sportType} />
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {sportLabel(activity.sportType)}
          </span>
        </div>
      )}

      <div className={cn('flex flex-1 flex-col px-4 pb-4', activity.polyline ? 'relative z-[2] -mt-6' : 'pt-3')}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isLatest ? 'Última actividad · ' : ''}
          {formatWhen(activity.startDateLocal, today)}
        </p>
        <h3 className="mt-0.5 truncate text-lg font-bold">{activity.name}</h3>

        {/* En el celular, cuatro números no entran en una fila: van de a dos. */}
        <div
          className={cn(
            'mb-4 mt-3 grid gap-x-3 gap-y-3',
            metrics.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : metrics.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
          )}
        >
          {metrics.map((m) => (
            <div key={m.label} className="min-w-0">
              <p className="truncate text-2xl font-black italic leading-tight tabular-nums">
                {m.value}
                {m.unit && <span className="ml-0.5 text-xs font-semibold not-italic text-muted-foreground">{m.unit}</span>}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
          {activity.averageHeartrate ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="font-semibold tabular-nums text-foreground">{Math.round(activity.averageHeartrate)}</span> ppm prom.
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSharing(true)}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-white/15"
            >
              <Share2 className="h-3.5 w-3.5" /> Compartir
            </button>
            <StravaLink id={activity.id} />
          </div>
        </div>
        {/* Se monta recién al abrir: arma canvas y carga el logo. */}
        {sharing && <ShareActivitySheet activity={activity} open={sharing} onOpenChange={setSharing} />}
      </div>
    </article>
  );
}

function StravaLink({ id }: { id: string }) {
  return (
    <a
      href={stravaActivityUrl(id)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-bold underline-offset-4 hover:underline"
      style={{ color: STRAVA_ORANGE }}
    >
      Ver en Strava
    </a>
  );
}

function SportIcon({ sport }: { sport: string }) {
  const Icon: LucideIcon = sport.includes('Ride') ? Bike : ['WeightTraining', 'Workout', 'Crossfit'].includes(sport) ? Dumbbell : Activity;
  return (
    <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-neutral-900/60">
      <Icon className="h-9 w-9 text-brand-orange" strokeWidth={1.75} />
    </span>
  );
}
