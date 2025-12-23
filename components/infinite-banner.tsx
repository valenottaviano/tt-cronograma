"use client";

import { motion } from "framer-motion";

interface InfiniteBannerProps {
  onClick?: () => void;
}

export function InfiniteBanner({ onClick }: InfiniteBannerProps) {
  return (
    <div
      onClick={onClick}
      className="w-full bg-orange-600 overflow-hidden py-3 relative z-10 cursor-pointer hover:bg-orange-700 transition-colors"
    >
      <div className="flex select-none">
        <motion.div
          className="flex flex-shrink-0"
          animate={{ x: "-100%" }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20,
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 text-white font-bold uppercase tracking-[0.2em] text-sm"
            >
              Carrera TT
            </span>
          ))}
        </motion.div>
        <motion.div
          className="flex flex-shrink-0"
          animate={{ x: "-100%" }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20,
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 text-white font-bold uppercase tracking-[0.2em] text-sm"
            >
              Carrera TT
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
