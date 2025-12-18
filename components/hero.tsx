"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/50 z-10" />
      <motion.img
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        src="https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?q=80&w=2164&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Running Hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg"
        >
          Tu Próxima Meta
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-2xl text-white/90 font-medium drop-shadow-md leading-relaxed"
        >
          El calendario más completo de carreras de calle y trail running en
          Argentina.
          <br className="hidden md:block" /> Encuentra, planifica y supérate.
        </motion.p>
      </div>
    </div>
  );
}
