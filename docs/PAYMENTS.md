# Pagos mensuales — feature + integración de la API

Los atletas reportan el pago de su cuota mensual (efectivo o transferencia) y consultan si un mes está pago. La carga la hace la **webapp externa del atleta** consumiendo la API de este proyecto; el **coach** ve y segmenta la facturación desde su panel.

- **Reporte auto-confirmado**: cuando el atleta reporta un mes, queda pago de inmediato (no requiere aprobación del coach).
- **Un pago por mes**: a lo sumo un registro por `(atleta, año, mes)`. Reportar dos veces el mismo mes devuelve `409`.
- **Comprobante opcional**: el atleta puede adjuntar una foto/PDF subiéndolo a MinIO con una URL presignada.
- **Método de pago**: `CASH` (efectivo) o `TRANSFER` (transferencia). Default `TRANSFER`.

---

## 1. Modelo de datos

Tabla `client_payments` (`prisma/schema.prisma` → modelo `ClientPayment`):

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string (cuid) | |
| `clientId` | string | atleta dueño del pago |
| `year` | int | ej. `2026` |
| `month` | int | `1`–`12` |
| `amount` | decimal(12,2) | se serializa como **string** en JSON (ej. `"15000"`) |
| `currency` | string | default `"ARS"` |
| `method` | enum | `"CASH"` \| `"TRANSFER"` (default `"TRANSFER"`) |
| `note` | string \| null | nota opcional |
| `receiptKey` | string \| null | object key del comprobante en MinIO (nunca una URL) |
| `createdAt` / `updatedAt` | datetime (ISO) | |

Restricción única: `@@unique([clientId, year, month])`.

El objeto **Payment** que devuelve la API tiene esta forma:

```ts
type PaymentMethod = "CASH" | "TRANSFER";

interface Payment {
  id: string;
  clientId: string;
  year: number;
  month: number;        // 1–12
  amount: string;       // decimal serializado, ej. "15000"
  currency: string;     // "ARS"
  method: PaymentMethod;
  note: string | null;
  receiptKey: string | null;
  createdAt: string;    // ISO
  updatedAt: string;    // ISO
}
```

---

## 2. Integración en el frontend del atleta (API v1)

Esta es la superficie que consume tu otra webapp: **`/api/v1/athlete/*`**.

- **Auth**: JWT por bearer token. Se obtiene una vez en el login y se manda en cada request como `Authorization: Bearer <token>`. Expira a los **30 días**.
- **CORS**: todas las respuestas incluyen headers CORS (`Access-Control-Allow-Origin: *`) y cada ruta responde el preflight `OPTIONS` con `204`. Podés llamar la API desde cualquier origen.
- **Identidad**: el atleta sale del token (`sub` = `clientId`). **Nunca** mandes un id/dni de atleta en el body — el backend lo ignora y usa el del token.
- **Convención de respuestas**: éxito → `{ "data": ... }`; error → `{ "error": "mensaje" }` con el status HTTP correspondiente.

> Base URL: en producción es el dominio de la app (ej. `https://plan.grupott.com.ar`). En estos ejemplos uso `API_BASE`.

### 2.1 Login → obtener token

```
POST {API_BASE}/api/v1/athlete/login
Content-Type: application/json

{ "dni": "43811021", "password": "el-password-del-atleta" }
```

Respuesta `200`:

```json
{ "data": { "token": "eyJhbGciOi...", "athlete": { "name": "Valentín Ottaviano", "dni": "43811021" } } }
```

Errores: `400` body inválido, `401` DNI/contraseña incorrectos o cuenta sin contraseña configurada.

```ts
async function login(dni: string, password: string) {
  const res = await fetch(`${API_BASE}/api/v1/athlete/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dni, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  const { data } = await res.json();
  localStorage.setItem("athlete_token", data.token); // guardalo donde prefieras
  return data.athlete;
}

const authHeaders = () => ({
  "Authorization": `Bearer ${localStorage.getItem("athlete_token")}`,
});
```

> El atleta configura su contraseña la primera vez desde la app de cliente del coach (`/schedule`). Si el login da `401` por "cuenta sin configurar", el atleta primero debe completar el alta ahí.

### 2.2 Consultar pagos

**Historial completo** (lo más común — la webapp deriva qué meses están pagos):

```
GET {API_BASE}/api/v1/athlete/payments
Authorization: Bearer <token>
```

`200` → `{ "data": Payment[] }` ordenado del más nuevo al más viejo.

**Estado de un mes puntual**:

```
GET {API_BASE}/api/v1/athlete/payments?year=2026&month=6
Authorization: Bearer <token>
```

`200` →

```json
{ "data": { "paid": true, "payment": { "id": "...", "year": 2026, "month": 6, "amount": "15000", "method": "TRANSFER", ... } } }
```

Si no está pago: `{ "data": { "paid": false, "payment": null } }`.

```ts
async function getPayments() {
  const res = await fetch(`${API_BASE}/api/v1/athlete/payments`, { headers: authHeaders() });
  return (await res.json()).data as Payment[];
}

async function isMonthPaid(year: number, month: number) {
  const res = await fetch(`${API_BASE}/api/v1/athlete/payments?year=${year}&month=${month}`, { headers: authHeaders() });
  return (await res.json()).data as { paid: boolean; payment: Payment | null };
}
```

### 2.3 Reportar un pago

```
POST {API_BASE}/api/v1/athlete/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2026,
  "month": 6,
  "amount": 15000,
  "method": "TRANSFER",     // opcional, default "TRANSFER"
  "currency": "ARS",        // opcional, default "ARS"
  "note": "transferencia",  // opcional
  "receiptKey": "payments/.../archivo.pdf"  // opcional, ver 2.4
}
```

Respuestas:
- `201` → `{ "data": Payment }`
- `409` → `{ "error": "Ya reportaste el pago de este mes" }` (ese mes ya tiene un pago)
- `400` → body inválido (ej. `amount` no positivo, `month` fuera de 1–12)
- `401` → token faltante o inválido

```ts
async function reportPayment(p: {
  year: number; month: number; amount: number;
  method?: PaymentMethod; currency?: string; note?: string; receiptKey?: string;
}) {
  const res = await fetch(`${API_BASE}/api/v1/athlete/payments`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (res.status === 409) throw new Error("Ya reportaste el pago de este mes");
  if (!res.ok) throw new Error((await res.json()).error);
  return (await res.json()).data as Payment;
}
```

### 2.4 Adjuntar un comprobante (opcional)

Flujo de 3 pasos: pedir URL presignada → subir el archivo directo a MinIO → reportar el pago con el `key`.

**Paso 1** — pedir la URL de subida:

```
POST {API_BASE}/api/v1/athlete/payments/presign
Authorization: Bearer <token>
Content-Type: application/json

{ "filename": "comprobante.pdf", "contentType": "application/pdf" }
```

`200` → `{ "data": { "uploadUrl": "https://...", "key": "payments/.../comprobante.pdf" } }`

**Paso 2** — subir el archivo con un `PUT` directo a `uploadUrl` (no pasa por la API; la URL vence a los 5 min):

```
PUT <uploadUrl>
Content-Type: application/pdf   // debe coincidir con el contentType del paso 1

<bytes del archivo>
```

**Paso 3** — reportar el pago (2.3) incluyendo `"receiptKey": <key del paso 1>`.

```ts
async function uploadReceipt(file: File): Promise<string> {
  const presign = await fetch(`${API_BASE}/api/v1/athlete/payments/presign`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  }).then((r) => r.json());

  await fetch(presign.data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  return presign.data.key; // pasalo como receiptKey al reportar el pago
}
```

**Ver el comprobante** de un pago (URL presignada temporal):

```
GET {API_BASE}/api/v1/athlete/payments/{id}/receipt
Authorization: Bearer <token>
```

`200` → `{ "data": { "url": "https://..." } }` (la URL sirve para abrir/descargar el archivo; vence a la hora). `404` si el pago no tiene comprobante o no es del atleta.

### 2.5 Resumen de endpoints (atleta)

| Método | Path | Descripción |
|---|---|---|
| `POST` | `/api/v1/athlete/login` | Login con `{ dni, password }` → `{ token, athlete }` |
| `GET` | `/api/v1/athlete/payments` | Historial; o `?year=&month=` para el estado de un mes |
| `POST` | `/api/v1/athlete/payments` | Reportar pago de un mes |
| `POST` | `/api/v1/athlete/payments/presign` | URL presignada para subir un comprobante |
| `GET` | `/api/v1/athlete/payments/{id}/receipt` | URL presignada para ver el comprobante |

> Todas aceptan `OPTIONS` (preflight CORS) y requieren `Authorization: Bearer <token>` salvo el login.

### 2.6 Flujo típico en la webapp

1. El atleta inicia sesión → guardás el `token`.
2. Pantalla de pagos: `GET /payments` para listar el historial y resaltar el mes actual (pago / pendiente).
3. Para reportar: (opcional) subir comprobante con el flujo presign, luego `POST /payments` con `year`, `month`, `amount`, `method` y `receiptKey`.
4. Manejar `409` mostrando "ese mes ya está reportado".

---

## 3. Lado del coach (este proyecto)

No es necesario para integrar la webapp, pero es el otro extremo del feature.

- **Tab "Pagos"** en el panel → página `/payments`: listado global de todos los pagos con KPIs (recaudado del mes y del año, desglosados por **efectivo / transferencia**), cantidad de pagos, atletas al día, y filtro por método.
- **Ficha del atleta**: la card "Pagos" (en *Editar atleta*) permite cargar/borrar/editar pagos manualmente (ej. un pago en efectivo recibido en persona); la vista *Ver perfil* los muestra en solo lectura.
- **Tabla `/clients`**: badge de estado por atleta — 🟢 *Al día* (pagó el mes actual y sin meses pendientes), 🔴 *Debe N meses* (meses sin pago contados **desde su primer pago** hasta el mes actual), ⚪ *Sin pagos* (nunca registró un pago).

Endpoints de coach (sesión de coach por cookie, no JWT):

| Método | Path | Descripción |
|---|---|---|
| `GET` | `/api/payments` | Listado global + KPIs (incluye `monthByMethod` / `yearByMethod`) |
| `GET` | `/api/payments/{id}/receipt` | Redirige al comprobante (URL presignada) |
| `GET` `POST` | `/api/clients/{id}/payments` | Listar / cargar pagos de un atleta |
| `PATCH` `DELETE` | `/api/clients/{id}/payments/{paymentId}` | Editar / borrar un pago |

---

## 4. Infraestructura / notas operativas

- **Bucket de comprobantes**: MinIO bucket `payments` (configurable con `MINIO_PAYMENTS_BUCKET`, default `"payments"`). En dev/prod lo crea el servicio `createbuckets` de los `docker-compose*.yml`. Si en prod ese servicio no se re-ejecuta en el deploy, verificá que el bucket exista (si falta, fallan solo las subidas de comprobante, no el reporte del pago).
- **Migraciones**: `20260624000000_add_client_payments` (modelo) y `20260624010000_add_payment_method` (enum + columna). Se aplican con `prisma migrate deploy`.
- **JWT**: firmado con `JWT_SECRET` (`src/lib/jwt.ts`), issuer `roberto-parodi`, audience `athlete-api`, expira en 30 días. Asegurate de setear `JWT_SECRET` en prod (hay un fallback de dev que **no** debe usarse en producción).
- **Montos y moneda**: `amount` se guarda como `Decimal(12,2)` y se serializa como string — parsealo con `Number(amount)` en el frontend. Los KPIs de recaudación asumen una sola moneda (toma la predominante del mes); si manejás varias monedas en simultáneo habría que separarlas.
```
