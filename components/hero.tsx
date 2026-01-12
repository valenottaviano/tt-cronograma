"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TTCCredencialDialog } from "./tt-credencial-dialog";
import { ChevronDown, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div
      ref={ref}
      className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center"
    >
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1758506971683-c080e6f16ce9?q=80&w=2340&auto=format&fit=crop')",
          }}
        />
        {/* Gradient Overlay for Readability - Apple Style */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-4 flex flex-col items-center max-w-4xl mx-auto"
      >
        {/* Logo TT - Destacado */}
        <motion.img
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="https://www.carreratt.com.ar/logo-tt.png"
          alt="TT Training Team Logo"
          className="h-24 w-auto mb-8 md:h-32 drop-shadow-2xl"
        />

        {/* <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-6 tracking-tight leading-tight"
        >
          Grupo TT
        </motion.h1> */}

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl drop-shadow-md mb-8"
        >
          Descubrí todo lo que tenemos para vos
        </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4"
          >
            <TTCCredencialDialog />
            <Button 
              asChild
              className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg min-w-[200px]"
            >
              <Link href="/store">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Tienda
              </Link>
            </Button>
          </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 text-white/50" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
