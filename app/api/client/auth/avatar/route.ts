import { NextResponse } from "next/server";
import { getAthleteSession } from "@/lib/session";
import { getMe } from "@/lib/coachApi";

export async function GET() {
  const session = await getAthleteSession();
  if (!session.token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await getMe(session.token);
  if (!profile.avatarUrl) {
    return new NextResponse(null, { status: 404 });
  }

  // Fetch from the internal MinIO URL — our server can't reach minio:9000 directly,
  // so fetch via the external API which is in the same Docker network
  const res = await fetch(
    `${process.env.COACH_API_URL}/api/client/auth/avatar-proxy`,
    { headers: { Authorization: `Bearer ${session.token}` } }
  );

  if (!res.ok) return new NextResponse(null, { status: 404 });

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
