import { NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';
import { ApiError, disconnectGarmin, getGarmin } from '@/lib/coachApi';

/** Para saber si el botón manda directo a Garmin Connect o explica cómo hacerlo. */
export async function GET() {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  try {
    return NextResponse.json({ data: await getGarmin(session.token) });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ error: 'No se pudo consultar Garmin' }, { status });
  }
}

export async function DELETE() {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  try {
    await disconnectGarmin(session.token);
    return NextResponse.json({ data: null });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ error: 'No se pudo desvincular Garmin Connect. Probá de nuevo.' }, { status });
  }
}
