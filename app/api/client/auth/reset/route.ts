import { NextRequest, NextResponse } from "next/server";
import { ApiError, loginAthlete, resetPassword } from "@/lib/coachApi";
import { getAthleteSession } from "@/lib/session";

/**
 * Contraseña nueva desde el link del mail. Sin `password` sólo valida el link;
 * con ella la cambia y deja al atleta adentro, como el alta.
 */
export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "Falta el link" }, { status: 400 });

  try {
    const result = await resetPassword(token, password || undefined);
    if (!password || !result.dni) return NextResponse.json({ data: { name: result.name } });

    const login = await loginAthlete(result.dni, password);
    const session = await getAthleteSession();
    session.token = login.token;
    session.dni = login.dni;
    session.name = login.name;
    await session.save();
    return NextResponse.json({ data: { dni: login.dni, name: login.name } });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status });
  }
}
