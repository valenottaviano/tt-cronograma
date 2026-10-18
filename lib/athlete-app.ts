import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/coachApi';
import { getAthleteSession } from '@/lib/session';

/** La sesión del atleta, o al inicio público si no hay. */
export async function requireAthlete() {
  const session = await getAthleteSession();
  if (!session.token) redirect('/');
  return session;
}

/**
 * Corre las llamadas al panel de una pantalla. Si el JWT venció o rotó (401),
 * manda a cerrar la sesión; cualquier otro error devuelve `null` y la pantalla
 * muestra lo que pueda.
 *
 * OJO: la cookie no se puede limpiar acá. Modificar cookies en el render de un
 * Server Component da 500; se limpia en la route handler `/api/client/auth/logout`.
 * Y `redirect()` va fuera del try/catch porque Next lo implementa con un throw.
 */
export async function loadForAthlete<T>(load: () => Promise<T>): Promise<T | null> {
  let unauthorized = false;
  let result: T | null = null;
  try {
    result = await load();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) unauthorized = true;
  }
  if (unauthorized) redirect('/api/client/auth/logout');
  return result;
}
