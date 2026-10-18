'use client';

import { MotionConfig } from 'framer-motion';

/** Quien pidió menos movimiento en su sistema no ve las animaciones de la app. */
export function AppMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
