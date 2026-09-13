import { redirect } from 'next/navigation';

/** Fuera de servicio: las carreras se editan en el panel del coach. */
export default function EditRacePage() {
  redirect('/admin/races');
}
