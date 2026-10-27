import { NextRequest, NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";
import { cancelAppointment, ApiError } from "@/lib/coachApi";

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
    await cancelAppointment(id, session.token);
    return new NextResponse(null, { status: 204 });
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
