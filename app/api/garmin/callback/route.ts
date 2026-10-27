import { NextRequest, NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';
import { ApiError, connectGarmin } from '@/lib/coachApi';

/**
 * La vuelta de Garmin. El código se lo pasa al panel, que tiene el secreto de
 * la app y guarda la conexión. El resultado vuelve a Perfil como `?garmin=`.
 */
export async function GET(req: NextRequest) {
  const back = (result: string) => NextResponse.redirect(new URL(`/perfil?garmin=${result}`, req.url));
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.redirect(new URL('/', req.url));

  const params = req.nextUrl.searchParams;
  const code = params.get('code');
  const state = params.get('state');
  // El atleta no aceptó en Garmin.
  if (params.get('error') || !code || !state) return back('cancelled');

  try {
    await connectGarmin({ code, state }, session.token);
    return back('connected');
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) return back('taken');
    if (err instanceof ApiError && err.status === 400 && err.message.includes('permiso')) return back('permission');
    return back('error');
  }
}
