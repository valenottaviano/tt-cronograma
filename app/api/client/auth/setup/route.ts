import { NextRequest, NextResponse } from "next/server";
import { setupProfile, loginAthlete } from "@/lib/coachApi";
import { getAthleteSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { dni, email, password, phone, avatarKey } = body;

  if (!dni || !email || !password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  try {
    await setupProfile({ dni, email, password, phone, avatarKey });

    // Auto-login after setup
    const result = await loginAthlete(dni, password);
    const session = await getAthleteSession();
    session.token = result.token;
    session.dni = result.dni;
    session.name = result.name;
    await session.save();

    return NextResponse.json({ data: { dni: result.dni } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
