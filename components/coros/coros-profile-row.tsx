'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Watch } from 'lucide-react';
import { toast } from 'sonner';

/**
 * COROS en Perfil: vincular o desvincular. Desvincular no borra nada en COROS
 * (los entrenamientos ya enviados quedan en su calendario), así que no pide
 * confirmación.
 */
export function CorosProfileRow({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function disconnect() {
    setBusy(true);
    try {
      const res = await fetch('/api/client/coros', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Desvinculaste COROS.');
      router.refresh();
    } catch {
      toast.error('No se pudo desvincular COROS. Probá de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-neutral-900 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-black">
          <Watch className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">COROS</p>
          <p className="text-xs text-muted-foreground">
            {connected ? 'Vinculado · los entrenamientos van a tu reloj' : 'Sin vincular'}
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
          // Navegación completa: la ruta redirige a COROS.
          <a
            href="/api/coros/connect"
            className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-black hover:bg-neutral-200"
          >
            Vincular
          </a>
        )}
      </div>
      {!connected && (
        // La pantalla de COROS dice "COROS MCP" y pide permisos amplios: mejor que no sorprenda.
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          COROS te va a pedir autorizar a «COROS MCP» y acceso a tus datos. Grupo TT sólo lo usa para mandarte los
          entrenamientos: no leemos tus actividades ni tus datos de salud.
        </p>
      )}
    </div>
  );
}
