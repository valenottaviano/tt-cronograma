import { NextResponse, type NextRequest } from 'next/server';

export type LinkedApp = 'strava' | 'garmin';

/** Dónde se muestra el resultado dentro de la app, con sesión. */
const IN_APP: Record<LinkedApp, string> = { strava: '/inicio', garmin: '/perfil' };

/** Cookie con el nombre del atleta para la pantalla de "Volvé a la app": no va en la URL. */
export const LINKED_NAME_COOKIE = 'vinculado_nombre';

/**
 * A dónde mandar al atleta después de volver de Strava o Garmin.
 *
 * Con sesión, a la app, que muestra el aviso (`?strava=` / `?garmin=`). Sin
 * sesión es el caso de la app instalada en el iPhone: Strava y Garmin vuelven al
 * navegador, que no comparte la sesión con la app. La vinculación igual se hizo
 * (el panel identifica al atleta por el `state`), así que sólo hay que decirle
 * que vuelva a la app: `/vinculado`.
 */
export function oauthReturn(
  req: NextRequest,
  app: LinkedApp,
  result: string,
  { loggedIn, athleteName }: { loggedIn: boolean; athleteName?: string },
): NextResponse {
  if (loggedIn) return NextResponse.redirect(new URL(`${IN_APP[app]}?${app}=${result}`, req.url));

  const res = NextResponse.redirect(new URL(`/vinculado?app=${app}&result=${result}`, req.url));
  if (athleteName) {
    res.cookies.set(LINKED_NAME_COOKIE, athleteName, { httpOnly: true, sameSite: 'lax', path: '/vinculado', maxAge: 120 });
  }
  return res;
}
