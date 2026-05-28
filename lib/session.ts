import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface AthleteSession {
  token: string;
  dni: string;
  name: string;
}

const sessionOptions = {
  cookieName: "athlete_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getAthleteSession(): Promise<IronSession<AthleteSession>> {
  const cookieStore = await cookies();
  return getIronSession<AthleteSession>(cookieStore, sessionOptions);
}
