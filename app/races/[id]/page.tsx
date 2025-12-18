import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  MapPin,
  Calendar as CalendarIcon,
  ArrowLeft,
  ExternalLink,
  Ruler,
  Ticket,
} from "lucide-react";
import * as motion from "framer-motion/client";

import { getRaces, getRaceById } from "@/lib/google-sheets";
import { Countdown } from "@/components/countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export async function generateStaticParams() {
  const races = await getRaces();
  return races.map((race) => ({
    id: race.id,
  }));
}

export default async function RacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const race = await getRaceById(id);

  if (!race) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background font-sans pb-12">
      <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={
            race.image ||
            "https://images.unsplash.com/photo-1533560906234-8f85e186d6ea?q=80&w=1000&auto=format&fit=crop"
          }
          alt={race.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 container mx-auto px-4 flex flex-col justify-end pb-8 md:pb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              asChild
              variant="outline"
              className="w-fit mb-6 text-white border-white hover:bg-white/20 hover:text-white bg-transparent"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Volver al listado
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            <Badge
              className={`text-base px-3 py-1 ${
                race.type === "trail"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {race.type === "trail" ? "Trail Running" : "Calle"}
            </Badge>
            <Badge
              variant="outline"
              className="text-base px-3 py-1 text-white border-white"
            >
              {race.province}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2"
          >
            {race.name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center text-white/90 text-lg"
          >
            <MapPin className="w-5 h-5 mr-2" />
            {race.location}
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-8 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Sobre la carrera</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {race.description ||
                  "No hay descripción disponible para esta carrera."}
              </p>

              <Separator className="my-8" />

              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Ruler className="w-5 h-5 mr-2" />
                Distancias
              </h3>
              <div className="flex flex-wrap gap-3">
                {race.distance.split(",").map((dist, i) => (
                  <div
                    key={i}
                    className="bg-secondary/50 px-4 py-2 rounded-lg font-medium text-lg"
                  >
                    {dist.trim()}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Fecha y Hora
              </h3>
              <p className="text-2xl font-bold mb-1">
                {format(parseISO(race.date), "d 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </p>
              <p className="text-muted-foreground">
                {format(parseISO(race.date), "HH:mm 'hs'", { locale: es })}
              </p>

              <Separator className="my-6" />

              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3">
                  Tiempo Restante
                </p>
                <div className="flex justify-center scale-125">
                  <Countdown targetDate={race.date} />
                </div>
              </div>
            </div>

            {race.discountCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-500 mb-2 flex items-center">
                  <Ticket className="w-5 h-5 mr-2" />
                  ¡Código de Descuento!
                </h3>
                <p className="text-yellow-700 dark:text-yellow-600 mb-3 text-sm">
                  Usa este código al inscribirte para obtener un beneficio
                  especial.
                </p>
                <div className="bg-white dark:bg-black/40 border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center">
                  <span className="text-xl font-mono font-bold text-yellow-900 dark:text-yellow-400 tracking-wider select-all">
                    {race.discountCode}
                  </span>
                </div>
              </motion.div>
            )}

            {race.url && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild size="lg" className="w-full text-lg h-14">
                  <a href={race.url} target="_blank" rel="noopener noreferrer">
                    Sitio Web Oficial
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
