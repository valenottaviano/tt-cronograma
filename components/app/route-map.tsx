'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Mountain, Route } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { parseGpxText } from '@/lib/gpx';
import { createRouteMap } from '@/lib/satellite-map';

type Status = 'loading' | 'ready' | 'error';

/** Lo que hace falta para dibujar un recorrido, venga de un GPX o de un .fit. */
export interface RouteTrack {
  points: { lat: number; lon: number; ele?: number }[];
  distanceKm: number;
  elevationGain: number;
}

/**
 * El recorrido sobre el mapa satelital, con distancia y desnivel. Recibe la URL
 * de un GPX, o el recorrido ya leído (el de un .fit, que se lee en otro lado).
 */
export function RouteMap({ gpxUrl, track }: { gpxUrl: string; track?: never } | { gpxUrl?: never; track: RouteTrack }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [stats, setStats] = useState<RouteTrack | null>(null);

  useEffect(() => {
    let cancelled = false;
    let map: import('leaflet').Map | null = null;

    (async () => {
      try {
        const [L, parsed] = await Promise.all([import('leaflet'), track ?? loadGpx(gpxUrl!)]);
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
  }, [gpxUrl, track]);

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

async function loadGpx(url: string): Promise<RouteTrack> {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`GPX ${res.status}`);
  return parseGpxText(await res.text());
}
