'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { parseGpxText } from '@/lib/gpx';
import { createRouteMap } from '@/lib/satellite-map';

type PreviewStatus = 'loading' | 'ready' | 'error';

type TrackPreviewVariant = 'panel' | 'card';

interface TrackPreviewProps {
  fileUrl: string;
  className?: string;
  distanceKm?: number;
  elevationGain?: number;
  variant?: TrackPreviewVariant;
}

const variantConfig = {
  // En la lista: un mapa quieto, para que el dedo siga scrolleando la página.
  card: { heightClass: 'h-[180px] md:h-[220px]', wrapper: 'rounded-[1.5rem]', interactive: false },
  // En el detalle: se puede arrastrar y hacer zoom.
  panel: { heightClass: 'h-[260px] md:h-[320px]', wrapper: 'rounded-[2.25rem]', interactive: true },
} as const;

/** El recorrido del GPX sobre el satelital, igual que en Entreno. */
export function TrackPreview({ fileUrl, className, variant = 'panel' }: TrackPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PreviewStatus>('loading');
  const [visible, setVisible] = useState(false);
  const config = variantConfig[variant];

  // Con muchos tracks en la lista, cada mapa se arma recién cuando está por verse.
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
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !fileUrl) return;
    let cancelled = false;
    let map: import('leaflet').Map | null = null;

    (async () => {
      try {
        const [L, res] = await Promise.all([import('leaflet'), fetch(fileUrl, { cache: 'force-cache' })]);
        if (!res.ok) throw new Error(`GPX ${res.status}`);
        const parsed = parseGpxText(await res.text());
        if (cancelled) return;
        if (parsed.points.length < 2 || !containerRef.current) throw new Error('GPX sin puntos');

        map = createRouteMap(L, containerRef.current, parsed.points, { interactive: config.interactive });
        setStatus('ready');
      } catch (err) {
        console.error('Error al mostrar el GPX:', err);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [visible, fileUrl, config.interactive]);

  return (
    <div
      className={cn(
        'relative overflow-hidden border border-white/10 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.45)]',
        config.wrapper,
        className,
      )}
    >
      <div className={cn('relative w-full', config.heightClass)}>
        {/* z-0: los paneles de Leaflet usan z-index altos y taparían el menú fijo. */}
        <div ref={containerRef} className="absolute inset-0 z-0" />

        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-white/60">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando recorrido...
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-sm text-white/60">
            No pudimos renderizar la vista previa. Descargá el archivo para
            verlo en tu app favorita.
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackPreview;
