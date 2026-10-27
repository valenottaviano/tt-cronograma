import { NextRequest, NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';
import { getGarminAuthorizeUrl } from '@/lib/coachApi';

/** "Vincular Garmin Connect": el panel arma la URL (state firmado + PKCE) y se va a Garmin. */
export async function GET(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.redirect(new URL('/', req.url));

  try {
    const { url } = await getGarminAuthorizeUrl(session.token);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL('/perfil?garmin=error', req.url));
  }
}
