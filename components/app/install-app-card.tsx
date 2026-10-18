'use client';

import { useState, useSyncExternalStore } from 'react';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';

const DISMISS_KEY = 'tt-install-card-dismissed';

const subscribeNoop = () => () => {};

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    // Sin almacenamiento (modo privado): se muestra igual.
    return false;
  }
}

/**
 * Invita a instalar la app desde Inicio. En Android (y Chrome de escritorio)
 * usa el aviso nativo; en iPhone no existe, así que explica los dos toques de
 * Safari. No aparece si ya está instalada o si el atleta la cerró.
 */
export function InstallAppCard() {
  const { isInstallable, isIOS, isStandalone, handleInstallClick } = usePWAInstall();
  // `null` en el servidor y al hidratar: iOS y «ya instalada» sólo se saben en
  // el navegador, y decidirlo en el primer render rompería la hidratación.
  const storedDismissed = useSyncExternalStore(subscribeNoop, readDismissed, () => null);
  const [dismissedNow, setDismissedNow] = useState(false);

  function dismiss() {
    setDismissedNow(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Sin almacenamiento: se cierra sólo por esta vez.
    }
  }

  if (storedDismissed !== false || dismissedNow || isStandalone || (!isInstallable && !isIOS)) return null;

  const isSafari = isIOS && /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);

  return (
    <section className="relative rounded-2xl border border-border bg-neutral-900 p-4 pr-10">
      <button
        type="button"
        onClick={dismiss}
        aria-label="No mostrar más"
        className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground hover:bg-neutral-800 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="font-semibold">Tené TT en tu pantalla de inicio</p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Se abre como una app, directo en tu entrenamiento del día.
      </p>

      {isInstallable ? (
        <Button onClick={handleInstallClick} className="mt-3 gap-2 border-0 bg-red-600 text-white hover:bg-red-700">
          <Download className="h-4 w-4" /> Instalar
        </Button>
      ) : isSafari ? (
        <ol className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-muted-foreground">1.</span> Tocá
            <Share className="h-4 w-4 text-sky-400" />
            <span className="font-semibold">Compartir</span> abajo en Safari
          </li>
          <li className="flex items-center gap-2">
            <span className="text-muted-foreground">2.</span> Elegí
            <SquarePlus className="h-4 w-4" />
            <span className="font-semibold">Agregar a inicio</span>
          </li>
        </ol>
      ) : (
        <p className="mt-3 text-sm">
          En iPhone se instala desde <span className="font-semibold">Safari</span>: abrí esta página ahí.
        </p>
      )}
    </section>
  );
}
