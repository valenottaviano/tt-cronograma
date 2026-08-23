/**
 * Definición del formulario de ingreso al grupo.
 *
 * Esta es la ÚNICA fuente de verdad de las preguntas. El backend
 * (roberto-parodi) no las conoce: recibe cada respuesta como
 * `{ id, label, value }` y la guarda tal cual. Agregar, sacar o reescribir una
 * pregunta acá no requiere migración ni deploy del panel del coach.
 *
 * Reemplaza al Google Form legacy que usaba `/quiz`.
 */

export type FieldType = "text" | "email" | "tel" | "date" | "textarea" | "select";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  /** Solo se muestra si el campo `id` indicado tiene este valor. */
  showIf?: { field: string; equals: string };
  /** Ayuda breve debajo del campo. */
  hint?: string;
}

export interface FormStep {
  title: string;
  description: string;
  fields: FormField[];
}

const YES_NO = ["Sí", "No"];

/**
 * Los cinco primeros campos son los datos de contacto: viajan como columnas
 * propias en la base del coach (ver `contactFieldIds`). El resto va al JSON de
 * respuestas.
 */
export const FORM_STEPS: FormStep[] = [
  {
    title: "Tus datos",
    description: "Para poder contactarte",
    fields: [
      { id: "firstName", label: "Nombre", type: "text", required: true, placeholder: "Juan" },
      { id: "lastName", label: "Apellido", type: "text", required: true, placeholder: "Pérez" },
      { id: "dni", label: "DNI", type: "text", required: true, placeholder: "30123456" },
      { id: "email", label: "Email", type: "email", required: true, placeholder: "juan@email.com" },
      {
        id: "phone",
        label: "WhatsApp",
        type: "tel",
        required: true,
        placeholder: "3814123456",
        hint: "Con característica, sin 0 ni 15. Es por donde te vamos a escribir.",
      },
    ],
  },
  {
    title: "Sobre vos",
    description: "Para armar tu plan",
    fields: [
      { id: "birthDate", label: "Fecha de nacimiento", type: "date", required: true },
      { id: "gender", label: "Sexo", type: "select", required: true, options: ["Femenino", "Masculino", "Otro"] },
    ],
  },
  {
    title: "Tu actividad hoy",
    description: "Contanos cómo venís",
    fields: [
      { id: "currentActivity", label: "¿Venís haciendo actividad física?", type: "select", required: true, options: YES_NO },
      {
        id: "currentVolume",
        label: "¿Cuántas horas y/o kilómetros por semana?",
        type: "text",
        placeholder: "Ej: 3 veces por semana, 20 km",
        showIf: { field: "currentActivity", equals: "Sí" },
      },
      { id: "strengthWork", label: "¿Estás haciendo trabajos de fortalecimiento?", type: "select", required: true, options: YES_NO },
      {
        id: "strengthDays",
        label: "¿Qué días hacés esos trabajos?",
        type: "text",
        placeholder: "Ej: martes y jueves",
        showIf: { field: "strengthWork", equals: "Sí" },
      },
    ],
  },
  {
    title: "Logística",
    description: "Dónde y con qué entrenás",
    fields: [
      { id: "canAttendVenue", label: "¿Podés ir al predio?", type: "select", required: true, options: ["Sí", "No", "A veces"] },
      { id: "hasBike", label: "¿Tenés bicicleta?", type: "select", required: true, options: YES_NO },
      {
        id: "availability",
        label: "¿Qué días y en qué lugar tenés disponibilidad para entrenar?",
        type: "textarea",
        required: true,
        placeholder: "Ej: lunes, miércoles y viernes a la mañana, cerca del parque",
      },
    ],
  },
  {
    title: "Salud y objetivos",
    description: "Lo último y listo",
    fields: [
      {
        id: "injuries",
        label: "¿Tenés o tuviste alguna lesión?",
        type: "textarea",
        placeholder: "Contanos cuál y cuándo. Si no tuviste, escribí \"ninguna\".",
        required: true,
      },
      {
        id: "goal",
        label: "¿Cuál es tu objetivo?",
        type: "textarea",
        required: true,
        placeholder: "Ej: correr mis primeros 10k, bajar tiempos en 21k, volver a entrenar…",
      },
    ],
  },
];

/** Campos que el backend guarda como columnas propias, no dentro de `answers`. */
export const CONTACT_FIELD_IDS = [
  "firstName",
  "lastName",
  "dni",
  "email",
  "phone",
  "birthDate",
  "gender",
] as const;

export const ALL_FIELDS: FormField[] = FORM_STEPS.flatMap((s) => s.fields);

/** Un campo condicional oculto no se pide ni se envía. */
export function isFieldVisible(field: FormField, values: Record<string, string>): boolean {
  if (!field.showIf) return true;
  return values[field.showIf.field] === field.showIf.equals;
}

export function visibleFields(step: FormStep, values: Record<string, string>): FormField[] {
  return step.fields.filter((f) => isFieldVisible(f, values));
}

/**
 * Separa los valores del formulario en el payload que espera el coach:
 * contacto en la raíz, el resto como respuestas auto-descriptivas.
 */
export function buildApplicationPayload(values: Record<string, string>) {
  const contact = new Set<string>(CONTACT_FIELD_IDS);
  const answers = ALL_FIELDS
    .filter((f) => !contact.has(f.id) && isFieldVisible(f, values))
    .map((f) => ({ id: f.id, label: f.label, value: (values[f.id] ?? "").trim() }))
    .filter((a) => a.value !== "");

  return {
    firstName: (values.firstName ?? "").trim(),
    lastName: (values.lastName ?? "").trim(),
    dni: (values.dni ?? "").trim(),
    email: (values.email ?? "").trim(),
    phone: (values.phone ?? "").trim(),
    // El backend valida ISO 8601 completo; el input date da "YYYY-MM-DD".
    birthDate: values.birthDate ? new Date(`${values.birthDate}T00:00:00Z`).toISOString() : null,
    gender: values.gender || null,
    answers,
  };
}

export type ApplicationPayload = ReturnType<typeof buildApplicationPayload>;
