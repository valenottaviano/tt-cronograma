/**
 * Test E2E del flujo de ingreso (`/sumate`) contra entornos desplegados.
 *
 *   node scripts/e2e-sumate.mts             # sólo lecturas, no escribe nada
 *   node scripts/e2e-sumate.mts --full      # además crea una solicitud real y la borra
 *
 * Por defecto apunta a producción. Para otro entorno, SITE_URL y COACH_URL.
 *
 * Sin dependencias: Node ≥ 23 ejecuta TypeScript directamente.
 *
 * El payload se deriva de `lib/join-form.ts`, que es la fuente de verdad de las
 * preguntas. Si alguien agrega, saca o hace condicional un campo, el test se
 * adapta solo en vez de romperse por estar desactualizado.
 *
 * Variables:
 *   SITE_URL       (default https://www.grupott.com.ar)
 *   COACH_URL      (default https://plan.grupott.com.ar)
 *   COACH_EMAIL    \ sólo para --full: hacen falta para verificar la solicitud
 *   COACH_PASSWORD / en el panel y para borrarla después
 */

import {
  ALL_FIELDS,
  isFieldVisible,
  type FormField,
} from "../lib/join-form.ts";

const SITE = (process.env.SITE_URL ?? "https://www.grupott.com.ar").replace(/\/$/, "");
const COACH = (process.env.COACH_URL ?? "https://plan.grupott.com.ar").replace(/\/$/, "");
const FULL = process.argv.includes("--full");

/** DNI reservado para la prueba. Nunca se pisa una solicitud real: ver `guardDni`. */
const TEST_DNI = "99000001";
const MARKER = "E2E AUTOMATICO";

// ── salida ────────────────────────────────────────────────────────────────────

const C = { reset: "\x1b[0m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m", dim: "\x1b[2m" };
let passed = 0;
let failed = 0;
const skipped: string[] = [];

function section(title: string) {
  console.log(`\n${C.blue}── ${title} ──${C.reset}`);
}
function ok(msg: string) {
  passed++;
  console.log(`${C.green}✓${C.reset} ${msg}`);
}
function fail(msg: string, detail?: unknown) {
  failed++;
  console.log(`${C.red}✗ ${msg}${C.reset}`);
  if (detail !== undefined) console.log(`${C.dim}  ${JSON.stringify(detail)}${C.reset}`);
}
function skip(msg: string) {
  skipped.push(msg);
  console.log(`${C.yellow}⊘${C.reset} ${msg}`);
}
function check(condition: boolean, msg: string, detail?: unknown) {
  condition ? ok(msg) : fail(msg, detail);
  return condition;
}

// ── helpers HTTP ──────────────────────────────────────────────────────────────

interface Res { status: number; json: any; text: string; networkError?: string }

/**
 * Un host caído o un DNS que no resuelve hace que `fetch` tire una excepción.
 * Se traduce a `status: 0` para que el runner lo reporte como un fallo más y
 * siga con el resto de los checks, en vez de morir con un stack trace.
 */
async function req(url: string, init?: RequestInit): Promise<Res> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { status: 0, json: null, text: "", networkError: msg };
  }
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* respuesta no-JSON */ }
  return { status: res.status, json, text };
}

// ── payload derivado del formulario ───────────────────────────────────────────

function sampleValue(f: FormField): string {
  switch (f.type) {
    case "email": return `e2e.${Date.now()}@example.com`;
    case "tel": return "3810000000";
    case "date": return "1990-01-01";
    case "select": return f.options?.[0] ?? "";
    default: return f.id === "dni" ? TEST_DNI : MARKER;
  }
}

/**
 * Construye un set de respuestas válido recorriendo la definición del
 * formulario. Repite hasta estabilizarse porque completar un `select` puede
 * revelar campos condicionales que a su vez hay que completar.
 */
function buildValues(overrides: Record<string, string> = {}): Record<string, string> {
  const values: Record<string, string> = { ...overrides };
  for (let pass = 0; pass < ALL_FIELDS.length + 1; pass++) {
    let changed = false;
    for (const f of ALL_FIELDS) {
      if (!isFieldVisible(f, values)) continue;
      if (values[f.id] !== undefined) continue;
      values[f.id] = sampleValue(f);
      changed = true;
    }
    if (!changed) break;
  }
  // Los campos ocultos no deben viajar: se limpian por si un override los dejó.
  for (const f of ALL_FIELDS) {
    if (!isFieldVisible(f, values)) delete values[f.id];
  }
  return values;
}

function visibleIds(values: Record<string, string>): string[] {
  return ALL_FIELDS.filter((f) => isFieldVisible(f, values)).map((f) => f.id);
}

// ── sesión del coach (sólo --full) ────────────────────────────────────────────

async function coachLogin(): Promise<string | null> {
  const email = process.env.COACH_EMAIL;
  const password = process.env.COACH_PASSWORD;
  if (!email || !password) return null;

  let res: Response;
  try {
    res = await fetch(`${COACH}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const cookies = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : [res.headers.get("set-cookie") ?? ""];
  const jar = cookies.filter(Boolean).map((c) => c.split(";")[0]).join("; ");
  return jar || null;
}

const authed = (jar: string): RequestInit => ({ headers: { Cookie: jar } });

// ── checks que no escriben nada ───────────────────────────────────────────────

async function smokeChecks() {
  section("Infraestructura");

  const health = await req(`${COACH}/api/health`);
  check(health.status === 200, "el panel del coach responde", health.networkError ?? health.status);
  check(health.json?.checks?.database === "ok", "Postgres alcanzable", health.json?.checks);
  check(health.json?.checks?.redis === "ok", "Redis alcanzable", health.json?.checks);

  const site = await req(`${SITE}/sumate`);
  check(site.status === 200, "/sumate responde", site.networkError ?? site.status);
  check(site.text.includes("Quiero sumarme"), "/sumate renderiza el paso informativo");

  section("Puertas cerradas");

  const noKey = await req(`${COACH}/api/v1/public/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  check(noKey.status === 401, "el endpoint público rechaza sin API key", noKey.status);

  const badKey = await req(`${COACH}/api/v1/public/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": "clave-incorrecta" },
    body: "{}",
  });
  check(badKey.status === 401, "el endpoint público rechaza con API key incorrecta", badKey.status);

  const noSession = await req(`${COACH}/api/applications`);
  check(noSession.status === 401, "la API del panel exige sesión de coach", noSession.status);

  section("Validación");

  const incompleto = await req(`${SITE}/api/public/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName: "Solo", lastName: "Nombre" }),
  });
  check(incompleto.status === 400, "rechaza un formulario incompleto", incompleto.status);
  check(
    typeof incompleto.json?.error === "string" && incompleto.json.error.includes("Falta completar"),
    "informa qué campos faltan",
    incompleto.json,
  );

  // Payload completo pero con email inválido: el coach lo rechaza con SU propia
  // validación, lo que prueba que la clave compartida coincide en ambos lados
  // sin llegar a escribir una fila.
  const conEmailMalo = { ...buildValues(), email: "NO-ES-UN-EMAIL" };
  const cadena = await req(`${SITE}/api/public/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conEmailMalo),
  });

  if (cadena.status === 429) {
    skip("cadena web → coach: rate limit alcanzado (5/hora por IP), no concluyente");
  } else if (cadena.status === 502 || cadena.status === 503) {
    fail(
      "cadena web → coach: la clave compartida no coincide o falta",
      { status: cadena.status, hint: "revisar COACH_PUBLIC_API_KEY (Vercel) vs PUBLIC_API_KEY (Dokploy)" },
    );
  } else {
    check(
      cadena.status === 400 && cadena.json?.error === "Email inválido",
      "cadena web → coach: la clave compartida coincide (rechazo del validador del coach)",
      { status: cadena.status, body: cadena.json },
    );
  }
}

// ── ciclo completo: crear, verificar, borrar ──────────────────────────────────

/** Nunca pisar una solicitud real: si el DNI de prueba ya está en uso, abortar. */
async function guardDni(jar: string): Promise<boolean> {
  const res = await req(`${COACH}/api/applications`, authed(jar));
  if (res.status !== 200) {
    fail("no se pudo listar solicitudes para el chequeo previo", res.status);
    return false;
  }
  const choque = (res.json.data ?? []).find((a: any) => a.dni === TEST_DNI);
  if (choque) {
    fail(
      `ya existe una solicitud con el DNI de prueba ${TEST_DNI} — se aborta para no pisarla`,
      { id: choque.id, nombre: `${choque.firstName} ${choque.lastName}` },
    );
    return false;
  }
  ok(`el DNI de prueba ${TEST_DNI} está libre`);
  return true;
}

async function fullCycle() {
  section(`Ciclo completo — escribe y borra en ${COACH}`);

  const jar = await coachLogin();
  if (!jar) {
    skip("--full necesita COACH_EMAIL y COACH_PASSWORD válidas; se omite el ciclo completo");
    return;
  }
  ok("sesión de coach iniciada");

  if (!(await guardDni(jar))) return;

  const antes = await req(`${COACH}/api/dashboard/stats`, authed(jar));
  const contadorAntes = antes.json?.data?.newApplicationCount ?? 0;

  // "Sí" en actividad revela el campo condicional; "No" en fortalecimiento lo
  // oculta. Así una sola solicitud prueba las dos ramas.
  const values = buildValues({ currentActivity: "Sí", strengthWork: "No" });
  const visibles = visibleIds(values);
  const reveladoOk = visibles.includes("currentVolume") && !visibles.includes("strengthDays");
  if (!reveladoOk) {
    skip("el cuestionario cambió: no se pudo armar el caso condicional; se prueba igual el resto");
  }

  let id: string | null = null;
  try {
    const creada = await req(`${SITE}/api/public/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (creada.status === 429) {
      skip("rate limit alcanzado; no se pudo crear la solicitud de prueba");
      return;
    }
    if (!check(creada.status === 201, "la solicitud se crea desde la web", { status: creada.status, body: creada.json })) {
      return;
    }
    id = creada.json?.data?.id ?? null;
    check(typeof id === "string" && id.length > 0, "la API devuelve el id de la solicitud");
    check(
      Object.keys(creada.json?.data ?? {}).length === 1,
      "la respuesta pública no filtra más que el id",
      creada.json?.data,
    );

    const lista = await req(`${COACH}/api/applications`, authed(jar));
    const encontrada = (lista.json?.data ?? []).find((a: any) => a.id === id);
    if (!check(!!encontrada, "la solicitud aparece en el panel del coach")) return;

    check(encontrada.status === "NEW", 'llega con estado "Nueva"', encontrada.status);
    check(encontrada.dni === TEST_DNI, "el DNI viajó intacto", encontrada.dni);
    check(encontrada.phone === values.phone, "el WhatsApp viajó intacto", encontrada.phone);
    check(encontrada.email === values.email, "el email viajó intacto", encontrada.email);
    check(!!encontrada.birthDate, "la fecha de nacimiento se guardó");

    const ids = (encontrada.answers ?? []).map((r: any) => r.id);
    const esperadas = visibles.filter(
      (fid) => !["firstName", "lastName", "dni", "email", "phone", "birthDate", "gender"].includes(fid),
    );
    check(
      esperadas.every((fid) => ids.includes(fid)),
      `llegaron las ${esperadas.length} respuestas del cuestionario`,
      { esperadas, recibidas: ids },
    );
    check(
      (encontrada.answers ?? []).every((r: any) => r.label && r.value),
      "cada respuesta trae su enunciado (autodescriptiva)",
    );
    if (reveladoOk) {
      check(ids.includes("currentVolume"), "el campo condicional visible sí viajó");
      check(!ids.includes("strengthDays"), "el campo condicional oculto no viajó");
    }

    const stats = await req(`${COACH}/api/dashboard/stats`, authed(jar));
    check(
      (stats.json?.data?.newApplicationCount ?? 0) === contadorAntes + 1,
      "el contador de solicitudes sin abrir subió en 1",
      { antes: contadorAntes, ahora: stats.json?.data?.newApplicationCount },
    );
  } finally {
    // Pase lo que pase con las aserciones, la solicitud de prueba se borra.
    if (id) {
      const del = await req(`${COACH}/api/applications/${id}`, { method: "DELETE", ...authed(jar) });
      check(del.status === 200, "la solicitud de prueba se eliminó");

      const verif = await req(`${COACH}/api/applications`, authed(jar));
      const sigue = (verif.json?.data ?? []).some((a: any) => a.id === id);
      check(!sigue, "no quedó ningún rastro en el panel");

      const stats = await req(`${COACH}/api/dashboard/stats`, authed(jar));
      check(
        (stats.json?.data?.newApplicationCount ?? 0) === contadorAntes,
        "el contador volvió a su valor original",
        { esperado: contadorAntes, actual: stats.json?.data?.newApplicationCount },
      );
    }
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

console.log(`${C.dim}web:   ${SITE}\ncoach: ${COACH}\nmodo:  ${FULL ? "completo (escribe y borra)" : "sólo lectura"}${C.reset}`);

await smokeChecks();
if (FULL) await fullCycle();
else console.log(`\n${C.dim}(pasá --full para probar además el alta real y su borrado)${C.reset}`);

section("Resultado");
console.log(`${C.green}${passed} ok${C.reset}  ${failed ? C.red : C.dim}${failed} fallos${C.reset}  ${skipped.length ? C.yellow : C.dim}${skipped.length} omitidos${C.reset}`);
process.exit(failed > 0 ? 1 : 0);
