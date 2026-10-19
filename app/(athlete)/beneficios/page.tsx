import { QrCode } from 'lucide-react';
import { AppHeader } from '@/components/app/app-header';
import { BenefitList } from '@/components/benefit-list';
import { TTCCredencialDialog } from '@/components/tt-credencial-dialog';
import { getBenefits } from '@/lib/coachApi';
import { requireAthlete } from '@/lib/athlete-app';

/** Los beneficios de los comercios, dentro de la app: con la credencial a un toque para mostrarla. */
export default async function BeneficiosPage() {
  const session = await requireAthlete();
  const benefits = await getBenefits();

  return (
    <>
      <AppHeader
        title="Beneficios"
        action={
          <TTCCredencialDialog
            dni={session.dni}
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold hover:border-brand-orange"
              >
                <QrCode className="h-3.5 w-3.5" />
                Mi credencial
              </button>
            }
          />
        }
      />
      <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-4">
        <p className="text-sm text-muted-foreground">
          Mostrá tu <span className="font-semibold text-foreground">credencial TT</span> al pagar o
          reservar para acceder al descuento.
        </p>
        <BenefitList benefits={benefits} />
      </main>
    </>
  );
}
