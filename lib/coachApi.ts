import type { ApplicationPayload } from "./join-form";
// `Race` de ./data es la carrera del CALENDARIO PÚBLICO. Ojo: en este mismo
// archivo hay otra interfaz `Race` (línea ~236) que es la carrera del catálogo
// del coach, a la que el atleta se inscribe. Son cosas distintas; el alias
// evita que se confundan.
import { benefitCategories, type BenefitCategory, type Race as PublicRaceDto, type Track } from "./data";

const BASE = process.env.COACH_API_URL;

async function del(path: string, token: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let message = "Error inesperado";
    try { const j = await res.json(); message = j.error ?? message; } catch { /* non-JSON body */ }
    throw new ApiError(message, res.status);
  }
}

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error ?? "Error inesperado", res.status);
  return json.data ?? json;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let message = "Error inesperado";
    try { const j = await res.json(); message = j.error ?? message; } catch { /* non-JSON body */ }
    throw new ApiError(message, res.status);
  }
  const json = await res.json();
  return json.data ?? json;
}

export interface CheckResult {
  exists: boolean;
  hasAccount: boolean;
}

export interface LoginResult {
  token: string;
  name: string;
  dni: string;
}

// Shape returned by POST /api/v1/athlete/login
interface V1LoginResponse {
  token: string;
  athlete: { name: string; dni: string };
}

export interface PresignResult {
  uploadUrl: string;
  key: string;
}

export interface AthleteProfile {
  name: string;
  dni: string;
  email: string | null;
  phone: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
}

export interface ClientInfo {
  name: string;
  isActive: boolean;
}

export async function getClientInfo(dni: string): Promise<ClientInfo | null> {
  const res = await fetch(`${BASE}/api/client/${dni}/info`);
  if (res.status === 404) return null;
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Error inesperado");
  return json.data ?? json;
}

export function getMe(token: string) {
  return get<AthleteProfile>("/api/client/auth/me", token);
}

export function checkDni(dni: string) {
  return post<CheckResult>("/api/client/auth/check", { dni });
}

export function setupProfile(body: {
  dni: string;
  email: string;
  password: string;
  phone?: string;
  avatarKey?: string;
}) {
  return post<{ dni: string }>("/api/client/auth/setup", body);
}

export async function loginAthlete(dni: string, password: string): Promise<LoginResult> {
  // Use the JWT endpoint so we get a token we can store server-side
  const data = await post<V1LoginResponse>("/api/v1/athlete/login", { dni, password });
  return { token: data.token, name: data.athlete.name, dni: data.athlete.dni };
}

export function getSchedules(token: string) {
  return get<{ schedules: Schedule[] }>("/api/v1/athlete/schedules", token);
}

export function getPresignUrl(
  filename: string,
  contentType: string,
  token: string
) {
  return post<PresignResult>(
    "/api/client/auth/presign",
    { filename, contentType },
    token
  );
}

// ─── Video types ─────────────────────────────────────────────────────────────

export interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export function getVideos(token: string): Promise<Video[]> {
  return get<Video[]>("/api/v1/athlete/videos", token);
}

// ─── Schedule types ───────────────────────────────────────────────────────────

export interface Schedule {
  id: string;
  coachNoteExternal: string | null;
  period: {
    startDate: string;
    type: "WEEKLY" | "BIWEEKLY" | "MERGED";
    totalDays?: number;
  };
  comments: Comment[];
  days: Day[];
}

export interface Comment {
  id: string;
  dayIndex: number;
  content: string;
  createdAt: string;
}

export interface Day {
  /**
   * Índice dentro del timeline FUSIONADO: cuenta desde el inicio de la copia
   * más vieja, no desde el inicio de la copia a la que pertenece este día.
   * No sirve para postear un comentario — para eso está `copyDayIndex`.
   */
  dayIndex: number;
  /**
   * Copia a la que pertenece este día. `null` si la fecha cae en un hueco
   * entre períodos. Los comentarios se guardan por copia: hay que postear
   * este `copyId` junto con `copyDayIndex`, nunca `dayIndex`.
   */
  copyId?: string | null;
  /** Índice del día DENTRO de su copia. Ver `copyId`. */
  copyDayIndex?: number | null;
  isRest: boolean;
  workoutId: string | null;
  variantId: string | null;
  workout: Workout | null;
  variant: Variant | null;
  fileUrl: string | null;
  variantFileUrl: string | null;
  /** Comentario del coach sobre este ejercicio puntual. */
  note?: string | null;
  /**
   * Ejercicios que son parte de la MISMA sesión que el principal
   * ("Fondo + Movilidad"). A diferencia de `optionals`, no son opcionales.
   * Opcional en el tipo porque las respuestas viejas de la API no lo traen.
   */
  extras?: OptionalDay[];
  optionals: OptionalDay[];
}

export interface Workout {
  id: string;
  name: string;
  description: string | null;
  fileKey: string | null;
  link: string | null;
  variants: Variant[];
}

export interface Variant {
  id: string;
  label: string;
  notes: string | null;
  link: string | null;
  km: number | null;
  gpxKey: string | null;
}

/** Slot de ejercicio: se usa tanto para `optionals` como para `extras`. */
export interface OptionalDay {
  workoutId: string;
  variantId: string | null;
  workout: Workout;
  variant: Variant | null;
  fileUrl: string | null;
  variantFileUrl: string | null;
  /** Comentario del coach sobre este ejercicio puntual. */
  note?: string | null;
}

// ─── Race types ───────────────────────────────────────────────────────────────

export interface Race {
  id: string;
  name: string;
  date: string;
  location: string | null;
  description: string | null;
  enrolled: boolean;
}

export function getRaces(token: string) {
  return get<Race[]>("/api/v1/athlete/races", token);
}

// ─── Payment types ──────────────────────────────────────────────────────────

export type PaymentMethod = "CASH" | "TRANSFER";

export interface Payment {
  id: string;
  clientId: string;
  year: number;
  month: number; // 1–12
  amount: string; // decimal serializado, ej. "15000"
  currency: string;
  method: PaymentMethod;
  note: string | null;
  receiptKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthStatus {
  paid: boolean;
  payment: Payment | null;
}

export interface ReportPaymentInput {
  year: number;
  month: number;
  amount: number;
  method?: PaymentMethod;
  currency?: string;
  note?: string;
  receiptKey?: string;
}

export function getMonthStatus(year: number, month: number, token: string) {
  return get<MonthStatus>(
    `/api/v1/athlete/payments?year=${year}&month=${month}`,
    token
  );
}

export function getPayments(token: string) {
  return get<Payment[]>("/api/v1/athlete/payments", token);
}

export function reportPayment(input: ReportPaymentInput, token: string) {
  return post<Payment>("/api/v1/athlete/payments", input, token);
}

export function enrollRace(raceId: string, token: string) {
  return post<unknown>(`/api/v1/athlete/races/${raceId}/enroll`, {}, token);
}

export function unenrollRace(raceId: string, token: string) {
  return del(`/api/v1/athlete/races/${raceId}/enroll`, token);
}

// ─── Solicitudes de ingreso ──────────────────────────────────────────────────

/**
 * Envía una solicitud de ingreso al panel del coach. Es server-to-server: usa un
 * secreto compartido en vez de JWT porque quien completa el formulario todavía
 * no es atleta y no tiene cuenta.
 */
export async function submitApplication(
  payload: ApplicationPayload,
  clientIp?: string
): Promise<{ id: string }> {
  const apiKey = process.env.COACH_PUBLIC_API_KEY;
  if (!apiKey) throw new ApiError("Servicio no disponible", 503);

  const res = await fetch(`${BASE}/api/v1/public/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      // Sin esto el coach vería siempre la IP de Vercel y su rate limit
      // pasaría a ser global en vez de por visitante.
      ...(clientIp ? { "X-Client-Ip": clientIp } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error ?? "Error inesperado", res.status);
  return json.data ?? json;
}

export interface CoachBenefit {
  id: string;
  title: string;
  description: string;
  company: string;
  merchantSlug: string;
  category: BenefitCategory;
  logo: string;
  linkCta: string;
  instagramLink: string;
  whatsappLink: string;
}

/**
 * Beneficios del programa TT.
 *
 * Vivían en Firestore y ahora viven en Postgres, del lado de roberto-parodi,
 * porque el comercio que los ofrece es la misma entidad que registra ventas en
 * tt-comercios. El contrato de esta función es el mismo que tenía
 * getFirebaseBenefits(), así que las pantallas no cambiaron.
 *
 * Devuelve [] si la API del coach no responde: la página de beneficios no debe
 * tirar abajo el sitio público por una caída del VPS.
 */
export async function getBenefits(): Promise<CoachBenefit[]> {
  const key = process.env.COACH_PUBLIC_API_KEY;
  if (!BASE || !key) {
    console.error("COACH_API_URL o COACH_PUBLIC_API_KEY sin configurar — beneficios vacíos");
    return [];
  }
  try {
    const res = await fetch(`${BASE}/api/v1/public/benefits`, {
      headers: { "X-Api-Key": key },
      // Los beneficios cambian poco: una cache corta evita golpear el VPS en
      // cada visita sin que una edición tarde en verse.
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`No se pudieron traer los beneficios: HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    // La categoría en la base es texto libre (viene de datos cargados a mano en
    // Firestore, donde 6 beneficios no tenían ninguna). La UI filtra por una
    // lista cerrada, así que lo que no reconocemos cae en "Otros" en vez de
    // crear una categoría fantasma que nadie puede filtrar.
    return ((json.data ?? []) as (Omit<CoachBenefit, "category"> & { category: string })[]).map(
      (b) => ({
        ...b,
        category: (benefitCategories as readonly string[]).includes(b.category)
          ? (b.category as BenefitCategory)
          : "Otros",
      })
    );
  } catch (e) {
    console.error("Error trayendo beneficios de la API del coach:", e);
    return [];
  }
}

/**
 * Calendario público de carreras.
 *
 * Vivía en Firestore y ahora vive en Postgres (`PublicRace`), administrado desde
 * el panel del coach en Contenido web → Carreras. El shape es el mismo que
 * devolvía `getFirebaseRaces()`, así que `/races` y `/races/[id]` no cambiaron.
 *
 * Devuelve [] si la API no responde: una caída del VPS no debe tirar abajo la
 * página, sólo dejarla vacía.
 */
export async function getPublicRaces(): Promise<PublicRaceDto[]> {
  const key = process.env.COACH_PUBLIC_API_KEY;
  if (!BASE || !key) {
    console.error("COACH_API_URL o COACH_PUBLIC_API_KEY sin configurar — carreras vacías");
    return [];
  }
  try {
    const res = await fetch(`${BASE}/api/v1/public/races`, {
      headers: { "X-Api-Key": key },
      // El calendario cambia poco; 5 minutos evita golpear el VPS en cada visita.
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`No se pudieron traer las carreras: HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    return (json.data ?? []) as PublicRaceDto[];
  } catch (e) {
    console.error("Error trayendo carreras de la API del coach:", e);
    return [];
  }
}

export async function getPublicRace(id: string): Promise<PublicRaceDto | null> {
  const races = await getPublicRaces();
  return races.find((r) => r.id === id) ?? null;
}

/**
 * Tracks GPX del sitio público.
 *
 * Vivían en Firestore y ahora viven en Postgres (`PublicTrack`). Los ARCHIVOS
 * siguen en Firebase Storage para los 13 migrados; los nuevos que suba el panel
 * van al storage propio. `fileUrl` es absoluta justamente por eso, y es la que
 * `TrackPreview` descarga en el navegador.
 */
export async function getPublicTracks(): Promise<Track[]> {
  const key = process.env.COACH_PUBLIC_API_KEY;
  if (!BASE || !key) {
    console.error("COACH_API_URL o COACH_PUBLIC_API_KEY sin configurar — tracks vacíos");
    return [];
  }
  try {
    const res = await fetch(`${BASE}/api/v1/public/tracks`, {
      headers: { "X-Api-Key": key },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`No se pudieron traer los tracks: HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    return (json.data ?? []) as Track[];
  } catch (e) {
    console.error("Error trayendo tracks de la API del coach:", e);
    return [];
  }
}

export async function getPublicTrack(id: string): Promise<Track | null> {
  const tracks = await getPublicTracks();
  return tracks.find((t) => t.id === id) ?? null;
}

// ─── Tienda ───────────────────────────────────────────────────────────────────

export interface CoachProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  sizes: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

/** Catálogo de la tienda. Vivía en Firestore; ahora en Postgres. */
export async function getPublicProducts(): Promise<CoachProduct[]> {
  const key = process.env.COACH_PUBLIC_API_KEY;
  if (!BASE || !key) {
    console.error("COACH_API_URL o COACH_PUBLIC_API_KEY sin configurar — productos vacíos");
    return [];
  }
  try {
    const res = await fetch(`${BASE}/api/v1/public/products`, {
      headers: { "X-Api-Key": key },
      // Más corta que el resto del contenido: el stock cambia cuando el coach
      // verifica un pedido, y mostrar un talle agotado como disponible molesta.
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(`No se pudieron traer los productos: HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    return (json.data ?? []) as CoachProduct[];
  } catch (e) {
    console.error("Error trayendo productos de la API del coach:", e);
    return [];
  }
}

/** Reenvía el pedido tal cual llegó, con el comprobante adjunto. */
export async function createCoachOrder(form: FormData, clientIp: string): Promise<{ id: string }> {
  const key = process.env.COACH_PUBLIC_API_KEY;
  if (!BASE || !key) throw new ApiError("La tienda no está disponible", 503);

  const res = await fetch(`${BASE}/api/v1/public/orders`, {
    method: "POST",
    headers: { "X-Api-Key": key, ...(clientIp ? { "X-Client-Ip": clientIp } : {}) },
    body: form,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error ?? "No se pudo procesar la compra", res.status);
  return json.data ?? json;
}
