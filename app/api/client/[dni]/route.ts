import { NextResponse } from "next/server";
import { getSchedules, ApiError } from "@/lib/coachApi";
import { getAthleteSession } from "@/lib/session";

export async function GET() {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const data = await getSchedules(session.token);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await session.destroy();
      return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
