'use client';

import { useEffect } from 'react';

/** Cada cuánto lo intenta el navegador. El servidor igual renueva como mucho una vez por día. */
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;
const LAST_CHECK_KEY = 'tt-session-checked-at';

function shouldCheck(): boolean {
  try {
    return Date.now() - Number(localStorage.getItem(LAST_CHECK_KEY) || 0) > CHECK_EVERY_MS;
  } catch {
    return true;
  }
}

function markChecked() {
  try {
    localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));
  } catch {
    // Sin almacenamiento: se vuelve a intentar la próxima vez, no pasa nada.
  }
}

/**
 * Renueva la sesión al abrir la app y al volver a ella (la PWA queda abierta en
 * segundo plano días enteros). Así la sesión no vence mientras se use.
 */
export function SessionKeepAlive() {
  useEffect(() => {
    function renew() {
      if (!shouldCheck()) return;
      markChecked();
      fetch('/api/client/auth/refresh', { method: 'POST' }).catch(() => {
        // Sin red: el token actual sigue valiendo, se reintenta más adelante.
      });
    }

    renew();
    const onVisible = () => {
      if (document.visibilityState === 'visible') renew();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return null;
}
