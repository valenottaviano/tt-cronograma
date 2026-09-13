import { redirect } from 'next/navigation';

/**
 * Fuera de servicio: los beneficios se cargan en el panel del coach.
 * Ver app/admin/benefits/page.tsx. Escribía a Firestore, que ya nadie lee.
 */
export default function NewBenefitPage() {
  redirect('/admin/benefits');
}
