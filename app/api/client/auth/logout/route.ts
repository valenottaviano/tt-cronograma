import { NextRequest, NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";

export async function POST() {
  const session = await getAthleteSession();
  session.destroy();
  return NextResponse.json({ data: { ok: true } });
}

/**
 * GET: lo usa el redirect del render de /schedule/[dni] cuando el JWT del atleta
 * quedó inválido (401) — típicamente tras rotar JWT_SECRET. Los Server Components
 * no pueden modificar cookies; una Route Handler sí. Limpia la sesión y manda al
 * home, donde el atleta vuelve a iniciar sesión y obtiene un JWT nuevo.
 */
export async function GET(req: NextRequest) {
  const session = await getAthleteSession();
  session.destroy();
  return NextResponse.redirect(new URL("/", req.url));
}
