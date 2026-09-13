import { redirect } from 'next/navigation';

/** Fuera de servicio: los productos se cargan en el panel del coach. */
export default function NewProductPage() {
  redirect('/admin/products');
}
