"use client";

import { useEffect, useState } from "react";

/**
 * Error boundary de la app del atleta, con auto-recuperación ante caché vieja.
 *
 * El caso frecuente tras un deploy: el PWA (Serwist) o el navegador tienen
 * cacheado un bundle de una versión anterior, que referencia chunks JS con
 * hashes que ya no existen en el build nuevo → ChunkLoadError → cae acá y el
 * atleta ve "no se puede cargar la planilla". Es transitorio: alcanza con cargar
 * los assets frescos una vez.
 *
 * Por eso, en vez de mostrar sólo un botón, primero intentamos recuperarnos
 * solos: limpiamos las cachés del service worker y hacemos una recarga dura.
 * Un flag en sessionStorage evita el loop si el error fuera real y persistente
 * (backend caído, bug de datos): tras un intento fallido, mostramos la UI manual.
 */
const RECOVER_KEY = "tt-schedule-recover-at";
const RECOVER_WINDOW_MS = 30_000;

async function hardRecover() {
  try {
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // Si no se pueden limpiar las cachés, recargamos igual: la recarga dura ya
    // fuerza al navegador a revalidar el documento y los assets contra la red.
  }
  // reload(true) está deprecado; el location.reload() moderno + cachés limpias
  // trae el HTML y los chunks nuevos, y deja que el SW nuevo (skipWaiting/
  // clientsClaim) tome control y reprecachee.
  window.location.reload();
}

function recentlyTriedToRecover(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Date.now() - Number(sessionStorage.getItem(RECOVER_KEY) || 0) < RECOVER_WINDOW_MS;
  } catch {
    // sessionStorage puede fallar (modo privado, etc.); tratamos como sin intento.
    return false;
  }
}

export default function AthleteAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Si ya intentamos recuperarnos hace poco y volvió a fallar, el error no es
  // de caché: no recargamos de nuevo y mostramos la opción manual. Si no, arranca
  // oculto, para que el atleta no vea el cartel antes de que dispare la recarga.
  const [showManual] = useState(recentlyTriedToRecover);

  useEffect(() => {
    console.error(error);
    if (showManual) return;
    try {
      sessionStorage.setItem(RECOVER_KEY, String(Date.now()));
    } catch {
      // ignorar
    }
    void hardRecover();
  }, [error, showManual]);

  if (!showManual) {
    // Estado transitorio mientras se dispara la recarga: pantalla limpia, sin
    // cartel de error, para que la recuperación sea invisible.
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4 px-4">
        <img src="/logo-tt.png" alt="TT" className="h-12 w-auto" />
        <p className="text-muted-foreground text-center text-sm">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4 px-4">
      <img src="/logo-tt.png" alt="TT" className="h-12 w-auto" />
      <p className="text-muted-foreground text-center text-sm">
        Ocurrió un error al cargar la app.
      </p>
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => {
            // Recuperación forzada: limpia cachés y recarga, más efectivo que un
            // reset() del boundary, que reintenta con el mismo bundle viejo.
            try {
              sessionStorage.removeItem(RECOVER_KEY);
            } catch {
              // ignorar
            }
            void hardRecover();
          }}
          className="text-xs text-brand-orange underline underline-offset-2"
        >
          Recargar
        </button>
        <button
          onClick={reset}
          className="text-[11px] text-muted-foreground underline underline-offset-2"
        >
          Reintentar sin recargar
        </button>
      </div>
    </div>
  );
}
