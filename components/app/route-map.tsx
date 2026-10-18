'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Mountain, Route } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { parseGpxText, type TrackStats } from '@/lib/gpx';

/**
 * Imágenes satelitales de Esri (World Imagery) y, encima, nombres de lugares
 * para orientarse. No piden clave.
 *
 * OJO: los términos de Esri piden mostrar la atribución. Se sacó del mapa a
 * pedido (2026-10-18); si hay que reponerla, es `attributionControl: true` y
 * la opción `attribution` de la capa satelital.
 */
const SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

const ROUTE_COLOR = '#ED241F';

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

        map = L.map(containerRef.current, {
          zoomControl: true,
          // La página scrollea: que la rueda no le robe el scroll al mapa.
          scrollWheelZoom: false,
          attributionControl: false,
        });
        L.tileLayer(SATELLITE_URL, { maxZoom: 19 }).addTo(map);
        L.tileLayer(LABELS_URL, { maxZoom: 19, opacity: 0.8 }).addTo(map);

        const latLngs = parsed.points.map((p) => L.latLng(p.lat, p.lon));
        // Un contorno oscuro debajo hace que la línea se lea sobre cualquier terreno.
        L.polyline(latLngs, { color: '#000', weight: 7, opacity: 0.45 }).addTo(map);
        const line = L.polyline(latLngs, { color: ROUTE_COLOR, weight: 4, opacity: 1 }).addTo(map);

        const dot = (fill: string) => ({ radius: 7, color: '#fff', weight: 2, fillColor: fill, fillOpacity: 1 });
        L.circleMarker(latLngs[0], dot('#22c55e')).bindTooltip('Salida').addTo(map);
        L.circleMarker(latLngs[latLngs.length - 1], dot(ROUTE_COLOR)).bindTooltip('Llegada').addTo(map);

        map.fitBounds(line.getBounds(), { padding: [24, 24] });
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
      <div className="relative h-72 w-full">
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
