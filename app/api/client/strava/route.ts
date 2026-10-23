import { NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';
import { ApiError, disconnectStrava, getStrava } from '@/lib/coachApi';

/** Para preguntar si ya terminó la importación mientras Inicio muestra "Sincronizando". */
export async function GET() {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  try {
    return NextResponse.json({ data: await getStrava(session.token) });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ error: 'No se pudo consultar Strava' }, { status });
  }
}

export async function DELETE() {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  try {
    await disconnectStrava(session.token);
    return NextResponse.json({ data: null });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ error: 'No se pudo desvincular Strava. Probá de nuevo.' }, { status });
  }
}
