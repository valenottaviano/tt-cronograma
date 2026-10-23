'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { decodePolyline } from '@/lib/strava-format';
import { createRouteMap } from '@/lib/satellite-map';

/** El recorrido de la actividad sobre el satelital, quieto como en la lista de Tracks. */
export function ActivityMap({ polyline }: { polyline: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  // En el carrusel, el mapa de cada actividad se arma recién cuando se desliza hasta ella.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let map: import('leaflet').Map | null = null;
    (async () => {
      const L = await import('leaflet');
      const points = decodePolyline(polyline);
      if (cancelled || points.length < 2 || !containerRef.current) return;
      map = createRouteMap(L, containerRef.current, points, { interactive: false });
      setReady(true);
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [visible, polyline]);

  return (
    // El fundido va en un envoltorio: si React tocara las clases del contenedor
    // del mapa, borraría las que agrega Leaflet y el mapa quedaría en blanco.
    // z-0: los paneles de Leaflet usan z-index altos y taparían el menú fijo.
    <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
