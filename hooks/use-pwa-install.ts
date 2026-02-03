"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Helper to detect iOS on initial render (avoids SSR issues)
function getIsIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const windowWithMsStream = typeof window !== "undefined"
    ? (window as Window & { MSStream?: unknown })
    : null;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !windowWithMsStream?.MSStream;
}

// Helper to detect standalone mode
function getIsStandalone(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  const navigatorStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return mediaQuery.matches || Boolean(navigatorStandalone);
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Compute static values once (safe for SSR)
  const isIOS = getIsIOS();
  const [isStandalone, setIsStandalone] = useState(getIsStandalone);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const handleMediaChange = (event: MediaQueryListEvent) => {
      const navigatorStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
      const standalone = event.matches || Boolean(navigatorStandalone);
      setIsStandalone(standalone);
      if (standalone) {
        setIsInstallable(false);
      }
    };

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the PWA install prompt");
    } else {
      console.log("User dismissed the PWA install prompt");
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  }, [deferredPrompt]);

  return {
    isInstallable,
    isIOS,
    isStandalone,
    handleInstallClick,
  };
}
