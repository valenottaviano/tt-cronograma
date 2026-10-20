'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Mountain, Route } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { parseGpxText, type TrackStats } from '@/lib/gpx';
import { createRouteMap } from '@/lib/satellite-map';

type Status = 'loading' | 'ready' | 'error';

/** El recorrido de un GPX sobre el mapa satelital, con distancia y desnivel. */
export function RouteMap({ gpxUrl }: { gpxUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [stats, setStats] = useState<TrackStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    let map: import('leaflet').Map | null = null;

    (async () => {
      try {
        const [L, res] = await Promise.all([import('leaflet'), fetch(gpxUrl, { cache: 'force-cache' })]);
        if (!res.ok) throw new Error(`GPX ${res.status}`);
        const parsed = parseGpxText(await res.text());
        if (cancelled) return;
        if (parsed.points.length < 2 || !containerRef.current) throw new Error('GPX sin puntos');

        map = createRouteMap(L, containerRef.current, parsed.points);
        setStats(parsed);
        setStatus('ready');
      } catch (err) {
        console.error('No se pudo mostrar el recorrido', err);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [gpxUrl]);

  if (status === 'error') {
    return (
      <p className="rounded-2xl border border-border bg-neutral-900 px-4 py-3 text-sm text-muted-foreground">
        No pudimos mostrar el mapa del recorrido. Igual podés descargarlo abajo.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-neutral-900">
      {/* Arrastrar el mapa no tiene que cambiar de día (el detalle se desliza con el dedo). */}
      <div className="relative h-72 w-full" onPointerDown={(e) => e.stopPropagation()}>
        {/* z-0: los paneles de Leaflet usan z-index altos y taparían el encabezado fijo. */}
        <div ref={containerRef} className="absolute inset-0 z-0" />
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {stats && (
        <div className="grid grid-cols-2 divide-x divide-border border-t border-border text-center">
          <div className="flex items-center justify-center gap-2 py-2.5">
            <Route className="h-4 w-4 text-muted-foreground" />
            <span className="font-bold">{stats.distanceKm.toFixed(1).replace('.', ',')} km</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-2.5">
            <Mountain className="h-4 w-4 text-muted-foreground" />
            <span className="font-bold">{Math.round(stats.elevationGain)} m</span>
            <span className="text-xs text-muted-foreground">desnivel +</span>
          </div>
        </div>
      )}
    </div>
  );
}
