import { redirect } from 'next/navigation';

/** Fuera de servicio: los tracks se cargan en el panel del coach. */
export default function NewTrackPage() {
  redirect('/admin/tracks');
}
