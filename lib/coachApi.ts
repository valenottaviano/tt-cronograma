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
  dayIndex: number;
  isRest: boolean;
  workoutId: string | null;
  variantId: string | null;
  workout: Workout | null;
  variant: Variant | null;
  fileUrl: string | null;
  variantFileUrl: string | null;
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

export interface OptionalDay {
  workoutId: string;
  variantId: string | null;
  workout: Workout;
  variant: Variant | null;
  fileUrl: string | null;
  variantFileUrl: string | null;
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
