import { AutoRefresh } from '@/components/auto-refresh';
import { AppMotion } from '@/components/app/app-motion';
import { TabBar } from '@/components/app/tab-bar';
import { requireAthlete } from '@/lib/athlete-app';

/**
 * La app del atleta: todo lo que cuelga de la barra de pestañas. Sin sesión,
 * vuelve al inicio público. Que el atleta logueado entre directo acá desde `/`
 * lo resuelve `app/page.tsx`.
 */
export default async function AthleteLayout({ children }: { children: React.ReactNode }) {
  await requireAthlete();
  return (
    <AppMotion>
      <div className="min-h-dvh bg-background pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <AutoRefresh />
        {children}
        <TabBar />
      </div>
    </AppMotion>
  );
}
