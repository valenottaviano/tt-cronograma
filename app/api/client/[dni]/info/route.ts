import { NextRequest, NextResponse } from "next/server";
import { getClientInfo } from "@/lib/coachApi";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  const { dni } = await params;
  const info = await getClientInfo(dni);
  if (!info) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ data: info });
}
