import { NextRequest, NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';
import { ApiError, connectStrava } from '@/lib/coachApi';

/**
 * La vuelta de Strava. El código se lo pasa al panel, que es quien tiene el
 * secreto de la app y guarda la conexión. El resultado vuelve a Inicio como
 * `?strava=` para mostrar el aviso que corresponda.
 */
export async function GET(req: NextRequest) {
  const back = (result: string) => NextResponse.redirect(new URL(`/inicio?strava=${result}`, req.url));
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.redirect(new URL('/', req.url));

  const params = req.nextUrl.searchParams;
  const code = params.get('code');
  const state = params.get('state');
  // El atleta tocó "Cancelar" en Strava.
  if (params.get('error') || !code || !state) return back('cancelled');

  try {
    await connectStrava({ code, state, scope: params.get('scope') ?? '' }, session.token);
    return back('connected');
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) return back('taken');
    if (err instanceof ApiError && err.status === 400 && err.message.includes('permiso')) return back('scope');
    return back('error');
  }
}
