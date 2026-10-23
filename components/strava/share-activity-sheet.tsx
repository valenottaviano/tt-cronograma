'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { StravaLatest } from '@/lib/coachApi';
import {
  STICKER_COLORS, STICKER_DESIGNS, STICKER_FIELD_LABELS, availableStats, drawSticker,
  type StickerAssets, type StickerColor, type StickerDesign, type StickerField, type StickerOptions,
} from '@/lib/activity-sticker';
import { cn } from '@/lib/utils';

/** Cuadriculado de transparencia: el sticker no tiene fondo y así se nota. */
const CHECKER = 'bg-[conic-gradient(#52525b_25%,#3f3f46_0_50%,#52525b_0_75%,#3f3f46_0)] bg-[length:20px_20px]';

/** Carga el logo y la fuente de la app una vez: el canvas no los toma solo. */
function useStickerAssets(): StickerAssets | null {
  const [assets, setAssets] = useState<StickerAssets | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fontFamily = getComputedStyle(document.body).fontFamily;
      const logo = new Image();
      logo.src = '/logo-tt.png';
      await Promise.all([
        logo.decode().catch(() => null),
        document.fonts.load(`italic 900 100px ${fontFamily}`).catch(() => null),
        document.fonts.load(`700 100px ${fontFamily}`).catch(() => null),
      ]);
      if (!cancelled) setAssets({ fontFamily, logo: logo.naturalWidth ? logo : null });
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return assets;
}

/**
 * Elegir un sticker de la actividad y llevarlo a Instagram. "Copiar" deja el
 * PNG en el portapapeles para pegarlo como sticker en una historia (así lo
 * hace la gente con Strava); "Compartir" abre el menú del celular o lo descarga.
 */
export function ShareActivitySheet({
  activity, open, onOpenChange,
}: {
  activity: StravaLatest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const assets = useStickerAssets();
  const stats = useMemo(() => availableStats(activity), [activity]);
  const designs = STICKER_DESIGNS.filter((d) => !d.needsRoute || activity.polyline);

  const [design, setDesign] = useState<StickerDesign>(designs[0]?.id ?? 'numbers');
  const [color, setColor] = useState<StickerColor>('white');
  const [fields, setFields] = useState<StickerField[]>(() => stats.slice(0, 4).map((s) => s.key));
  const [copied, setCopied] = useState(false);

  const options: StickerOptions = { design, color, fields };
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !assets || !previewRef.current) return;
    drawSticker(previewRef.current, activity, { design, color, fields }, assets, 0.5);
  }, [open, assets, activity, design, color, fields]);

  function toggleField(key: StickerField) {
    setFields((f) => (f.includes(key) ? f.filter((k) => k !== key) : stats.map((s) => s.key).filter((k) => k === key || f.includes(k))));
  }

  /** El PNG a tamaño completo (1080 px de ancho). */
  function renderBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!assets) return reject(new Error('sin recursos'));
      const canvas = document.createElement('canvas');
      drawSticker(canvas, activity, options, assets);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png');
    });
  }

  const fileName = `grupo-tt-${activity.startDateLocal.slice(0, 10)}.png`;

  async function copy() {
    try {
      // Safari pide armar el ClipboardItem dentro del toque, con la imagen como promesa.
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': renderBlob() })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success('Sticker copiado. Abrí tu historia de Instagram y pegalo.');
    } catch {
      toast.error('Tu navegador no deja copiar imágenes. Usá "Compartir".');
    }
  }

  async function share() {
    try {
      const file = new File([await renderBlob()], fileName, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      // Cerrar el menú de compartir no es un error.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('No se pudo compartir. Probá de nuevo.');
    }
  }

  const canCopy = typeof window !== 'undefined' && 'ClipboardItem' in window;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-3xl border-border bg-neutral-950 px-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <SheetHeader className="px-4 pb-0">
          <SheetTitle className="text-left font-black uppercase italic tracking-wider">Compartir actividad</SheetTitle>
          <SheetDescription className="text-left">
            Stickers con fondo transparente para pegar sobre tu foto en Instagram.
          </SheetDescription>
        </SheetHeader>

        {/* Un solo bloque: dentro del panel (flex en columna) las filas se achicaban hasta desaparecer. */}
        <div className="shrink-0">
          {/* Vista previa */}
          <div className="px-4">
            <div className={cn('flex h-72 items-center justify-center rounded-2xl p-6', CHECKER)}>
              {assets ? (
                <canvas ref={previewRef} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-sm text-white/60">Preparando…</span>
              )}
            </div>
          </div>

          {/* Diseños */}
          <OptionTitle>Diseño</OptionTitle>
          <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {designs.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDesign(d.id)}
                className={cn(
                  'flex w-24 shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors',
                  design === d.id ? 'border-brand-orange bg-brand-orange/10' : 'border-border bg-neutral-900',
                )}
              >
                <span className={cn('flex h-20 w-full items-center justify-center rounded-lg p-1.5', CHECKER)}>
                  {assets && <DesignThumb activity={activity} options={{ ...options, design: d.id }} assets={assets} />}
                </span>
                <span className={cn('text-[11px] font-bold', design === d.id ? 'text-foreground' : 'text-muted-foreground')}>
                  {d.label}
                </span>
              </button>
            ))}
          </div>

          {/* Color */}
          <OptionTitle>Color</OptionTitle>
          <div className="flex gap-2 px-4">
            {STICKER_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                  color === c.id ? 'border-brand-orange bg-brand-orange/10' : 'border-border bg-neutral-900 text-muted-foreground',
                )}
              >
                <span className="h-4 w-4 rounded-full border border-white/30" style={{ background: c.hex }} />
                {c.label}
              </button>
            ))}
          </div>

          {/* Datos */}
          <OptionTitle>Datos</OptionTitle>
          <div className="flex flex-wrap gap-2 px-4">
            {stats.map((s) => {
              const on = fields.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggleField(s.key)}
                  aria-pressed={on}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                    on ? 'border-brand-orange bg-brand-orange/10 text-foreground' : 'border-border bg-neutral-900 text-muted-foreground',
                  )}
                >
                  {on && <Check className="h-3.5 w-3.5" />}
                  {s.key === 'pace' ? s.label : STICKER_FIELD_LABELS[s.key]}
                </button>
              );
            })}
          </div>

          {/* Acciones */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 px-4">
            {canCopy && (
              <button
                type="button"
                onClick={copy}
                disabled={!assets}
                className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado' : 'Copiar sticker'}
              </button>
            )}
            <button
              type="button"
              onClick={share}
              disabled={!assets}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl bg-brand-orange py-3 text-sm font-bold text-white disabled:opacity-50',
                !canCopy && 'col-span-2',
              )}
            >
              {typeof navigator !== 'undefined' && 'share' in navigator ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              {typeof navigator !== 'undefined' && 'share' in navigator ? 'Compartir' : 'Descargar'}
            </button>
          </div>
          <p className="mt-3 px-4 text-center text-[11px] text-muted-foreground">
            En Instagram: creá una historia con tu foto, mantené apretado y tocá «Pegar».
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function OptionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 mt-5 px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function DesignThumb({ activity, options, assets }: { activity: StravaLatest; options: StickerOptions; assets: StickerAssets }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { design, color } = options;
  const fieldsKey = options.fields.join(',');
  useEffect(() => {
    if (!ref.current) return;
    drawSticker(ref.current, activity, { design, color, fields: fieldsKey ? (fieldsKey.split(',') as StickerField[]) : [] }, assets, 0.12);
  }, [activity, design, color, fieldsKey, assets]);
  return <canvas ref={ref} className="max-h-full max-w-full object-contain" />;
}
