import { NextRequest, NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";
import { getAppointments, bookAppointment, ApiError } from "@/lib/coachApi";

export async function GET() {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const data = await getAppointments(session.token);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      session.destroy();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Que el turno exista y esté libre lo valida el panel; acá sólo se pasa. */
export async function POST(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const created = await bookAppointment(
      { startsAt: body.startsAt, reason: body.reason, note: body.note ?? null },
      session.token
    );
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        session.destroy();
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}
