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

import { getFirebaseRaces, getFirebaseRace } from "@/lib/firebase/races";
import { Countdown } from "@/components/countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageWithSkeleton } from "@/components/image-with-skeleton";
import { DiscountCode } from "@/components/discount-code";

export const revalidate = 0;

export async function generateStaticParams() {
  const races = await getFirebaseRaces();
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
  const race = await getFirebaseRace(id);

  if (!race) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background font-sans pb-12">
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <ImageWithSkeleton
          src={
            race.image ||
            "https://images.unsplash.com/photo-1533560906234-8f85e186d6ea?q=80&w=1000&auto=format&fit=crop"
          }
          alt={race.name}
          className="w-full h-full object-cover"
        />

        {/* Back Button - Positioned at top to avoid overlap with bottom content */}
        <div className="absolute top-0 left-0 z-30 w-full pt-32 pl-4 md:pl-8 container mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              asChild
              className="w-fit bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-neutral-600 transition-all duration-300 shadow-lg group"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver al listado
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="absolute inset-0 z-20 container mx-auto px-4 flex flex-col justify-end pb-8 md:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            <Badge
              className={`text-base px-3 py-1 border-0 ${
                race.type === "trail"
                  ? "bg-green-600/80 hover:bg-green-700/90 text-white"
                  : "bg-white/20 hover:bg-white/30 text-white"
              }`}
            >
              {race.type === "trail" ? "Trail Running" : "Calle"}
            </Badge>
            <Badge
              variant="outline"
              className="text-base px-3 py-1 text-white border-white/30 bg-neutral-900"
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
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Sobre la carrera
              </h2>
              <p className="text-white/80 leading-relaxed text-lg">
                {race.description ||
                  "No hay descripción disponible para esta carrera."}
              </p>

              <Separator className="my-8 bg-white/10" />

              <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
                <Ruler className="w-5 h-5 mr-2 text-white/60" />
                Distancias
              </h3>
              <div className="flex flex-wrap gap-3">
                {race.distance.split(",").map((dist, i) => (
                  <div
                    key={i}
                    className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-4 py-2 rounded-lg font-medium text-lg text-white transition-colors"
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
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                <CalendarIcon className="w-5 h-5 mr-2 text-white/60" />
                Fecha y Hora
              </h3>
              <p className="text-2xl font-bold mb-1 text-white">
                {format(parseISO(race.date), "d 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </p>
              <p className="text-white/60">
                {format(parseISO(race.date), "HH:mm 'hs'", { locale: es })}
              </p>

              <Separator className="my-6 bg-white/10" />

              <div className="text-center">
                <p className="text-sm text-white/50 uppercase tracking-widest mb-3">
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
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-yellow-200 mb-2 flex items-center">
                  <Ticket className="w-5 h-5 mr-2" />
                  ¡Código de Descuento!
                </h3>
                {race.discountCode.split(",").map((code, i) => (
                  <DiscountCode key={i} code={code.trim()} />
                ))}
              </motion.div>
            )}

            {race.url && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="w-full text-lg h-14 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 hover:from-neutral-700 hover:via-neutral-600 hover:to-neutral-700 border border-neutral-600 hover:border-neutral-500 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-500"
                >
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
