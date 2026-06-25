import { NextRequest, NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";

// Forward the receipt to the coach API, which uploads to MinIO internally and
// returns the object key. Same pattern as the avatar upload — a direct PUT to
// the presigned URL doesn't work because MinIO isn't publicly reachable.
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

  const fd = new FormData();
  fd.append("file", file, file.name);

  const res = await fetch(
    `${process.env.COACH_API_URL}/api/v1/athlete/payments/upload`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
      body: fd,
    }
  );

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) session.destroy();
    return NextResponse.json(
      { error: json.error ?? `Error ${res.status}` },
      { status: res.status }
    );
  }

  // Coach returns { data: { key } }
  return NextResponse.json({ data: json.data ?? json });
}
