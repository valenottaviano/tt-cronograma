import { redirect } from "next/navigation";

/**
 * La planilla vieja. Ahora es la pestaña «Entrenamiento» de la app; esta ruta
 * queda para no romper los accesos guardados y las PWA instaladas con esta URL.
 */
export default function SchedulePage() {
  redirect("/entrenamiento");
}
