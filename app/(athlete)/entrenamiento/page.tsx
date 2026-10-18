import { ScheduleView } from '@/components/schedule-view';
import { getSchedules } from '@/lib/coachApi';
import { loadForAthlete, requireAthlete } from '@/lib/athlete-app';

export default async function EntrenamientoPage() {
  const session = await requireAthlete();
  const data = await loadForAthlete(() => getSchedules(session.token));
  return <ScheduleView schedules={data?.schedules ?? []} athleteName={session.name} />;
}
