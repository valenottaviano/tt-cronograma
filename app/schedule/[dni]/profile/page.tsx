import { redirect } from "next/navigation";

/** El perfil viejo. Ahora es la pestaña «Perfil» de la app. */
export default function ProfilePage() {
  redirect("/perfil");
}
