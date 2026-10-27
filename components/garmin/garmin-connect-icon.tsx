import { cn } from '@/lib/utils';

/**
 * El ícono de la app Garmin Connect, tal cual lo da Garmin en sus recursos de
 * marca (sin recortar ni recolorear). Va siempre junto al nombre completo,
 * "Garmin Connect".
 */
export function GarminConnectIcon({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 7 KB, no vale la pena next/image
    <img src="/garmin/garmin-connect.png" alt="" aria-hidden className={cn('shrink-0 rounded-[22%]', className)} />
  );
}
