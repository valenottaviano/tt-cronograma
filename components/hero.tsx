"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Zoom Effect */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?q=80&w=2164&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center">
        {/* Logo TT - Destacado */}
        <motion.img
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          src="https://www.carreratt.com.ar/logo-tt.png"
          alt="TT Training Team Logo"
          className="h-28 w-auto mb-6 md:h-32 drop-shadow-2xl"
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg tracking-tight"
        >
          Tu Próxima Meta
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md font-medium"
        >
          Calendario oficial del Training Team
        </motion.p>
      </div>
    </div>
  );
}
