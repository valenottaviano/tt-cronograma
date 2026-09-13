import { redirect } from 'next/navigation';

/** Fuera de servicio: los tracks se editan en el panel del coach. */
export default function EditTrackPage() {
  redirect('/admin/tracks');
}
