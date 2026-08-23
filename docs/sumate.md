# `/sumate` — flujo de ingreso al grupo

Sección para gente que todavía no es parte del Training Team. Tres etapas en una
sola página (`app/sumate/page.tsx` + `components/join-flow.tsx`):

1. **Info** — cómo entrenamos, qué esperamos, cuota, dónde y cuándo.
2. **Formulario** — wizard de 5 pasos con validación por paso.
3. **Confirmación** — repaso de todo lo cargado y confirmación explícita
   ("si después de leer todo seguís queriendo entrar"). Recién ahí se envía.

Termina en una pantalla de cierre que le dice al aspirante que Roberto lo va a
contactar por WhatsApp.

Reemplaza a `/quiz`, que posteaba a un Google Form con `no-cors` y no dejaba
rastro en el panel del coach. Ese formulario quedó **legacy**.

## Dónde se edita cada cosa

| Qué | Archivo |
|---|---|
| Textos del paso 1 | `lib/join-info.ts` |
| Preguntas del formulario | `lib/join-form.ts` |
| UI del flujo | `components/join-flow.tsx` |

`lib/join-form.ts` es la **única fuente de verdad** de las preguntas. El backend
no las conoce: recibe cada respuesta como `{ id, label, value }` y la guarda tal
cual. Agregar o reescribir una pregunta es editar ese archivo y deployar — no
hay migración ni cambio del lado del panel del coach.

Los campos con `showIf` sólo se muestran, se validan y se envían si la condición
se cumple. Los cinco campos de contacto más `birthDate` y `gender`
(`CONTACT_FIELD_IDS`) viajan como columnas propias; el resto va al JSON.

## Envío

```
navegador → POST /api/public/applications        (ruta server-side de este repo)
              revalida los required visibles
              agrega X-Api-Key y X-Client-Ip
          → POST {COACH_API_URL}/api/v1/public/applications
```

El secreto vive sólo en el servidor. `X-Client-Ip` lleva la IP real del
visitante: sin eso el coach vería siempre la IP de Vercel y su rate limit
(5/hora) sería global en vez de por persona.

Errores: se muestran tal cual los del usuario (`400`, `429`); cualquier otra
cosa se loguea y al visitante se le muestra un mensaje genérico.

## Variables de entorno

```bash
COACH_PUBLIC_API_KEY=   # debe coincidir con PUBLIC_API_KEY en roberto-parodi
```

## Nota sobre las animaciones

El flujo anima **sólo la entrada** de cada etapa, con un `motion.div` cuya `key`
es la etapa. No usa `AnimatePresence` con `exit`, por elección: con `mode="wait"`
la etapa nueva no monta hasta que termina la salida de la anterior, así que la
transición depende de que la animación llegue al final. Animando sólo la entrada
el cambio de etapa es inmediato y no hay nada que pueda quedar a medias.

Importa porque el navegador congela `requestAnimationFrame` cuando la pestaña
está en segundo plano, y framer-motion se detiene con él. En una PWA que la
gente manda a background a mitad de un formulario, una salida `exit` se queda
trabada hasta que vuelven a la pestaña (se recupera sola al volver, pero el
cambio de paso se ve demorado). La versión actual no tiene ese modo de falla.

**Al depurar con la pestaña en segundo plano**, tené presente que ninguna
animación avanza: vas a ver elementos con la `opacity` inicial congelada — el
navbar del sitio, por ejemplo, queda translúcido y el contenido se ve a través.
No es un bug de la página.
