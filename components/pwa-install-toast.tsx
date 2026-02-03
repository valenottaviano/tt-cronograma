"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Download } from "lucide-react";

export function PWAInstallToast() {
  const { isInstallable, isIOS, isStandalone, handleInstallClick } = usePWAInstall();
  const hasShownToast = useRef(false);

  const showInstallToast = useCallback(() => {
    if (hasShownToast.current) return;

    toast("¡Instala nuestra App!", {
      description: "Accede rápidamente a tus beneficios y cronogramas desde nuestra app.",
      duration: 10000,
      action: {
        label: "Instalar",
        onClick: () => handleInstallClick(),
      },
      icon: <Download className="h-5 w-5" />,
    });
    hasShownToast.current = true;
  }, [handleInstallClick]);

  const showIOSToast = useCallback(() => {
    if (hasShownToast.current) return;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    toast("Para instalar en iPhone:", {
      description: isSafari
        ? "Toca el botón 'Compartir' y luego 'Agregar a inicio'."
        : "Esta app solo se puede instalar usando Safari. Abre este enlace en Safari para instalar.",
      duration: 20000,
      icon: <Download className="h-5 w-5" />,
    });
    hasShownToast.current = true;
  }, []);

  useEffect(() => {
    if (isInstallable) {
      showInstallToast();
    } else if (isIOS && !isStandalone) {
      showIOSToast();
    }
  }, [isInstallable, isIOS, isStandalone, showInstallToast, showIOSToast]);

  return null;
}
