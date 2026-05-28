# Athlete API — v1

Token-based REST API for integrating the athlete schedule view into an external app.

## Base URL

```
https://your-domain.com/api/v1/athlete
```

## Authentication

Protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained via `POST /login` and expire after **30 days**.

### Storing the token (Next.js)

```ts
// After login, persist the token client-side
localStorage.setItem("athlete_token", data.token);

// Wrapper for authenticated requests
async function fetchWithAuth(path: string, options?: RequestInit) {
  const token = localStorage.getItem("athlete_token");
  return fetch(`${process.env.NEXT_PUBLIC_COACH_API_URL}/api/v1/athlete${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}
```

## Error format

All errors return:

```json
{ "error": "descripción del error" }
```

| Status | Meaning |
|--------|---------|
| 400 | Invalid request body |
| 401 | Missing, invalid, or expired token |
| 404 | Resource not found |
| 500 | Server error |

---

## Endpoints

### POST /login

Authenticate an athlete with DNI and password. Returns a JWT.

**Request**

```http
POST /api/v1/athlete/login
Content-Type: application/json
```

```json
{
  "dni": "12345678",
  "password": "micontraseña"
}
```

**Response 200**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "athlete": {
      "name": "Juan Pérez",
      "dni": "12345678"
    }
  }
}
```

**Response 401** — wrong DNI or password

```json
{ "error": "DNI o contraseña incorrectos" }
```

---

### GET /me

Returns the authenticated athlete's profile.

**Request**

```http
GET /api/v1/athlete/me
Authorization: Bearer <token>
```

**Response 200**

```json
{
  "data": {
    "name": "Juan Pérez",
    "dni": "12345678",
    "email": "juan@example.com",
    "phone": "+54 9 11 1234-5678",
    "avatarUrl": "https://minio.../avatars/abc.jpg?X-Amz-Signature=..."
  }
}
```

`avatarUrl` is `null` if the athlete has no avatar. `email` and `phone` are `null` if not set.

> **Note**: `avatarUrl` is a presigned URL that expires in 1 hour. Do not cache it across sessions.

---

### GET /schedules

Returns all approved training schedules for the authenticated athlete, with fully resolved workout data and download links.

**Request**

```http
GET /api/v1/athlete/schedules
Authorization: Bearer <token>
```

**Response 200**

```json
{
  "data": {
    "schedules": [
      {
        "id": "clxyz...",
        "coachNoteExternal": "Semana de recuperación, no forzar.",
        "period": {
          "startDate": "2025-05-26T00:00:00.000Z",
          "type": "WEEKLY"
        },
        "comments": [
          {
            "id": "clcomment...",
            "dayIndex": 2,
            "content": "¿Puedo hacer esto en cinta?",
            "createdAt": "2025-05-28T10:30:00.000Z"
          }
        ],
        "days": [
          {
            "dayIndex": 0,
            "isRest": false,
            "workoutId": "clworkout...",
            "variantId": "clvariant...",
            "workout": {
              "id": "clworkout...",
              "name": "Rodaje suave",
              "description": "Trote a ritmo conversacional",
              "fileKey": "workouts/abc.pdf",
              "link": null,
              "variants": [
                {
                  "id": "clvariant...",
                  "label": "10km",
                  "notes": "Por el parque",
                  "link": null,
                  "km": 10,
                  "gpxKey": "route1.gpx"
                }
              ]
            },
            "variant": {
              "id": "clvariant...",
              "label": "10km",
              "notes": "Por el parque",
              "link": null,
              "km": 10,
              "gpxKey": "route1.gpx"
            },
            "fileUrl": "https://minio.../workouts/abc.pdf?X-Amz-Signature=...",
            "variantFileUrl": "https://minio.../route1.gpx?X-Amz-Signature=...",
            "optionals": [
              {
                "workoutId": "clopt...",
                "variantId": null,
                "workout": { "id": "clopt...", "name": "Gimnasio", "description": "...", "fileKey": null, "link": "https://...", "variants": [] },
                "variant": null,
                "fileUrl": null,
                "variantFileUrl": null
              }
            ]
          },
          {
            "dayIndex": 1,
            "isRest": true,
            "workoutId": null,
            "variantId": null,
            "workout": null,
            "variant": null,
            "fileUrl": null,
            "variantFileUrl": null,
            "optionals": []
          }
        ]
      }
    ]
  }
}
```

**Field reference**

| Field | Type | Description |
|-------|------|-------------|
| `period.type` | `"WEEKLY"` \| `"BIWEEKLY"` | Period duration |
| `period.startDate` | ISO 8601 | Monday of the period (UTC midnight) |
| `coachNoteExternal` | `string \| null` | Coach message visible to the athlete |
| `days[].dayIndex` | `0–13` | Day offset from `startDate` (0 = Monday of week 1) |
| `days[].isRest` | `boolean` | Rest day — all other fields will be `null` |
| `fileUrl` | `string \| null` | Presigned URL to download the workout PDF (expires 1 hour) |
| `variantFileUrl` | `string \| null` | Presigned URL to download the GPX route file (expires 1 hour) |
| `variant.km` | `number \| null` | Distance in kilometers |

> **Note**: `fileUrl` and `variantFileUrl` are presigned URLs that expire in **1 hour**. Always call `/schedules` fresh — do not cache these URLs across sessions or store them in a database.

---

## Next.js integration example

```tsx
// lib/athleteApi.ts
const BASE = process.env.NEXT_PUBLIC_COACH_API_URL + "/api/v1/athlete";

export async function loginAthlete(dni: string, password: string) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dni, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  localStorage.setItem("athlete_token", json.data.token);
  return json.data.athlete;
}

function getToken() {
  return localStorage.getItem("athlete_token");
}

async function fetchWithAuth(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export const getMe = () => fetchWithAuth("/me");
export const getSchedules = () => fetchWithAuth("/schedules");
```

```tsx
// app/login/page.tsx (example)
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAthlete } from "@/lib/athleteApi";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const athlete = await loginAthlete(
        fd.get("dni") as string,
        fd.get("password") as string
      );
      router.push(`/schedule/${athlete.dni}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="dni" placeholder="DNI" required />
      <input name="password" type="password" placeholder="Contraseña" required />
      {error && <p>{error}</p>}
      <button type="submit">Ingresar</button>
    </form>
  );
}
```

```tsx
// app/schedule/[dni]/page.tsx (example — client component)
"use client";
import { useEffect, useState } from "react";
import { getSchedules } from "@/lib/athleteApi";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    getSchedules().then((data) => setSchedules(data.schedules));
  }, []);

  return (
    <div>
      {schedules.map((s: any) => (
        <div key={s.id}>
          <p>{s.period.startDate}</p>
          <p>{s.coachNoteExternal}</p>
          {s.days.map((d: any) => (
            <div key={d.dayIndex}>
              {d.isRest ? (
                <span>Descanso</span>
              ) : (
                <span>{d.workout?.name} — {d.variant?.label}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Environment variable

Add to your `.env.local` in the external app:

```
NEXT_PUBLIC_COACH_API_URL=https://your-coach-app-domain.com
```
