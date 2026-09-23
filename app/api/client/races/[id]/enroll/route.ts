import { NextRequest, NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";
import { enrollRace, unenrollRace, updateRaceDistance, ApiError } from "@/lib/coachApi";

/** El body es opcional: `{ distance }` si el atleta la escribió, nada si no. */
async function readDistance(req: NextRequest): Promise<string | null> {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.distance !== "string") return null;
  const trimmed = body.distance.trim();
  return trimmed === "" ? null : trimmed;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const distance = await readDistance(req);

  try {
    const result = await enrollRace(id, session.token, distance);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      // Ya estaba inscripto: el POST es un reintento. Guardamos igual la
      // distancia que vino, así no se pierde lo que acaba de escribir.
      if (err.status === 409) {
        try {
          await updateRaceDistance(id, distance, session.token);
        } catch { /* si falla, la inscripción ya existe igual */ }
        return NextResponse.json({ data: null }, { status: 200 });
      }
      if (err.status === 401) {
        session.destroy();
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const distance = await readDistance(req);

  try {
    const result = await updateRaceDistance(id, distance, session.token);
    return NextResponse.json({ data: result });
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await unenrollRace(id, session.token);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) return new NextResponse(null, { status: 204 });
      if (err.status === 401) {
        session.destroy();
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}
