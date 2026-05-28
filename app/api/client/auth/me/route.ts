import { NextRequest, NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";

export async function GET() {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json({ data: { dni: session.dni, name: session.name } });
}

export async function PATCH(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const res = await fetch(`${process.env.COACH_API_URL}/api/client/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return NextResponse.json({ error: json.error ?? "Error inesperado" }, { status: res.status });
  return NextResponse.json({ data: json.data ?? json });
}
