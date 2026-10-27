import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { CheckCircle2, CircleAlert, Smartphone } from 'lucide-react';
import { LINKED_NAME_COOKIE, type LinkedApp } from '@/lib/oauth-return';
import { LINK_RESULT_MESSAGES } from '@/lib/linked-app-messages';

export const metadata: Metadata = {
  title: 'Cuenta vinculada | TT',
  robots: { index: false },
};

const APP_NAMES: Record<LinkedApp, string> = { strava: 'Strava', garmin: 'Garmin Connect' };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * El final de vincular Strava o Garmin cuando la vuelta cae en el navegador sin
 * sesión: casi siempre, la app instalada en el iPhone. La vinculación ya se hizo;
 * sólo falta que el atleta vuelva a la app, que se actualiza sola al volver.
 * Desde Safari no hay forma de abrir la app instalada, por eso es un texto y no
 * un botón.
 */
export default async function LinkedPage({ searchParams }: { searchParams: Promise<{ app?: string; result?: string }> }) {
  const { app: appParam, result = 'error' } = await searchParams;
  const app: LinkedApp = appParam === 'strava' ? 'strava' : 'garmin';
  const message = LINK_RESULT_MESSAGES[app][result] ?? LINK_RESULT_MESSAGES[app].error;
  const ok = result === 'connected' || result === 'permission';
  // Para que se note si alguien vinculó su cuenta con el enlace de otro atleta.
  const fullName = (await cookies()).get(LINKED_NAME_COOKIE)?.value;
  const firstName = fullName ? cap(fullName.split(' ')[0].toLowerCase()) : null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 pb-16 pt-24">
      <div className="w-full max-w-sm space-y-5 rounded-3xl border border-border bg-neutral-900 p-6 text-center">
        {ok ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        ) : (
          <CircleAlert className="mx-auto h-12 w-12 text-amber-400" />
        )}
        <div className="space-y-2">
          <h1 className="text-2xl font-black italic leading-tight">
            {ok ? `${APP_NAMES[app]} vinculado` : `No se vinculó ${APP_NAMES[app]}`}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{message.text}</p>
          {ok && firstName && (
            <p className="text-xs text-muted-foreground">
              Quedó en la cuenta de <span className="font-semibold text-foreground">{firstName}</span>.
            </p>
          )}
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 text-left">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">Volvé a la app de Grupo TT.</span> Ya podés cerrar esta pestaña.
          </p>
        </div>
      </div>
    </div>
  );
}
