'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Watch } from 'lucide-react';
import { toast } from 'sonner';
import type { CorosState } from '@/lib/coachApi';
import { cn } from '@/lib/utils';

/**
 * El estado de COROS del atleta: lo comparten todos los botones y se vuelve a
 * preguntar cuando el atleta regresa a la app (puede haber vinculado la cuenta
 * en el navegador mientras tanto).
 */
let corosState: Promise<CorosState> | null = null;
function loadCorosState(): Promise<CorosState> {
  corosState ??= fetch('/api/client/coros')
    .then((res) => (res.ok ? res.json() : { data: { enabled: false } }))
    .then((json) => json.data as CorosState)
    .catch(() => ({ enabled: false }) as CorosState);
  return corosState;
}

/** Hoy en Argentina, YYYY-MM-DD: COROS no acepta días pasados. */
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());

type Sending = 'idle' | 'sending' | 'sent';

/**
 * "Enviar a COROS": pone el entrenamiento en el calendario de COROS ese día y
 * el reloj lo recibe al sincronizar. A diferencia del de Garmin, sólo aparece si
 * el atleta ya vinculó COROS desde Perfil: así los que usan Garmin no ven un
 * botón que no les sirve.
 */
export function SendToCorosButton({
  variantId,
  date,
  className,
}: {
  variantId: string;
  /** El día del calendario, YYYY-MM-DD. */
  date: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState<Sending>('idle');

  useEffect(() => {
    let alive = true;
    const check = () => loadCorosState().then((s) => alive && setVisible(s.enabled && s.connected && date >= today()));
    check();
    function onChange() {
      if (document.visibilityState !== 'visible') return;
      corosState = null;
      check();
    }
    document.addEventListener('visibilitychange', onChange);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onChange);
    };
  }, [date]);

  async function onClick() {
    setSending('sending');
    try {
      const res = await fetch('/api/client/coros/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, date }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'No se pudo mandar a COROS. Probá de nuevo.');
      setSending('sent');
      toast.success(
        json.data?.alreadySent
          ? 'Ya estaba en tu calendario de COROS.'
          : 'Listo: está en tu calendario de COROS. Sincronizá el reloj para tenerlo.',
      );
    } catch (err) {
      setSending('idle');
      // Se desvinculó desde COROS: el botón se va hasta que vuelva a vincular.
      corosState = null;
      toast.error(err instanceof Error ? err.message : 'No se pudo mandar a COROS.');
    }
  }

  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={sending === 'sending'}
      className={cn(
        className,
        'gap-2 border-transparent bg-white pl-1.5 font-semibold text-black hover:bg-neutral-200 disabled:opacity-70',
      )}
    >
      {sending === 'sending' ? (
        <Loader2 className="h-6 w-6 animate-spin p-1" />
      ) : sending === 'sent' ? (
        <Check className="h-6 w-6 p-1" />
      ) : (
        <Watch className="h-6 w-6 p-1" />
      )}
      {sending === 'sent' ? 'Enviado a COROS' : 'Enviar a COROS'}
    </button>
  );
}
