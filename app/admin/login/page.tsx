import { redirect } from 'next/navigation';

/**
 * Ya no hay login acá.
 *
 * El /admin quedó sin nada que administrar —todo se migró al panel del coach— así
 * que se retiró la autenticación con Firebase. Quien tenga esta URL guardada cae
 * en el índice, que explica a dónde ir.
 */
export default function AdminLoginPage() {
  redirect('/admin');
}
