"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Download } from "lucide-react";
import { Button } from "./ui/button";

export function PWAInstallToast() {
  const { isInstallable, isIOS, isStandalone, handleInstallClick } = usePWAInstall();
  const [hasShownToast, setHasShownToast] = useState(false);

  // useEffect(() => {
  //   if (hasShownToast) return;

  //   if (isInstallable) {
  //     toast("¡Instala nuestra App!", {
  //       description: "Accede rápidamente a tus beneficios y cronogramas desde nuestra app.",
  //       duration: 10000,
  //       action: {
  //         label: "Instalar",
  //         onClick: () => handleInstallClick(),
  //       },
  //       icon: <Download className="h-5 w-5" />,
  //     });
  //     setHasShownToast(true);
  //   } else if (isIOS && !isStandalone) {
  //     // Check if they are in Chrome/Firefox on iOS
  //     const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
  //     toast("Para instalar en iPhone:", {
  //       description: isSafari 
  //         ? "Toca el botón 'Compartir' y luego 'Agregar a inicio'." 
  //         : "Esta app solo se puede instalar usando Safari. Abre este enlace en Safari para instalar.",
  //       duration: 20000,
  //       icon: <Download className="h-5 w-5" />,
  //     });
  //     setHasShownToast(true);
  //   }
  // }, [isInstallable, isIOS, isStandalone, hasShownToast, handleInstallClick]);

  return null;
}
