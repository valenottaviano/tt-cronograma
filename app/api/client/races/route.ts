import { NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";
import { getRaces, ApiError } from "@/lib/coachApi";

export async function GET() {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const races = await getRaces(session.token);
    return NextResponse.json({ data: races });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      session.destroy();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
