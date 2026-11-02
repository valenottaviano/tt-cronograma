import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProfileMenu } from '@/components/app/profile-menu';
import { RefreshOnReturn } from '@/components/app/refresh-on-return';
import { ProfileView } from '@/components/profile-view';
import { TrainingPrefs } from '@/components/app/training-prefs';
import { LinkedAppFlash } from '@/components/app/linked-app-flash';
import { CorosProfileRow } from '@/components/coros/coros-profile-row';
import { GarminProfileRow } from '@/components/garmin/garmin-profile-row';
import { StravaProfileRow } from '@/components/strava/strava-profile-row';
import { getCoros, getGarmin, getMe, getMonthStatus, getStrava } from '@/lib/coachApi';
import { loadForAthlete, requireAthlete } from '@/lib/athlete-app';

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ garmin?: string; coros?: string }> }) {
  const { garmin: garminResult, coros: corosResult } = await searchParams;
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
      getCoros(session.token).catch(() => null),
    ]),
  );
  const [profile, monthStatus, strava, garmin, coros] = data ?? [null, null, null, null, null];
  const linkedApps = Boolean(strava?.enabled || garmin?.enabled || coros?.enabled);

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
          {coros?.enabled && <CorosProfileRow connected={coros.connected} />}
        </section>
      )}
      <LinkedAppFlash app="garmin" result={garminResult} />
      <LinkedAppFlash app="coros" result={corosResult} />
      {linkedApps && <RefreshOnReturn />}
    </ProfileView>
  );
}
