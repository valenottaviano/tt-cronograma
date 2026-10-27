'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { STRAVA_ORANGE } from '@/lib/strava-format';
import { StravaLogo } from './strava-logo';

/**
 * Strava en Perfil: vincular o desvincular. Desvincular borra todo lo que se
 * trajo de Strava, por eso pide un segundo toque.
 */
export function StravaProfileRow({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function disconnect() {
    setBusy(true);
    try {
      const res = await fetch('/api/client/strava', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Desvinculaste tu Strava. Borramos tus datos de la app.');
      setConfirming(false);
      router.refresh();
    } catch {
      toast.error('No se pudo desvincular Strava. Probá de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-neutral-900 px-4 py-3">
      <div className="flex items-center gap-3">
        <StravaLogo className="h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Strava</p>
          <p className="text-xs text-muted-foreground">{connected ? 'Vinculado · tus estadísticas en Inicio' : 'Sin vincular'}</p>
        </div>
        {connected ? (
          !confirming && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="shrink-0 rounded-full bg-neutral-800 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              Desvincular
            </button>
          )
        ) : (
          <a
            href="/api/strava/connect"
            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold text-white"
            style={{ background: STRAVA_ORANGE }}
          >
            Conectar
          </a>
        )}
      </div>
      {confirming && (
        <div className="mt-3 space-y-2.5 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Se borran de la app tus actividades y estadísticas de Strava. En Strava no se borra nada.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="flex-1 rounded-full bg-neutral-800 py-2 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={disconnect}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-600 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Sí, desvincular
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
