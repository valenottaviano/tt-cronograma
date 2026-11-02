import { NextRequest, NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';
import { getCorosAuthorizeUrl } from '@/lib/coachApi';

/** "Vincular COROS": el panel arma la URL (state firmado + PKCE) y se va a COROS. */
export async function GET(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.redirect(new URL('/', req.url));

  try {
    const { url } = await getCorosAuthorizeUrl(session.token);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL('/perfil?coros=error', req.url));
  }
}
