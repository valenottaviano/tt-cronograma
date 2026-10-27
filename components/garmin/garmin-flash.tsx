'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

const MESSAGES: Record<string, { kind: 'success' | 'error' | 'message'; text: string }> = {
  connected: { kind: 'success', text: '¡Listo! Vinculaste Garmin Connect. Ya podés mandar tus entrenamientos al reloj.' },
  cancelled: { kind: 'message', text: 'No se vinculó Garmin Connect. Podés hacerlo cuando quieras.' },
  taken: { kind: 'error', text: 'Esa cuenta de Garmin ya está vinculada a otro atleta.' },
  permission: {
    kind: 'error',
    text: 'Quedó vinculado, pero sin el permiso de importar entrenamientos. Activalo para Grupo TT en Garmin Connect.',
  },
  error: { kind: 'error', text: 'No pudimos vincular Garmin Connect. Probá de nuevo en un momento.' },
};

/** El resultado de volver de Garmin (`?garmin=`): se avisa una vez y se limpia la URL. */
export function GarminFlash({ result }: { result?: string }) {
  useEffect(() => {
    const message = result ? MESSAGES[result] : undefined;
    if (!message) return;
    if (message.kind === 'message') toast(message.text);
    else toast[message.kind](message.text);
    const url = new URL(window.location.href);
    url.searchParams.delete('garmin');
    window.history.replaceState(window.history.state, '', url);
  }, [result]);

  return null;
}
