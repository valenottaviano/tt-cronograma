'use client';

import { useState } from 'react';
import { Check, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GarminConnectIcon } from '@/components/garmin/garmin-connect-icon';
import type { GarminState } from '@/lib/coachApi';
import { downloadFile } from '@/lib/download-file';
import { cn } from '@/lib/utils';

/** El azul de Garmin. */
const GARMIN_BLUE = '#007CC3';

const CABLE_STEPS = [
  'Descargá el entrenamiento con el botón de abajo.',
  'Conectá el reloj a la compu con su cable.',
  <>Copiá el archivo a la carpeta <span className="font-mono text-foreground">GARMIN › NewFiles</span> del reloj.</>,
  <>Desconectalo: el entrenamiento aparece en <span className="font-semibold text-foreground">Entrenamientos</span>, listo para empezar.</>,
];

/** El estado de Garmin del atleta: se pregunta una vez por carga de página, lo comparten todos los botones. */
let garminState: Promise<GarminState> | null = null;
function loadGarminState(): Promise<GarminState> {
  garminState ??= fetch('/api/client/garmin')
    .then((res) => (res.ok ? res.json() : { data: { enabled: false } }))
    .then((json) => json.data as GarminState)
    .catch(() => ({ enabled: false }) as GarminState);
  return garminState;
}

type Sending = 'idle' | 'sending' | 'sent';

/**
 * "Enviar a Garmin Connect". Con la cuenta vinculada, pone el entrenamiento en
 * el calendario de Garmin Connect ese día y el reloj lo recibe al sincronizar.
 * Si no está vinculada, explica cómo vincularla; y si Garmin todavía no está
 * habilitado para el atleta (o la variante sólo tiene un .fit subido a mano),
 * queda el camino de siempre: descargar el .fit y pasarlo por cable.
 *
 * Las reglas de marca de Garmin piden nombrar la app completa ("Garmin
 * Connect") con su ícono, y no usar el logo de Garmin solo.
 */
export function SendToGarminButton({
  fitUrl, variantId, date, sendable, className,
}: {
  fitUrl: string;
  variantId?: string;
  /** El día del calendario, YYYY-MM-DD. */
  date?: string;
  /** La variante tiene el entrenamiento armado en el panel (no sólo un .fit subido). */
  sendable: boolean;
  className?: string;
}) {
  const [sheet, setSheet] = useState<'connect' | 'cable' | null>(null);
  const [sending, setSending] = useState<Sending>('idle');

  async function onClick() {
    const state = await loadGarminState();
    const direct = sendable && variantId && date && state.enabled;
    if (!direct) return setSheet('cable');
    if (!state.connected || !state.canSend) return setSheet('connect');

    setSending('sending');
    try {
      const res = await fetch('/api/client/garmin/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, date }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'No se pudo mandar a Garmin Connect. Probá de nuevo.');
      setSending('sent');
      toast.success(
        json.data?.alreadySent
          ? 'Ya estaba en tu calendario de Garmin Connect.'
          : 'Listo: está en tu calendario de Garmin Connect. Sincronizá el reloj para tenerlo.',
      );
    } catch (err) {
      setSending('idle');
      toast.error(err instanceof Error ? err.message : 'No se pudo mandar a Garmin Connect.');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={sending === 'sending'}
        className={cn(className, 'gap-2 border-transparent bg-[#007CC3] pl-1.5 font-semibold text-white hover:bg-[#0069a8] disabled:opacity-70')}
      >
        {sending === 'sending' ? (
          <Loader2 className="h-6 w-6 animate-spin p-1" />
        ) : sending === 'sent' ? (
          <Check className="h-6 w-6 p-1" />
        ) : (
          <GarminConnectIcon className="h-6 w-6" />
        )}
        {sending === 'sent' ? 'Enviado a Garmin Connect' : 'Enviar a Garmin Connect'}
      </button>

      <Sheet open={sheet !== null} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl border-border bg-neutral-950 px-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader className="px-5 pb-0">
            <SheetTitle className="flex items-center gap-2.5 text-left">
              <GarminConnectIcon className="h-7 w-7" /> Enviar a Garmin Connect
            </SheetTitle>
            <SheetDescription className="text-left">
              {sheet === 'connect'
                ? 'Vinculá tu cuenta una sola vez y los entrenamientos llegan solos a tu reloj Garmin.'
                : 'Funciona solo con relojes Garmin.'}
            </SheetDescription>
          </SheetHeader>

          {sheet === 'connect' ? <ConnectSteps /> : <CableSteps fitUrl={fitUrl} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ConnectSteps() {
  return (
    <div className="mt-2 space-y-4 px-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Te llevamos a Garmin Connect para que autorices a Grupo TT. Dejá activado el permiso de{' '}
        <span className="font-semibold text-foreground">importar entrenamientos</span>: es lo único que usamos, no
        vemos tus actividades ni tus datos de salud.
      </p>
      {/* Navegación completa: la ruta redirige a Garmin. */}
      <a
        href="/api/garmin/connect"
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
        style={{ background: GARMIN_BLUE }}
      >
        Vincular Garmin Connect
      </a>
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        También lo podés vincular o desvincular desde Perfil.
      </p>
    </div>
  );
}

function CableSteps({ fitUrl }: { fitUrl: string }) {
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    await downloadFile(fitUrl);
    setDownloading(false);
  }

  return (
    <>
      <ol className="mt-2 space-y-3 px-5">
        {CABLE_STEPS.map((step, i) => (
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
    </>
  );
}
