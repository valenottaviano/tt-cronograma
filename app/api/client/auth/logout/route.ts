import { NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";

export async function POST() {
  const session = await getAthleteSession();
  session.destroy();
  return NextResponse.json({ data: { ok: true } });
}
