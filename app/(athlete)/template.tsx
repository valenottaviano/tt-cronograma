'use client';

import { motion } from 'framer-motion';

/**
 * Transición entre pestañas. Un template (no un layout) se vuelve a montar en
 * cada navegación, así que cada pantalla entra con un fundido corto.
 *
 * Sólo animación de entrada, a propósito: con AnimatePresence + mode="wait" la
 * pantalla nueva espera a que termine la salida, y eso se traba cuando la
 * pestaña del navegador queda en segundo plano (ver docs/sumate.md).
 */
export default function AthleteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
