import { redirect } from 'next/navigation';

/** Fuera de servicio: las carreras se cargan en el panel del coach. */
export default function NewRacePage() {
  redirect('/admin/races');
}
