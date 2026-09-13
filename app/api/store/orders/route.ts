import { NextRequest, NextResponse } from "next/server";
import { ApiError, createCoachOrder } from "@/lib/coachApi";

/**
 * Alta de un pedido de la tienda.
 *
 * Antes el navegador escribía el pedido directo a Firestore y subía el
 * comprobante a Firebase Storage, sin autenticación. Ahora pasa por acá: el
 * secreto compartido queda en el servidor y se reenvía la IP real del visitante
 * para que el rate limit del coach cuente por persona y no por servidor de Vercel.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "";

  try {
    return NextResponse.json({ data: await createCoachOrder(form, ip) }, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("Error creando el pedido:", e);
    return NextResponse.json({ error: "No se pudo procesar la compra" }, { status: 502 });
  }
}
