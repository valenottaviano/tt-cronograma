import { NextRequest, NextResponse } from 'next/server';
import { getAthleteSession } from '@/lib/session';

const BASE = `${process.env.COACH_API_URL}/api/v1/athlete/medical-certificate`;

/**
 * Sube el apto médico: reenvía el multipart (archivo, fecha y consentimiento)
 * al panel, que comprime la foto y la guarda en MinIO.
 */
export async function POST(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Error al leer el archivo' }, { status: 400 });
  }

  const res = await fetch(BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token}` },
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) session.destroy();
    return NextResponse.json({ error: json.error ?? 'No se pudo subir el apto' }, { status: res.status });
  }
  return NextResponse.json({ data: json.data ?? null });
}

export async function DELETE() {
  const session = await getAthleteSession();
  if (!session.token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const res = await fetch(BASE, { method: 'DELETE', headers: { Authorization: `Bearer ${session.token}` } });
  if (!res.ok) {
    if (res.status === 401) session.destroy();
    return NextResponse.json({ error: 'No se pudo borrar el apto' }, { status: res.status });
  }
  return NextResponse.json({ data: null });
}
