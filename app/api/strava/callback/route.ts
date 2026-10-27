import { NextRequest } from 'next/server';
import { getAthleteSession } from '@/lib/session';
import { ApiError, connectStrava } from '@/lib/coachApi';
import { oauthReturn } from '@/lib/oauth-return';

/**
 * La vuelta de Strava. El código se lo pasa al panel, que tiene el secreto de la
 * app y guarda la conexión. No hace falta sesión: el panel identifica al atleta
 * por el `state` firmado (ver lib/oauth-return.ts).
 */
export async function GET(req: NextRequest) {
  const session = await getAthleteSession();
  const loggedIn = Boolean(session.token);
  const back = (result: string, athleteName?: string) => oauthReturn(req, 'strava', result, { loggedIn, athleteName });

  const params = req.nextUrl.searchParams;
  const code = params.get('code');
  const state = params.get('state');
  // El atleta tocó "Cancelar" en Strava.
  if (params.get('error') || !code || !state) return back('cancelled');

  try {
    const { athleteName } = await connectStrava({ code, state, scope: params.get('scope') ?? '' }, session.token);
    return back('connected', athleteName);
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) return back('taken');
    if (err instanceof ApiError && err.status === 400 && err.message.includes('permiso')) return back('scope');
    if (err instanceof ApiError && err.status === 400) return back('expired');
    return back('error');
  }
}
