import { NextResponse } from "next/server";
import { ApiError, refreshAthleteToken } from "@/lib/coachApi";
import { getAthleteSession } from "@/lib/session";

/** Renovar más seguido no aporta: el token dura 400 días. */
const RENEW_EVERY_MS = 24 * 60 * 60 * 1000;

/**
 * Mantiene viva la sesión del atleta: pide al panel un token nuevo y vuelve a
 * guardar la cookie, que así arranca otra vez sus 400 días.
 *
 * Si el panel no responde (deploy, red), la sesión sigue como estaba: el token
 * actual todavía es válido y se reintenta la próxima vez. Sólo un 401 la cierra.
 */
export async function POST() {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.renewedAt && Date.now() - session.renewedAt < RENEW_EVERY_MS) {
    return NextResponse.json({ data: { renewed: false } });
  }

  try {
    const result = await refreshAthleteToken(session.token);
    session.token = result.token;
    session.name = result.name;
    session.renewedAt = Date.now();
    await session.save();
    return NextResponse.json({ data: { renewed: true } });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      session.destroy();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ data: { renewed: false } });
  }
}
