import { NextRequest, NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url requerida" }, { status: 400 });
  }

  const res = await fetch(
    `${process.env.COACH_API_URL}/api/v1/athlete/gpx-proxy?url=${encodeURIComponent(url)}`,
    { headers: { Authorization: `Bearer ${session.token}` } }
  );

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  const contentDisposition = res.headers.get("content-disposition") ?? 'attachment; filename="track.gpx"';
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/gpx+xml",
      "Content-Disposition": contentDisposition,
    },
  });
}
