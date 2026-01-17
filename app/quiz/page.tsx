"use client";

import { QuizForm } from "@/components/quiz-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";
import { Button } from "@/components/ui/button";

export default function QuizPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/10 via-background to-background" />
      
      <div className="container mx-auto max-w-2xl px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            asChild
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/5 group"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
            Encuesta de Nuevos Alumnos
          </h1>
          <p className="text-white/60 text-lg">
            Por favor, tómate unos minutos para completar esta información y ayudarnos a conocerte mejor.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <QuizForm />
        </motion.div>
      </div>
    </div>
  );
}
