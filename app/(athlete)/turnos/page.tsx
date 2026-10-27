import { AppHeader } from '@/components/app/app-header';
import { OfficeBooking, BackButton } from '@/components/app/office-booking';
import { getAppointments } from '@/lib/coachApi';
import { loadForAthlete, requireAthlete } from '@/lib/athlete-app';

/** Sacar turno en la oficina. Se llega desde el botón de ayuda. */
export default async function TurnosPage() {
  const session = await requireAthlete();
  const data = await loadForAthlete(() => getAppointments(session.token));

  return (
    <>
      <AppHeader title="Turnos" action={<BackButton />} />
      <main className="mx-auto w-full max-w-3xl px-4 py-5">
        <OfficeBooking initial={data} />
      </main>
    </>
  );
}
