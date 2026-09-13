import { NextResponse } from "next/server";
import { getPublicProducts } from "@/lib/coachApi";

/** Proxy del catálogo. Existe para que el secreto compartido no salga del server. */
export async function GET() {
  return NextResponse.json({ data: await getPublicProducts() });
}
