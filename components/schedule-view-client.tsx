"use client";

/**
 * Envoltorio que renderiza ScheduleView SÓLO en el cliente (ssr: false).
 *
 * Stopgap ante un 500 de SSR: el render de ScheduleView lanza en el servidor con
 * ciertas planillas, y como el SSR de un client component tira → la ruta devuelve
 * 500. En el cliente el mismo render funciona (los celulares con la app cacheada
 * lo confirman). Renderizándolo sólo en el cliente, el servidor entrega la página
 * (200) y ScheduleView monta en el navegador, donde no rompe.
 *
 * Recibe las mismas props que ScheduleView: los datos siguen viniendo del fetch
 * server-side de la página (se serializan al cliente), no se vuelve a pedir.
 *
 * Es temporal: cuando se corrija la causa raíz del throw se vuelve al SSR normal.
 */
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { ScheduleView as ScheduleViewType } from "./schedule-view";

const ScheduleView = dynamic(
  () => import("./schedule-view").then((m) => ({ default: m.ScheduleView })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4 px-4">
        <img src="/logo-tt.png" alt="TT" className="h-12 w-auto" />
        <p className="text-muted-foreground text-center text-sm">Cargando tu planilla…</p>
      </div>
    ),
  }
);

export function ScheduleViewClient(props: ComponentProps<typeof ScheduleViewType>) {
  return <ScheduleView {...props} />;
}
