'use client';
 'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseGpxText, type TrackStats } from '@/lib/gpx';

type PreviewStatus = 'idle' | 'loading' | 'error';

type TrackPreviewVariant = 'panel' | 'card';

const accentPalette = {
  orange: {
    stroke: '#ff8a3c',
    glow: 'rgba(255,138,60,0.4)',
  },
  cyan: {
    stroke: '#3cf0ff',
    glow: 'rgba(60,240,255,0.35)',
  },
};

interface TrackPreviewProps {
  fileUrl: string;
  className?: string;
  accent?: keyof typeof accentPalette;
  showMeta?: boolean;
  distanceKm?: number;
  elevationGain?: number;
  variant?: TrackPreviewVariant;
  onStatusChange?: (status: PreviewStatus) => void;
  prefetchedStats?: TrackStats | null;
}

export function TrackPreview({
  fileUrl,
  className,
  accent = 'orange',
  showMeta,
  distanceKm,
  elevationGain,
  variant = 'panel',
  onStatusChange,
  prefetchedStats = null,
}: TrackPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<TrackStats | null>(() => prefetchedStats);
  const [status, setStatus] = useState<PreviewStatus>(prefetchedStats ? 'idle' : 'loading');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let cancelled = false;

    async function loadGpx() {
      setStatus('loading');
      try {
        const response = await fetch(fileUrl, { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error('Error al descargar el GPX');
        }

        const text = await response.text();
        if (cancelled) return;

        const parsed = parseGpxText(text);
        setStats(parsed);
        setStatus(parsed.points.length > 1 ? 'idle' : 'error');
      } catch (error) {
        if (!cancelled) {
          console.error('Error parsing GPX file:', error);
          setStats(null);
          setStatus('error');
        }
      }
    }

    const hasRenderableStats = Boolean(prefetchedStats && prefetchedStats.points?.length);

    if (prefetchedStats) {
      setStats(prefetchedStats);
      setStatus(hasRenderableStats ? 'idle' : 'error');
      onStatusChange?.(hasRenderableStats ? 'idle' : 'error');
    }

    if (fileUrl && !hasRenderableStats) {
      loadGpx();
    }

    return () => {
      cancelled = true;
    };
  }, [fileUrl, prefetchedStats, onStatusChange]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !containerRef.current) {
      const fallbackWidth = containerRef.current?.clientWidth ?? 0;
      const fallbackHeight = containerRef.current?.clientHeight ?? 0;
      setDimensions({ width: fallbackWidth, height: fallbackHeight });
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!stats || status !== 'idle') return;
    if (!stats.bounds || stats.points.length < 2) return;
    if (!canvasRef.current) return;

    const { width, height } = dimensions;
    if (!width || !height) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deviceRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * deviceRatio;
    canvas.height = height * deviceRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.resetTransform();
    ctx.scale(deviceRatio, deviceRatio);

    ctx.clearRect(0, 0, width, height);
    const palette = accentPalette[accent];

    const padding = 28;
    const { bounds } = stats;
    const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.0001);
    const lonRange = Math.max(bounds.maxLon - bounds.minLon, 0.0001);
    const scale = Math.min(
      (width - padding * 2) / lonRange,
      (height - padding * 2) / latRange,
    );

    const projectPoint = (lat: number, lon: number) => ({
      x: padding + (lon - bounds.minLon) * scale,
      y: height - padding - (lat - bounds.minLat) * scale,
    });

    const projectedPoints = stats.points.map((point) =>
      projectPoint(point.lat, point.lon),
    );

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, palette.stroke);
    gradient.addColorStop(1, '#ffffff');

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 14;

    ctx.beginPath();
    projectedPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = palette.stroke;
    ctx.beginPath();
    const start = projectedPoints[0];
    const end = projectedPoints[projectedPoints.length - 1];
    ctx.arc(start.x, start.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [stats, status, dimensions, accent]);

  const displayDistance = stats?.distanceKm ?? distanceKm;
  const displayElevation = stats?.elevationGain ?? elevationGain;

  const variantConfig = useMemo(
    () =>
      variant === 'card'
        ? {
            heightClass: 'h-[180px] md:h-[220px]',
            overlayPadding: 'inset-x-4 bottom-4',
            wrapper: 'rounded-[1.5rem]',
            showMeta: showMeta ?? false,
          }
        : {
            heightClass: 'h-[260px] md:h-[320px]',
            overlayPadding: 'inset-x-6 bottom-6',
            wrapper: 'rounded-[2.25rem]',
            showMeta: showMeta ?? true,
          },
    [variant, showMeta],
  );

  return (
    <div
      className={cn(
        'relative overflow-hidden border border-white/10',
        'bg-gradient-to-b from-neutral-950 via-neutral-900 to-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]',
        variantConfig.wrapper,
        className,
      )}
    >
      <div ref={containerRef} className={cn('relative w-full', variantConfig.heightClass)}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-white/60">
            <Loader2 className="h-5 w-5 animate-spin" />
            Procesando GPX...
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-sm text-white/60">
            No pudimos renderizar la vista previa. Descargá el archivo para
            verlo en tu app favorita.
          </div>
        )}

        {status === 'idle' && (
          <div
            className={cn(
              'pointer-events-none absolute flex flex-wrap gap-4 rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-[11px] font-black uppercase tracking-[0.3em] text-white/70',
              variantConfig.overlayPadding,
            )}
          >
            <span>
              {stats?.points.length ?? 0} puntos ·{' '}
              {displayDistance ? `${displayDistance} km` : 'distancia estimada'}
            </span>
          </div>
        )}
      </div>

      {variantConfig.showMeta && (
        <div className="grid grid-cols-2 gap-4 border-t border-white/10 px-6 py-5 text-sm uppercase tracking-[0.25em] text-white/40">
          <div>
            <p className="text-[10px]">Distancia</p>
            <p className="mt-1 text-2xl font-black text-white tracking-tight">
              {displayDistance ? `${displayDistance} km` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px]">Desnivel +</p>
            <p className="mt-1 text-2xl font-black text-white tracking-tight">
              {typeof displayElevation === 'number' ? `${displayElevation} m` : '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackPreview;
