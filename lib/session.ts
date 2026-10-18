import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface AthleteSession {
  token: string;
  dni: string;
  name: string;
  /** Cuándo se renovó el token por última vez (ms). Ver /api/client/auth/refresh. */
  renewedAt?: number;
}

/**
 * La sesión dura 400 días, el tope que los navegadores admiten para una cookie,
 * y se renueva sola al usar la app (`SessionKeepAlive`): mientras el atleta la
 * abra, no vence.
 *
 * OJO: iron-session tiene su propio vencimiento (`ttl`), sellado dentro de la
 * cookie, y por defecto es de 14 días. Antes sólo se fijaba `maxAge` (30 días)
 * y la sesión se invalidaba igual a los 14. Los dos tienen que ir juntos.
 */
const SESSION_TTL_SECONDS = 400 * 24 * 60 * 60;

const sessionOptions = {
  cookieName: "athlete_session",
  password: process.env.SESSION_SECRET as string,
  ttl: SESSION_TTL_SECONDS,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    // Un minuto antes que el sello, como hace iron-session cuando lo calcula solo.
    maxAge: SESSION_TTL_SECONDS - 60,
  },
};

export async function getAthleteSession(): Promise<IronSession<AthleteSession>> {
  const cookieStore = await cookies();
  return getIronSession<AthleteSession>(cookieStore, sessionOptions);
}
