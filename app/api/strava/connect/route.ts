import { NextRequest, NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';
import { getStravaAuthorizeUrl } from '@/lib/coachApi';

/** "Conectar con Strava": el panel arma la URL (con el state firmado) y se va a Strava. */
export async function GET(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.redirect(new URL('/', req.url));

  try {
    const { url } = await getStravaAuthorizeUrl(session.token);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL('/inicio?strava=error', req.url));
  }
}
