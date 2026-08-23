/**
 * Contenido del PASO 1 del flujo de ingreso (`/sumate`): lo que ve alguien que
 * todavía no es parte del grupo, antes de completar el formulario.
 *
 * Es todo texto plano: editar este archivo alcanza, no hay que tocar la UI.
 * Cada `body` es una lista de párrafos.
 */

export interface InfoSection {
  /** Emoji que encabeza la tarjeta. */
  icon: string;
  title: string;
  body: string[];
}

export const JOIN_EMOJI = "🏃‍♀️";
export const JOIN_HEADLINE = "Bienvenido/a a TT";

export const JOIN_INTRO: string[] = [
  "Si estás pensando en comenzar a entrenar con TT, queremos que antes de ingresar conozcas nuestra propuesta y todo lo que implica ser parte de nuestro equipo.",
  "En TT entendemos que entrenar no es solamente salir a correr. Es aprender a hacerlo correctamente, conocer tu cuerpo, mejorar progresivamente, prevenir lesiones, compartir objetivos y disfrutar del camino junto a un gran grupo de personas.",
  "Por eso, tu cuota incluye mucho más que un plan de entrenamiento:",
];

export const JOIN_BENEFITS_TITLE = "¿Qué incluye tu cuota?";

export const JOIN_SECTIONS: InfoSection[] = [
  {
    icon: "📝",
    title: "Planificación personalizada",
    body: [
      "Planificamos tu entrenamiento de acuerdo con tu nivel actual, tus objetivos y tu evolución, utilizando nuestra propia App para que puedas consultar tu planificación en todo momento.",
    ],
  },
  {
    icon: "📲",
    title: "Comunicación permanente",
    body: [
      "Contás con diferentes vías de comunicación para poder consultar, informar cómo te sentís y realizar los ajustes necesarios en tu entrenamiento. Roberto y Caro acompañan tu proceso para personalizarlo lo máximo posible.",
    ],
  },
  {
    icon: "🏢",
    title: "Centro de asesoramiento deportivo",
    body: [
      "Contamos con una oficina donde podés encontrarte con tus entrenadores y compañeros para conversar sobre entrenamiento, competencias, objetivos y todo aquello que ayude a mejorar tu experiencia deportiva.",
    ],
  },
  {
    icon: "⛰️",
    title: "Entrenamientos asistidos y circuitos preparados",
    body: [
      "Nuestros entrenamientos cuentan con circuitos previamente marcados y asistencia, incluyendo hidratación, botiquín completo y vehículo de asistencia cuando corresponde. Además, nos ocupamos posteriormente de la limpieza de los circuitos.",
    ],
  },
  {
    icon: "🛡️",
    title: "Seguro deportivo",
    body: [
      "Contás con seguro deportivo como respaldo ante eventuales lesiones durante las actividades contempladas.",
    ],
  },
  {
    icon: "💪",
    title: "Fortalecimiento",
    body: [
      "Tenés 2 clases semanales de fortalecimiento en el Predio Las Cañas, porque sabemos que correr mejor también implica desarrollar fuerza.",
    ],
  },
  {
    icon: "🏃‍♂️",
    title: "Descuentos en carreras",
    body: [
      "Accedés a descuentos en gran parte de las carreras con las que tenemos acuerdos.",
    ],
  },
  {
    icon: "📱",
    title: "Grupo de WhatsApp",
    body: [
      "Formás parte de un importante grupo de WhatsApp donde podés realizar consultas, recibir información y mantenerte conectado con el equipo y tus compañeros.",
    ],
  },
  {
    icon: "🎁",
    title: "Beneficios y descuentos",
    body: [
      "Tenemos acuerdos y beneficios en diferentes comercios y servicios vinculados al deporte: gimnasios, centros de recuperación, suplementos deportivos, dietéticas y otros establecimientos. Los nuevos beneficios se van comunicando y actualizando periódicamente.",
    ],
  },
  {
    icon: "🎓",
    title: "Entrenar también es aprender",
    body: [
      "No queremos que simplemente cumplas una planificación. Queremos que entiendas qué estás haciendo, por qué lo hacés y cómo hacerlo correctamente.",
      "Por eso, periódicamente compartimos videos, audios y material explicativo sobre entrenamiento, técnica, recuperación, fuerza, competencias y diferentes aspectos relacionados con el running.",
    ],
  },
  {
    icon: "❤️",
    title: "Una comunidad",
    body: [
      "Y quizás lo más importante: vas a formar parte de un grupo de grandes corredores y, sobre todo, de excelentes personas.",
      "Porque en TT creemos que los objetivos deportivos se disfrutan mucho más cuando se comparten.",
    ],
  },
];

/** Cierre del paso 1: explica qué pasa al pulsar el botón. */
export const JOIN_CTA = {
  emoji: "🚀",
  title: "¿Querés ser parte de TT?",
  body: [
    "Si después de conocer nuestra propuesta sentís que TT es el lugar donde querés entrenar, el siguiente paso es conocerte un poco más.",
    "Te vamos a realizar una serie de preguntas sobre tu experiencia, nivel actual, disponibilidad, antecedentes deportivos, objetivos y competencias que tengas previstas.",
    "Con esa información podremos comenzar a diseñar una planificación acorde a vos y a tu momento deportivo.",
  ],
};
