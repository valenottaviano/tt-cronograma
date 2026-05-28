import { NextRequest, NextResponse } from "next/server";
import { getPersonByDni } from "@/lib/credential";
import { checkDni } from "@/lib/coachApi";

export async function POST(req: NextRequest) {
  const { dni } = await req.json();
  if (!dni) return NextResponse.json({ error: "DNI requerido" }, { status: 400 });

  const person = await getPersonByDni(dni);
  if (!person) {
    return NextResponse.json({ data: { exists: false, hasAccount: false } });
  }

  try {
    const result = await checkDni(dni);
    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ data: { exists: true, hasAccount: false } });
  }
}
