'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GarminConnectIcon } from './garmin-connect-icon';

/**
 * Garmin Connect en Perfil: vincular o desvincular. Desvincular no borra nada
 * en Garmin Connect (los entrenamientos ya enviados quedan en su calendario),
 * así que no pide confirmación.
 */
export function GarminProfileRow({ connected, canSend }: { connected: boolean; canSend: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function disconnect() {
    setBusy(true);
    try {
      const res = await fetch('/api/client/garmin', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Desvinculaste Garmin Connect.');
      router.refresh();
    } catch {
      toast.error('No se pudo desvincular Garmin Connect. Probá de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-neutral-900 px-4 py-3">
      <GarminConnectIcon className="h-6 w-6" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Garmin Connect</p>
        <p className="text-xs text-muted-foreground">
          {!connected
            ? 'Sin vincular'
            : canSend
              ? 'Vinculado · los entrenamientos van a tu reloj'
              : 'Falta el permiso de importar entrenamientos'}
        </p>
      </div>
      {connected ? (
        <button
          type="button"
          onClick={disconnect}
          disabled={busy}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-800 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Desvincular
        </button>
      ) : (
        // Navegación completa: la ruta redirige a Garmin.
        <a
          href="/api/garmin/connect"
          className="shrink-0 rounded-full bg-[#007CC3] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0069a8]"
        >
          Vincular
        </a>
      )}
    </div>
  );
}
