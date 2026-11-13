import { NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';

/** El archivo del apto del atleta, pasado por el servidor: MinIO no es público. */
export async function GET() {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const res = await fetch(`${process.env.COACH_API_URL}/api/v1/athlete/medical-certificate/file`, {
    headers: { Authorization: `Bearer ${session.token}` },
    cache: 'no-store',
  });
  if (!res.ok || !res.body) {
    return NextResponse.json({ error: 'No hay apto cargado' }, { status: res.status === 401 ? 401 : 404 });
  }
  return new NextResponse(res.body, {
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': res.headers.get('content-disposition') ?? 'inline',
      'Cache-Control': 'private, no-store',
    },
  });
}
