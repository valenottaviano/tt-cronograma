'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Mientras el panel importa el historial, pregunta cada tanto si terminó y
 * entonces recarga Inicio con las estadísticas. Se rinde a los 10 minutos.
 */
export function StravaSyncWatcher() {
  const router = useRouter();

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(async () => {
      if (Date.now() - startedAt > 10 * 60 * 1000) return clearInterval(timer);
      try {
        const res = await fetch('/api/client/strava', { cache: 'no-store' });
        const json = await res.json();
        if (json.data?.connected && json.data.syncStatus === 'READY') {
          clearInterval(timer);
          router.refresh();
        }
      } catch {
        // Sin red: se vuelve a probar en la próxima vuelta.
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
