'use client';

import { useEffect, useState } from 'react';
import { Repeat, Watch } from 'lucide-react';
import { RouteMap } from '@/components/app/route-map';
import { formatMeters, formatSeconds, parseFit, type FitPreview as Preview, type FitStep } from '@/lib/fit';
import { cn } from '@/lib/utils';

/**
 * Lo que trae el .fit de la variante, antes de pasarlo al reloj: los pasos del
 * entrenamiento, o el recorrido sobre el mapa. Si no se puede leer no muestra
 * nada: el botón para descargarlo sigue estando abajo.
 *
 * `showRoute` en false cuando la variante ya tiene GPX: sería el mismo mapa dos veces.
 */
export function FitPreview({ url, showRoute }: { url: string; showRoute: boolean }) {
  const [preview, setPreview] = useState<Preview | null | 'loading'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`FIT ${res.status}`);
        const parsed = await parseFit(await res.arrayBuffer());
        if (!cancelled) setPreview(parsed);
      } catch (err) {
        console.error('No se pudo leer el .fit', err);
        if (!cancelled) setPreview(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (preview === 'loading') {
    return <div className="h-24 animate-pulse rounded-2xl border border-border bg-neutral-900" aria-label="Cargando el entrenamiento" />;
  }
  if (!preview) return null;
  if (preview.kind === 'route') return showRoute ? <RouteMap track={preview} /> : null;
  if (preview.kind !== 'workout') return null;

  const totals = [
    preview.totalSeconds > 0 && formatSeconds(preview.totalSeconds),
    preview.totalMeters > 0 && formatMeters(preview.totalMeters),
  ].filter(Boolean) as string[];

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-neutral-900">
      <header className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15">
          <Watch className="h-4 w-4 text-violet-300" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-300">Para tu reloj</p>
          <p className="truncate font-bold">{preview.name ?? 'Entrenamiento estructurado'}</p>
          {/* "≈": los pasos que terminan al tocar la vuelta no se pueden sumar. */}
          {totals.length > 0 && (
            <p className="text-xs font-semibold tabular-nums text-muted-foreground">≈ {totals.join(' + ')}</p>
          )}
        </div>
      </header>
      <ol className="space-y-1.5 p-3">
        {preview.steps.map((step, i) => (
          <StepRow key={i} step={step} />
        ))}
      </ol>
      <p className="border-t border-border px-4 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
        Descargá el archivo .fit y cargalo en la app de tu reloj (Garmin Connect, Coros, Suunto…) para que te guíe paso a paso.
      </p>
    </section>
  );
}

const INTENSITY: Record<string, { label: string; bar: string }> = {
  warmup: { label: 'Entrada en calor', bar: 'bg-amber-400' },
  active: { label: 'Trabajo', bar: 'bg-brand-orange' },
  interval: { label: 'Trabajo', bar: 'bg-brand-orange' },
  recovery: { label: 'Recuperación', bar: 'bg-emerald-400' },
  rest: { label: 'Pausa', bar: 'bg-neutral-500' },
  cooldown: { label: 'Vuelta a la calma', bar: 'bg-sky-400' },
};

function StepRow({ step }: { step: FitStep }) {
  if (step.type === 'repeat') {
    return (
      <li className="rounded-xl border border-dashed border-white/15 p-2">
        <p className="mb-1.5 flex items-center gap-1.5 px-1 text-xs font-black uppercase italic tracking-wider text-foreground">
          <Repeat className="h-3.5 w-3.5 text-brand-orange" /> {step.times} ×
        </p>
        <ol className="space-y-1.5">
          {step.steps.map((s, i) => (
            <StepRow key={i} step={s} />
          ))}
        </ol>
      </li>
    );
  }

  const intensity = step.intensity ? INTENSITY[step.intensity] : undefined;
  return (
    <li className="flex items-stretch gap-3 rounded-xl bg-neutral-800/60 px-3 py-2">
      <span aria-hidden className={cn('w-1 shrink-0 rounded-full', intensity?.bar ?? 'bg-neutral-500')} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{step.name ?? intensity?.label ?? 'Paso'}</p>
        {step.target && <p className="text-xs tabular-nums text-muted-foreground">{step.target}</p>}
      </div>
      <p className="self-center whitespace-nowrap text-sm font-bold tabular-nums">{step.duration}</p>
    </li>
  );
}
