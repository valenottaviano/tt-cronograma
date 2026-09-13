import { redirect } from 'next/navigation';

/** Fuera de servicio: los productos se editan en el panel del coach. */
export default function EditProductPage() {
  redirect('/admin/products');
}
