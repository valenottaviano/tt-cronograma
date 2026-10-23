import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Flame, Heart, Loader2, Mountain, TrendingDown, TrendingUp } from 'lucide-react';
import type { StravaLatest, StravaState, StravaStats } from '@/lib/coachApi';
import {
  STRAVA_ORANGE, formatClock, formatDuration, formatInt, formatKm, formatSpeed, formatWhen, sportLabel,
  stravaActivityUrl,
} from '@/lib/strava-format';
import { cn } from '@/lib/utils';
import { ActivityMap } from './activity-map';
import { StravaLogo } from './strava-logo';
import { StravaSyncWatcher } from './strava-sync-watcher';

const SPLIT_COLORS: Record<StravaStats['year']['split'][number]['key'], string> = {
  run: 'bg-brand-orange',
  trail: 'bg-amber-500',
  bike: 'bg-sky-400',
  gym: 'bg-violet-400',
  other: 'bg-neutral-500',
};

/**
 * "Tu actividad" en Inicio: lo que el atleta hizo según su Strava. Sólo lo ve
 * él (así lo piden las reglas de Strava) y sólo si el panel lo habilitó para
 * su DNI; si no, no se muestra nada.
 */
export function StravaSection({ state, today }: { state: StravaState | null; today: Date }) {
  if (!state?.enabled) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-black uppercase italic tracking-wider">Tu actividad</h2>
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Powered by <StravaLogo className="h-3 w-3" /> Strava
        </span>
      </div>

      {!state.connected ? (
        <ConnectCard />
      ) : !state.stats.latest ? (
        state.syncStatus === 'SYNCING' ? <SyncingCard /> : <EmptyCard />
      ) : (
        <>
          {state.syncStatus === 'SYNCING' && (
            <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Trayendo el resto de tus actividades…
              <StravaSyncWatcher />
            </p>
          )}
          <LatestActivityCard activity={state.stats.latest} today={today} />
          <WeekCard stats={state.stats} today={today} />
          <WeeksCard stats={state.stats} />
          <YearCard stats={state.stats} />
        </>
      )}
    </section>
  );
}

// --- Estados ------------------------------------------------------------------

function ConnectCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-neutral-900 p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl"
        style={{ background: STRAVA_ORANGE }}
      />
      <p className="text-lg font-black italic leading-tight">Tus kilómetros, acá mismo</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Vinculá tu Strava y mirá tu última salida, tu semana y tu año. Sólo vos ves estos datos.
      </p>
      {/* Navegación completa: la ruta redirige a Strava. */}
      <a
        href="/api/strava/connect"
        className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: STRAVA_ORANGE }}
      >
        <StravaLogo className="h-4 w-4" /> Conectar con Strava
      </a>
    </div>
  );
}

function SyncingCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-neutral-900 p-5">
      <Loader2 className="h-6 w-6 shrink-0 animate-spin" style={{ color: STRAVA_ORANGE }} />
      <div>
        <p className="font-semibold">Sincronizando con Strava…</p>
        <p className="text-sm text-muted-foreground">Estamos trayendo tus actividades. Tarda un par de minutos.</p>
      </div>
      <StravaSyncWatcher />
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
      Tu Strava está vinculado, pero no tiene actividades del último año. Cuando subas una, aparece acá.
    </div>
  );
}

// --- Última actividad -----------------------------------------------------------

function LatestActivityCard({ activity, today }: { activity: StravaLatest; today: Date }) {
  const speed = formatSpeed(activity.sportType, activity.averageSpeed);
  const metrics = [
    activity.distance > 0 && { value: formatKm(activity.distance / 1000, 2), unit: 'km', label: 'Distancia' },
    { value: formatClock(activity.movingTime), unit: '', label: 'Tiempo' },
    speed && { value: speed.value, unit: speed.unit, label: speed.unit === '/km' ? 'Ritmo' : 'Velocidad' },
    activity.elevationGain >= 1 && { value: `+${formatInt(activity.elevationGain)}`, unit: 'm', label: 'Desnivel' },
  ].filter(Boolean) as { value: string; unit: string; label: string }[];

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-neutral-900">
      {activity.polyline ? (
        <div className="relative h-48 bg-neutral-800">
          <ActivityMap polyline={activity.polyline} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-neutral-900 to-transparent" />
          <span className="absolute left-3 top-3 z-[1] rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            {sportLabel(activity.sportType)}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 pt-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800">
            <Activity className="h-4 w-4 text-brand-orange" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {sportLabel(activity.sportType)}
          </span>
        </div>
      )}

      <div className={cn('px-4 pb-4', activity.polyline ? '-mt-6 relative z-[2]' : 'pt-3')}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Última actividad · {formatWhen(activity.startDateLocal, today)}
        </p>
        <h3 className="mt-0.5 truncate text-lg font-bold">{activity.name}</h3>

        {/* En el celular, cuatro números no entran en una fila: van de a dos. */}
        <div
          className={cn(
            'mt-3 grid gap-x-3 gap-y-3',
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

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
          {activity.averageHeartrate ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="font-semibold tabular-nums text-foreground">{Math.round(activity.averageHeartrate)}</span> ppm prom.
            </span>
          ) : (
            <span />
          )}
          <StravaLink id={activity.id} />
        </div>
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

// --- Esta semana ----------------------------------------------------------------

function WeekCard({ stats, today }: { stats: StravaStats; today: Date }) {
  const { week } = stats;
  const max = Math.max(...week.days.map((d) => d.km), 1);
  const todayIso = format(today, 'yyyy-MM-dd');
  const delta = week.prevKm > 0 ? Math.round(((week.km - week.prevKm) / week.prevKm) * 100) : null;

  return (
    <div className="rounded-2xl border border-border bg-neutral-900 p-4">
      <CardLabel>Esta semana</CardLabel>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-4xl font-black italic leading-none tabular-nums">
          {formatKm(week.km)}
          <span className="ml-1 text-base font-bold not-italic text-muted-foreground">km</span>
        </p>
        {delta !== null && delta !== 0 && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums',
                delta > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-neutral-800 text-muted-foreground',
              )}
            >
              {delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {delta > 0 ? '+' : ''}
              {delta}%
            </span>
            <span className="text-[10px] text-muted-foreground">vs. semana pasada</span>
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">corriendo, calle y trail</p>

      <div className="mt-5 grid h-28 grid-cols-7 items-end gap-2">
        {week.days.map((d) => {
          const isToday = d.date === todayIso;
          const future = d.date > todayIso;
          return (
            <div key={d.date} className="flex h-full flex-col items-center justify-end gap-1.5">
              {d.km > 0 && (
                <span className="text-[10px] font-bold tabular-nums text-muted-foreground">{formatKm(d.km, d.km < 10 ? 1 : 0)}</span>
              )}
              {d.km > 0 ? (
                <div
                  className={cn(
                    'strava-bar w-full max-w-8 rounded-md',
                    isToday ? 'bg-brand-orange shadow-[0_0_16px_rgba(237,36,31,0.55)]' : 'bg-brand-orange/85',
                  )}
                  style={{ height: `${Math.max((d.km / max) * 100, 6)}%` }}
                />
              ) : (
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    // Entrenó sin km (gimnasio, bici): un punto encendido.
                    d.active ? 'bg-violet-400' : future ? 'bg-neutral-800' : 'bg-neutral-700',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2 text-center">
        {week.days.map((d) => (
          <span
            key={d.date}
            className={cn(
              'text-[10px] font-bold uppercase',
              d.date === todayIso ? 'text-brand-orange' : 'text-muted-foreground',
            )}
          >
            {format(new Date(`${d.date}T12:00:00`), 'EEEEE', { locale: es })}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-border border-t border-border pt-3 text-center">
        <MiniStat value={String(week.activities)} label={week.activities === 1 ? 'actividad' : 'actividades'} />
        <MiniStat value={formatDuration(week.movingTime)} label="en movimiento" />
        <MiniStat value={`+${formatInt(week.elevation)} m`} label="desnivel" />
      </div>
    </div>
  );
}

// --- Últimas 12 semanas ---------------------------------------------------------

function WeeksCard({ stats }: { stats: StravaStats }) {
  const max = Math.max(...stats.weeks.map((w) => w.km), stats.avgKm, 1);
  const last = stats.weeks.length - 1;

  return (
    <div className="rounded-2xl border border-border bg-neutral-900 p-4">
      <div className="flex items-baseline justify-between">
        <CardLabel>Últimas 12 semanas</CardLabel>
        {stats.avgKm > 0 && (
          <span className="text-xs text-muted-foreground">
            prom. <span className="font-bold tabular-nums text-foreground">{formatKm(stats.avgKm)} km</span>
          </span>
        )}
      </div>

      <div className="relative mt-4 h-32">
        {stats.avgKm > 0 && (
          <div
            className="absolute inset-x-0 z-[1] border-t border-dashed border-white/25"
            style={{ bottom: `${(stats.avgKm / max) * 100}%` }}
          />
        )}
        <div className="grid h-full grid-cols-12 items-end gap-1.5">
          {stats.weeks.map((w, i) => (
            <div
              key={w.start}
              title={`${format(new Date(`${w.start}T12:00:00`), "d 'de' MMM", { locale: es })}: ${formatKm(w.km)} km`}
              className={cn(
                'strava-bar w-full rounded-[4px]',
                i === last ? 'bg-brand-orange' : w.km >= stats.avgKm && w.km > 0 ? 'bg-neutral-400' : 'bg-neutral-700',
              )}
              style={{ height: `${w.km > 0 ? Math.max((w.km / max) * 100, 3) : 2}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{format(new Date(`${stats.weeks[0].start}T12:00:00`), "d MMM", { locale: es })}</span>
        <span className="font-bold text-brand-orange">Esta semana</span>
      </div>

      {stats.streakWeeks >= 2 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-orange/10 px-3 py-2.5">
          <Flame className="h-5 w-5 shrink-0 text-brand-orange" />
          <p className="text-sm">
            {/* Se importa un año: más de 52 semanas no se puede contar. */}
            <span className="font-black italic">
              {stats.streakWeeks >= 52 ? 'Más de un año' : `${stats.streakWeeks} semanas`} seguidas
            </span>{' '}
            <span className="text-muted-foreground">entrenando. ¡No la cortes!</span>
          </p>
        </div>
      )}
    </div>
  );
}

// --- El año ---------------------------------------------------------------------

function YearCard({ stats }: { stats: StravaStats }) {
  const { year } = stats;
  const hours = Math.round(year.movingTime / 3600);

  return (
    <div className="rounded-2xl border border-border bg-neutral-900 p-4">
      <CardLabel>Tu {year.year}</CardLabel>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <YearTile value={formatInt(year.km)} unit="km" label="corriendo" />
        <YearTile value={formatInt(hours)} unit="h" label="en movimiento" />
        <YearTile
          value={`+${formatInt(year.elevation)}`}
          unit="m"
          label={
            year.everests >= 0.1 ? (
              <span className="flex items-center gap-1">
                <Mountain className="h-3 w-3" /> ≈ {formatKm(year.everests)} Everest
              </span>
            ) : (
              'de desnivel'
            )
          }
        />
        <YearTile value={formatInt(year.activities)} unit="" label="actividades" />
      </div>

      {year.split.length > 0 && (
        <>
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-neutral-800">
            {year.split.map((s) => (
              <div key={s.key} className={SPLIT_COLORS[s.key]} style={{ width: `${s.pct}%` }} />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {year.split.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn('h-2 w-2 rounded-full', SPLIT_COLORS[s.key])} />
                {s.label} <span className="font-bold tabular-nums text-foreground">{s.pct}%</span>
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">Reparto del tiempo entrenado.</p>
        </>
      )}
    </div>
  );
}

function YearTile({ value, unit, label }: { value: string; unit: string; label: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-neutral-800/60 px-3 py-3">
      <p className="text-2xl font-black italic leading-tight tabular-nums">
        {value}
        {unit && <span className="ml-1 text-sm font-bold not-italic text-muted-foreground">{unit}</span>}
      </p>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

// --- Piezas ---------------------------------------------------------------------

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-1">
      <p className="truncate text-sm font-black italic tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
