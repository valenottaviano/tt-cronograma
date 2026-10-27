import { NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';
import { ApiError, sendToGarmin } from '@/lib/coachApi';

/** Manda un entrenamiento a Garmin Connect. Los mensajes de error los arma el panel. */
export async function POST(req: Request) {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await req.json().catch(() => null);
  try {
    return NextResponse.json({ data: await sendToGarmin(body, session.token) });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: 'No se pudo mandar a Garmin Connect. Probá de nuevo.' }, { status: 500 });
  }
}
