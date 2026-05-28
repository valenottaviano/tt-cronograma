import { NextRequest, NextResponse } from "next/server";
import { loginAthlete } from "@/lib/coachApi";
import { getAthleteSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { dni, password } = await req.json();
  if (!dni || !password) {
    return NextResponse.json({ error: "DNI y contraseña requeridos" }, { status: 400 });
  }

  try {
    const result = await loginAthlete(dni, password);
    const session = await getAthleteSession();
    session.token = result.token;
    session.dni = result.dni;
    session.name = result.name;
    await session.save();
    return NextResponse.json({ data: { dni: result.dni, name: result.name } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
