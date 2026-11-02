import { cn } from '@/lib/utils';

/**
 * El logo de COROS, tal cual está en coros.com (el trazo y su rojo, sin
 * redibujar), sobre fondo negro como lo muestra COROS en su pantalla de
 * autorización. Va siempre junto al nombre, "COROS".
 */
export function CorosIcon({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 1 KB, no vale la pena next/image
    <img src="/coros/coros.svg" alt="" aria-hidden className={cn('shrink-0 rounded-[22%]', className)} />
  );
}
