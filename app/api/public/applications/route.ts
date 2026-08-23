import { NextRequest, NextResponse } from "next/server";
import { submitApplication, ApiError } from "@/lib/coachApi";
import { buildApplicationPayload, ALL_FIELDS, isFieldVisible } from "@/lib/join-form";

/**
 * Recibe el formulario de ingreso del navegador y lo reenvía al panel del coach.
 * El secreto compartido vive solo acá (server-side), nunca en el cliente.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const values = body as Record<string, string>;

  // Se revalida en el servidor lo mismo que valida el wizard: un required
  // visible no puede llegar vacío.
  const missing = ALL_FIELDS.filter(
    (f) => f.required && isFieldVisible(f, values) && !(values[f.id] ?? "").trim()
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Falta completar: ${missing.map((f) => f.label).join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim();
    const result = await submitApplication(buildApplicationPayload(values), clientIp);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      // 429 y 400 son del usuario; el resto es problema nuestro y no le sirve verlo.
      if (err.status === 429 || err.status === 400) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("Error al enviar la solicitud al coach:", err.status, err.message);
      return NextResponse.json(
        { error: "No pudimos enviar tu solicitud. Probá de nuevo en un rato." },
        { status: 502 }
      );
    }
    console.error("Error inesperado al enviar la solicitud:", err);
    return NextResponse.json(
      { error: "No pudimos enviar tu solicitud. Probá de nuevo en un rato." },
      { status: 500 }
    );
  }
}
