import { NextRequest, NextResponse } from "next/server";
import { ApiError, forgotPassword } from "@/lib/coachApi";

export async function POST(req: NextRequest) {
  const { dni } = await req.json().catch(() => ({}));
  if (!dni) return NextResponse.json({ error: "DNI requerido" }, { status: 400 });

  try {
    return NextResponse.json({ data: await forgotPassword(String(dni).trim()) });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status });
  }
}
