'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Cuánto tiene que estar afuera el atleta para que valga la pena volver a pedir los datos. */
const MIN_AWAY_MS = 3000;

/**
 * Vuelve a pedir los datos de la página cuando el atleta regresa a la app. Es
 * para la app instalada: vincula Strava o Garmin en el navegador y vuelve, y
 * tiene que ver la cuenta ya vinculada sin recargar.
 */
export function RefreshOnReturn() {
  const router = useRouter();

  useEffect(() => {
    let hiddenAt = 0;
    function onChange() {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > MIN_AWAY_MS) router.refresh();
    }
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, [router]);

  return null;
}
