'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GarminLogo } from '@/components/app/garmin-logo';
import { downloadFile } from '@/lib/download-file';
import { cn } from '@/lib/utils';

/** El azul de Garmin. */
const GARMIN_BLUE = '#007CC3';

const STEPS = [
  'Descargá el entrenamiento con el botón de abajo.',
  'Conectá el reloj a la compu con su cable.',
  <>Copiá el archivo a la carpeta <span className="font-mono text-foreground">GARMIN › NewFiles</span> del reloj.</>,
  <>Desconectalo: el entrenamiento aparece en <span className="font-semibold text-foreground">Entrenamientos</span>, listo para empezar.</>,
];

/**
 * "Enviar a Garmin": el .fit armado en el panel, con los pasos para pasarlo al
 * reloj. Lleva el logo de Garmin a propósito: las apps de COROS, Suunto y
 * compañía no importan entrenamientos desde un archivo, y no hay que prometerlo.
 *
 * No es un envío directo: eso pide la API de Garmin Connect (programa de socios
 * con aprobación). Por ahora es descarga + cable.
 */
export function SendToGarminButton({ fitUrl, className }: { fitUrl: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    await downloadFile(fitUrl);
    setDownloading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(className, 'gap-2 border-transparent bg-[#007CC3] font-semibold text-white hover:bg-[#0069a8]')}
      >
        Enviar a <GarminLogo className="ml-0.5 h-[9px] w-auto" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-border bg-neutral-950 px-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader className="px-5 pb-0">
            <SheetTitle className="flex items-center gap-2 text-left">
              Enviar a tu <GarminLogo className="ml-0.5 h-[13px] w-auto text-white" />
            </SheetTitle>
            <SheetDescription className="text-left">Funciona solo con relojes Garmin.</SheetDescription>
          </SheetHeader>

          <ol className="mt-2 space-y-3 px-5">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: GARMIN_BLUE }}
                >
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 px-5">
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: GARMIN_BLUE }}
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Descargar entrenamiento
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              En Mac, los relojes más nuevos se abren con la app gratuita OpenMTP.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
