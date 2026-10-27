"use client";

import { useEffect, useState } from "react";

/**
 * Cuánto del alto de la pantalla tapa el teclado, en px (0 si no está abierto).
 *
 * En el iPhone el teclado no achica la página: un panel fijado abajo (como las
 * hojas que suben desde abajo) queda detrás del teclado. Con esto se lo sube
 * lo que haga falta. Se mide con `visualViewport`, que sí se achica.
 */
export function useKeyboardInset(enabled = true): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) return;
    const update = () => setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      setInset(0);
    };
  }, [enabled]);

  return inset;
}
