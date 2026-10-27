import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProfileMenu } from '@/components/app/profile-menu';
import { ProfileView } from '@/components/profile-view';
import { TrainingPrefs } from '@/components/app/training-prefs';
import { GarminFlash } from '@/components/garmin/garmin-flash';
import { GarminProfileRow } from '@/components/garmin/garmin-profile-row';
import { StravaProfileRow } from '@/components/strava/strava-profile-row';
import { getGarmin, getMe, getMonthStatus, getStrava } from '@/lib/coachApi';
import { loadForAthlete, requireAthlete } from '@/lib/athlete-app';

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ garmin?: string }> }) {
  const { garmin: garminResult } = await searchParams;
  const session = await requireAthlete();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const data = await loadForAthlete(() =>
    Promise.all([
      getMe(session.token),
      // Si la API de pagos no responde, el perfil igual se muestra (sin la fila de la cuota).
      getMonthStatus(year, month, session.token).catch(() => null),
      getStrava(session.token).catch(() => null),
      getGarmin(session.token).catch(() => null),
    ]),
  );
  const [profile, monthStatus, strava, garmin] = data ?? [null, null, null, null];
  const linkedApps = Boolean(strava?.enabled || garmin?.enabled);

  return (
    <ProfileView initialProfile={profile} dni={session.dni}>
      <ProfileMenu
        dni={session.dni}
        payment={
          monthStatus
            ? { year, month, monthLabel: format(now, 'MMMM yyyy', { locale: es }), paid: monthStatus.paid }
            : null
        }
      />
      {profile && <TrainingPrefs hasGym={profile.hasGym} hasBike={profile.hasBike} />}
      {linkedApps && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Apps vinculadas</h2>
          {strava?.enabled && <StravaProfileRow connected={strava.connected} />}
          {garmin?.enabled && <GarminProfileRow connected={garmin.connected} canSend={garmin.canSend} />}
        </section>
      )}
      <GarminFlash result={garminResult} />
    </ProfileView>
  );
}
