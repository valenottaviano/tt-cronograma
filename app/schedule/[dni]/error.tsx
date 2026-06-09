"use client";

import { useEffect } from "react";

export default function ScheduleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4 px-4">
      <img src="/logo-tt.png" alt="TT" className="h-12 w-auto" />
      <p className="text-muted-foreground text-center text-sm">
        Ocurrió un error al cargar la planilla.
      </p>
      <button
        onClick={reset}
        className="text-xs text-brand-orange underline underline-offset-2"
      >
        Reintentar
      </button>
    </div>
  );
}
