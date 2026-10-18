'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { isAppRoute } from '@/lib/app-routes';

/**
 * Desde la app se abren páginas de la web pública (Beneficios, Tienda, el
 * calendario de carreras). Ahí no está la barra de pestañas, así que este botón
 * flotante devuelve a la última pantalla de la app que se vio.
 *
 * Se guarda en sessionStorage: dura lo que la pestaña, y quien nunca entró a la
 * app (un visitante sin sesión) no lo ve. Al cerrar sesión se borra.
 */
export const LAST_APP_PATH_KEY = 'tt-last-app-path';

const subscribeNoop = () => () => {};

function readLastAppPath(): string | null {
  try {
    return sessionStorage.getItem(LAST_APP_PATH_KEY);
  } catch {
    return null;
  }
}

export function forgetAppPath() {
  try {
    sessionStorage.removeItem(LAST_APP_PATH_KEY);
  } catch {
    // Sin almacenamiento: no había nada guardado.
  }
}

/** Va en el layout raíz: recuerda la pantalla de la app y, fuera de ella, ofrece volver. */
export function BackToApp() {
  const pathname = usePathname();
  const inApp = isAppRoute(pathname);
  const lastAppPath = useSyncExternalStore(subscribeNoop, readLastAppPath, () => null);

  useEffect(() => {
    if (!inApp || !pathname) return;
    try {
      sessionStorage.setItem(LAST_APP_PATH_KEY, pathname);
    } catch {
      // Sin almacenamiento: no se ofrece volver, nada más.
    }
  }, [inApp, pathname]);

  // Preguntas frecuentes ya tiene su propio «Volver a la app».
  if (inApp || !lastAppPath || pathname?.startsWith('/admin') || pathname?.startsWith('/faq')) return null;

  return (
    <Link
      href={lastAppPath}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/60 transition-transform hover:bg-red-700 active:scale-95"
    >
      <ArrowLeft className="h-4 w-4" />
      Volver a la app
    </Link>
  );
}
