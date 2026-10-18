import { notFound } from 'next/navigation';
import { isValid } from 'date-fns';
import { DayPager } from '@/components/app/day-pager';
import { getSchedules } from '@/lib/coachApi';
import { loadForAthlete, requireAthlete } from '@/lib/athlete-app';
import { parseLocalDate } from '@/lib/athlete-days';

interface Props {
  params: Promise<{ fecha: string }>;
}

/** El detalle de un día de la planilla: todo lo que en la tarjeta queda plegado. */
export default async function DiaPage({ params }: Props) {
  const { fecha } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !isValid(parseLocalDate(fecha))) notFound();

  const session = await requireAthlete();
  const data = await loadForAthlete(() => getSchedules(session.token));
  return <DayPager schedules={data?.schedules ?? []} initialFecha={fecha} />;
}
