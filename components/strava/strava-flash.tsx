'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

const MESSAGES: Record<string, { kind: 'success' | 'error' | 'message'; text: string }> = {
  connected: { kind: 'success', text: '¡Listo! Vinculaste tu Strava. Estamos trayendo tus actividades.' },
  cancelled: { kind: 'message', text: 'No se vinculó Strava. Podés hacerlo cuando quieras.' },
  taken: { kind: 'error', text: 'Esa cuenta de Strava ya está vinculada a otro atleta.' },
  scope: { kind: 'error', text: 'Para ver tus estadísticas, dejá marcado el permiso de ver tus actividades.' },
  error: { kind: 'error', text: 'No pudimos vincular Strava. Probá de nuevo en un momento.' },
};

/** El resultado de volver de Strava (`?strava=`): se avisa una vez y se limpia la URL. */
export function StravaFlash({ result }: { result?: string }) {
  useEffect(() => {
    const message = result ? MESSAGES[result] : undefined;
    if (!message) return;
    if (message.kind === 'message') toast(message.text);
    else toast[message.kind](message.text);
    const url = new URL(window.location.href);
    url.searchParams.delete('strava');
    window.history.replaceState(window.history.state, '', url);
  }, [result]);

  return null;
}
