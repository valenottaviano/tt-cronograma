# ROUTES.md

## Auth model

### Coach auth
The coach route group `(coach)` is protected by middleware (`src/middleware.ts`). Every request to a path under `/(coach)/` checks for a valid iron-session cookie (`coach_session`). Unauthenticated requests are redirected to `/login`.

### Athlete auth
Athletes authenticate via a separate iron-session cookie (`athlete_session`). The entry point is the root page (`/`) or `/schedule/login`.

**Athlete login flow:**
1. Athlete enters their DNI.
2. `POST /api/client/auth/check` is called:
   - DNI not found → error message.
   - DNI found, **no password set** → redirect to `/schedule/setup?dni=...` to configure account.
   - DNI found, **password set** → show password step.
3. Athlete enters their password → `POST /api/client/auth/login`.
4. On success → redirect to `/schedule/[dni]`.

The route `/schedule/[dni]` requires a valid athlete session. Unauthenticated requests are redirected to `/schedule/login`.

---

## Page routes

### Public (no session required)

| Route | Description |
|---|---|
| `/` | Athlete entry point. Two-step form: DNI check → password. Redirects to setup if account not yet configured. |
| `/login` | Coach login form. Email + password. On success, sets session cookie and redirects to `/dashboard`. |
| `/schedule/login` | Alternate athlete login page (same flow as `/`). |
| `/schedule/setup` | Athlete first-time setup. Accepts `?dni=` query param. Collects email, optional phone, password, and avatar photo. Creates the athlete account, sets session, and redirects to `/schedule/[dni]`. |

### Athlete (athlete session required)

| Route | Description |
|---|---|
| `/schedule/[dni]` | Athlete schedule view. Shows all APPROVED schedule copies in a weekly navigator. Supports day-level comments. If DNI not found or no approved schedules exist, shows a friendly message. |
| `/schedule/[dni]/profile` | Athlete profile page. Shows and allows editing of: avatar photo (upload to MinIO via presigned URL → save key), email, phone (stored as `+54 9 <local>`, displayed with prefix stripped), and password change (requires current password). |

### Coach (auth required)

| Route | Description |
|---|---|
| `/dashboard` | Overview: pending approvals count, recent activity, quick links. |
| `/clients` | List all clients (name, DNI, group). Search by name or DNI. Link to add/edit. |
| `/clients/new` | Create a new client. |
| `/clients/[id]` | Edit client name, DNI, or group assignment. Soft-delete option. |
| `/groups` | List all training groups with client count. |
| `/groups/new` | Create a new group. |
| `/groups/[id]` | Edit group name, view members. |
| `/workouts` | List all workouts. Search by name. |
| `/workouts/new` | Create a workout: name, description, file upload, add variants. |
| `/workouts/[id]` | Edit workout. Add/remove/edit variants. |
| `/schedules` | List all schedule periods by group and date. |
| `/schedules/new` | Create a new schedule period for a group. Select weekly/biweekly, fill in each day with a workout + variant or mark as rest. |
| `/schedules/[periodId]` | View a schedule period. See the list of client copies and their statuses. Button to assign (generate copies) if not yet done. |
| `/schedules/review` | The approval queue. Lists all client schedule copies with status DRAFT or PENDING_APPROVAL, sorted by group then client name. |
| `/schedules/review/[copyId]` | Review a single client copy. Shows the full week. Approve, reject, or edit inline. Editing allows changing workout, variant, or rest day per day. |

---

## API routes

All API routes return `{ data }` on success and `{ error: string }` on failure. Use standard HTTP status codes.

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Validate email + password, create session. |
| POST | `/api/auth/logout` | Destroy session. |
| GET | `/api/auth/me` | Return current session coach (used to check auth client-side). |

### Clients

| Method | Path | Description |
|---|---|---|
| GET | `/api/clients` | List all non-deleted clients. Supports `?search=` and `?groupId=`. |
| POST | `/api/clients` | Create a client. Body: `{ name, dni, groupId? }`. |
| GET | `/api/clients/[id]` | Get a single client. |
| PATCH | `/api/clients/[id]` | Update name, DNI, or groupId. |
| DELETE | `/api/clients/[id]` | Soft-delete (sets `deletedAt`). |

### Groups

| Method | Path | Description |
|---|---|---|
| GET | `/api/groups` | List all groups with client count. |
| POST | `/api/groups` | Create a group. Body: `{ name }`. |
| GET | `/api/groups/[id]` | Get group + members. |
| PATCH | `/api/groups/[id]` | Rename group. |
| DELETE | `/api/groups/[id]` | Delete group. Fails if group has clients assigned. |

### Workouts

| Method | Path | Description |
|---|---|---|
| GET | `/api/workouts` | List all workouts (with variants). Supports `?search=`. |
| POST | `/api/workouts` | Create a workout. Body: `{ name, description, variants: [{ label, notes? }] }`. |
| GET | `/api/workouts/[id]` | Get workout + variants. |
| PATCH | `/api/workouts/[id]` | Update workout name, description. |
| DELETE | `/api/workouts/[id]` | Delete workout. Fails if used in any schedule copy. |
| POST | `/api/workouts/[id]/variants` | Add a variant. |
| PATCH | `/api/workouts/[id]/variants/[variantId]` | Edit a variant. |
| DELETE | `/api/workouts/[id]/variants/[variantId]` | Remove a variant. Fails if it's the last one. |

### File uploads

| Method | Path | Description |
|---|---|---|
| POST | `/api/uploads/presign` | Returns a MinIO presigned PUT URL for a workout file. Body: `{ filename, contentType }`. Client uploads directly to MinIO using this URL, then saves the returned object key to the workout. |
| GET | `/api/uploads/[key]` | Returns a short-lived presigned GET URL for a file key. Used to serve downloads. |

### Schedule periods

| Method | Path | Description |
|---|---|---|
| GET | `/api/schedules` | List all schedule periods. Supports `?groupId=`. |
| POST | `/api/schedules` | Create a schedule period. Body: `{ groupId, startDate, type, days: DayEntry[] }`. |
| GET | `/api/schedules/[periodId]` | Get period + all client copies with statuses. |
| PATCH | `/api/schedules/[periodId]` | Update the template days (only before copies have been generated). |
| POST | `/api/schedules/[periodId]/assign` | Trigger copy generation for all clients in the group. Enqueues a BullMQ job. Returns `{ jobId }`. |

### Client schedule copies

| Method | Path | Description |
|---|---|---|
| GET | `/api/schedules/copies` | List copies. Supports `?status=` and `?clientId=`. |
| GET | `/api/schedules/copies/[copyId]` | Get a single copy with full day detail. |
| PATCH | `/api/schedules/copies/[copyId]` | Update days (coach editing). Body: `{ days: DayEntry[] }`. Only allowed when status is DRAFT or REJECTED. |
| POST | `/api/schedules/copies/[copyId]/submit` | Move status from DRAFT → PENDING_APPROVAL. |
| POST | `/api/schedules/copies/[copyId]/approve` | Move status to APPROVED. |
| POST | `/api/schedules/copies/[copyId]/reject` | Move status to REJECTED. Body: `{ note? }`. |

### Athlete auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/client/auth/check` | Check if a DNI exists and whether the account is set up. Returns `{ exists, hasAccount }`. No session required. Used as the first step of the athlete login flow. |
| POST | `/api/client/auth/setup` | First-time account setup. Body: `{ dni, email, password, phone?, avatarKey? }`. Hashes password, saves contact info, sets athlete session, returns `{ dni }`. Returns 400 if account already exists. |
| POST | `/api/client/auth/login` | Validate DNI + password, create athlete session. Returns `{ dni, name }`. Returns 401 if credentials invalid or account not set up. |
| POST | `/api/client/auth/logout` | Destroy athlete session. |

### Athlete profile (athlete session required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/client/auth/me` | Returns the authenticated athlete's profile: `{ name, dni, email, phone, avatarKey, avatarUrl }`. `avatarUrl` is a short-lived MinIO presigned GET URL. |
| PATCH | `/api/client/auth/me` | Update one or more profile fields. All fields are optional and can be sent independently. Body fields: `email` (string), `phone` (string \| null — full format e.g. `"+54 9 11 1234 5678"`), `avatarKey` (string \| null), `currentPassword` + `newPassword` (both required together to change password, min 8 chars). Returns 409 if email already taken. |
| POST | `/api/client/auth/presign` | Returns a presigned PUT URL to upload an avatar image directly to MinIO. Body: `{ filename, contentType }` (contentType must be `image/*`). Returns `{ uploadUrl, key }`. After upload, save `key` via `PATCH /api/client/auth/me`. |

### Athlete schedule (athlete session required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/client/[dni]` | Get client info + all APPROVED schedule copies with resolved workouts and presigned file URLs. Used by `/schedule/[dni]`. Returns 404 if DNI not found. |
| POST | `/api/client/[dni]/comments` | Add a comment to a day on behalf of the athlete. Body: `{ copyId, dayIndex, content }`. |

### Public lookup (no auth required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/client/[dni]/info` | Lightweight lookup by DNI. Returns `{ name, isActive }`. Returns 404 if DNI not found or athlete is soft-deleted. No sensitive data exposed. |

---

## Middleware

`src/middleware.ts` protects:
- All routes under `/(coach)/` → checks `coach_session`, redirects to `/login` if missing.
- All `/api/` routes except the public ones listed below → returns `401` if no coach session.

Excluded from coach middleware (no coach session required):
- `/api/auth/login`
- `/api/client/*` (handled separately by each route — some require athlete session, some are open)
- `/schedule/*` pages (athlete session is checked at the page/route level, not middleware)
