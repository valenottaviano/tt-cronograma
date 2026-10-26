import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Política de privacidad | TT",
  description: "Qué datos guarda el Training Team, para qué los usa y cómo pedir que los borremos.",
};

/**
 * Política de privacidad. La piden Strava y Garmin para aprobar sus APIs, así
 * que tiene que decir la verdad sobre lo que hace el sistema: si se suma un
 * dato o un servicio nuevo que procese datos de los atletas, actualizarla
 * (y la fecha de abajo).
 */
const UPDATED = "26 de octubre de 2026";
const RESPONSIBLE = "Roberto Parodi";
const EMAIL = "rparodi26@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-16 pt-24">
      <div className="absolute left-0 top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/10 via-background to-background" />

      <div className="container relative z-10 mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <Button asChild variant="ghost" className="group text-white/60 hover:bg-white/5 hover:text-white">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <header className="mb-10">
          <h1 className="mb-3 text-4xl font-bold uppercase italic tracking-tight text-white md:text-5xl">
            Política de privacidad
          </h1>
          <p className="text-sm text-white/50">Última actualización: {UPDATED}</p>
        </header>

        <article className="space-y-8 text-[15px] leading-relaxed text-white/80 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          <section>
            <p>
              Esta política explica qué datos personales guarda el Training Team (Grupo TT) cuando usás
              grupott.com.ar y la app de entrenamiento, para qué los usamos y qué podés hacer con ellos.
            </p>
          </section>

          <section>
            <h2>Responsable</h2>
            <p>
              El responsable de los datos es {RESPONSIBLE}, coach del Training Team, en Tucumán,
              Argentina. Para cualquier consulta o pedido sobre tus datos, escribí a{" "}
              <a href={`mailto:${EMAIL}`} className="text-brand-orange underline underline-offset-4">{EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2>Qué datos guardamos</h2>
            <ul>
              <li>
                <strong className="text-white">Tu cuenta:</strong> nombre, DNI, email, teléfono, fecha de nacimiento, foto de
                perfil y contraseña (nunca la guardamos en texto plano).
              </li>
              <li>
                <strong className="text-white">Tu entrenamiento:</strong> el grupo y la planilla que te asigna el coach, si
                entrenás en gimnasio o tenés bici, las carreras en las que te anotás, los avisos de lesión, viaje o
                vacaciones que cargás, tus comentarios en la planilla y las notas del coach sobre tu entrenamiento.
              </li>
              <li>
                <strong className="text-white">Pagos:</strong> los comprobantes de la cuota mensual que subís.
              </li>
              <li>
                <strong className="text-white">Solicitud de ingreso:</strong> las respuestas del formulario de «Sumate», si lo
                completaste.
              </li>
              <li>
                <strong className="text-white">Beneficios y tienda:</strong> cuando usás tu credencial en un comercio aliado, el
                registro de esa compra; y los datos y el comprobante de tus pedidos en la tienda.
              </li>
            </ul>
          </section>

          <section>
            <h2>Para qué los usamos</h2>
            <p>
              Sólo para el entrenamiento y la administración del grupo: que el coach arme y siga tu plan, que veas tu
              planilla y tus carreras, validar tu credencial en los comercios aliados, gestionar cuotas y pedidos, y
              escribirte por cosas de tu cuenta (por ejemplo, para recuperar la contraseña). No vendemos ni
              alquilamos tus datos, no mostramos publicidad y no usamos tus datos para entrenar inteligencia
              artificial.
            </p>
          </section>

          <section>
            <h2>Quién los ve</h2>
            <ul>
              <li>El coach y el equipo que administra el grupo.</li>
              <li>
                Los comercios aliados, al escanear tu credencial, ven sólo lo necesario para validarla: tu nombre, tu
                DNI y si la credencial está activa.
              </li>
              <li>Nadie más. Los demás atletas no ven tus datos.</li>
            </ul>
          </section>

          <section>
            <h2>Apps vinculadas: Strava y Garmin</h2>
            <p className="mb-3">
              Vincularlas es opcional y lo hacés vos desde tu perfil, autorizando el acceso en la página de Strava o de
              Garmin. Podés desvincularlas cuando quieras, desde tu perfil o desde la configuración de esas apps.
            </p>
            <ul>
              <li>
                <strong className="text-white">Strava:</strong> leemos el resumen de tus actividades (distancia, tiempo, ritmo,
                desnivel, recorrido) para mostrarte tus estadísticas en la app. Esos datos los ves sólo vos: ni el coach
                ni otros atletas tienen acceso. Al desvincular, revocamos el acceso y borramos tus datos de Strava en el
                momento.
              </li>
              <li>
                <strong className="text-white">Garmin:</strong> sólo enviamos a tu calendario de Garmin Connect los
                entrenamientos que te arma el coach, para que los veas en tu reloj. No leemos tus actividades ni tus
                datos de salud. Al desvincular, borramos el acceso guardado.
              </li>
            </ul>
            <p className="mt-3">Los permisos de estas apps se guardan cifrados.</p>
          </section>

          <section>
            <h2>Dónde se guardan</h2>
            <p>
              En nuestro propio servidor (base de datos y archivos). La web y la app se sirven desde Vercel, y los
              emails de la cuenta salen por Resend. Estos proveedores procesan los datos sólo para prestarnos ese
              servicio.
            </p>
          </section>

          <section>
            <h2>Cuánto tiempo</h2>
            <p>
              Mientras seas parte del grupo. Si dejás de entrenar con nosotros conservamos tu historial de
              entrenamiento, salvo que nos pidas que lo borremos. Los datos de Strava y Garmin se borran apenas
              desvinculás esas apps.
            </p>
          </section>

          <section>
            <h2>Tus derechos</h2>
            <p>
              Podés pedir ver, corregir o borrar tus datos escribiendo a{" "}
              <a href={`mailto:${EMAIL}`} className="text-brand-orange underline underline-offset-4">{EMAIL}</a>, y te
              respondemos dentro de los plazos de la Ley 25.326 de Protección de Datos Personales. La Agencia de
              Acceso a la Información Pública, como órgano de control de esa ley, atiende las denuncias y reclamos
              por incumplimientos de la normativa de datos personales.
            </p>
          </section>

          <section>
            <h2>Cambios</h2>
            <p>Si cambiamos esta política, actualizamos esta página y la fecha de arriba.</p>
          </section>

          <section lang="en" className="border-t border-white/10 pt-8">
            <h2>Summary in English</h2>
            <p>
              Grupo TT (data controller: {RESPONSIBLE}, Tucumán, Argentina, {EMAIL}) stores athletes&apos;
              account and training data only to run our coaching service. We do not sell or share personal data,
              show ads, or use it to train AI. Connecting Strava or Garmin is optional: Strava activity summaries are
              shown only to the athlete they belong to, and Garmin is used only to send the coach&apos;s workouts to the
              athlete&apos;s Garmin Connect calendar (we do not read activity or health data). Tokens are stored
              encrypted, and disconnecting deletes the related data immediately. Data is stored on our own server;
              the website is hosted on Vercel and account emails are sent through Resend. To access, correct or
              delete your data, email {EMAIL}.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
