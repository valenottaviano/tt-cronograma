import { NextRequest, NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const formData = await req.formData();
    file = formData.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Error al leer el archivo" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  // Forward to plan.grupott.com.ar — it reaches MinIO internally
  const fd = new FormData();
  fd.append("file", file, file.name);

  const res = await fetch(`${process.env.COACH_API_URL}/api/client/auth/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: fd,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: json.error ?? `Error ${res.status}` },
      { status: res.status }
    );
  }

  return NextResponse.json({ data: json.data ?? json });
}
