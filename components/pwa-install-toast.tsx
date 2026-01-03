"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Download } from "lucide-react";
import { Button } from "./ui/button";

export function PWAInstallToast() {
  const { isInstallable, handleInstallClick } = usePWAInstall();
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (isInstallable && !hasShownToast) {
      toast("¡Instala nuestra App!", {
        description: "Accede rápidamente a tus beneficios y cronogramas desde nuestra app.",
        duration: 10000,
        action: {
          label: "Instalar",
          onClick: () => handleInstallClick(),
        },
        icon: <Download className="h-5 w-5" />,
      });
      setHasShownToast(true);
    }
  }, [isInstallable, hasShownToast, handleInstallClick]);

  return null;
}
