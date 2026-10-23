import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProfileMenu } from '@/components/app/profile-menu';
import { ProfileView } from '@/components/profile-view';
import { TrainingPrefs } from '@/components/app/training-prefs';
import { StravaProfileRow } from '@/components/strava/strava-profile-row';
import { getMe, getMonthStatus, getStrava } from '@/lib/coachApi';
import { loadForAthlete, requireAthlete } from '@/lib/athlete-app';

export default async function PerfilPage() {
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
    ]),
  );
  const [profile, monthStatus, strava] = data ?? [null, null, null];

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
      {strava?.enabled && <StravaProfileRow connected={strava.connected} />}
    </ProfileView>
  );
}
