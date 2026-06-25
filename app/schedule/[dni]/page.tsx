import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getAthleteSession } from "@/lib/session";
import { getSchedules, getMe, getMonthStatus, Schedule, ApiError } from "@/lib/coachApi";
import { ScheduleView } from "@/components/schedule-view";
import { AutoRefresh } from "@/components/auto-refresh";

interface Props {
  params: Promise<{ dni: string }>;
}

export default async function SchedulePage({ params }: Props) {
  const { dni } = await params;
  const session = await getAthleteSession();

  if (!session.token || session.dni !== dni) {
    redirect("/");
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1–12

  let schedules: Schedule[] = [];
  let avatarKey: string | null = null;
  let owesCurrentMonth = false;
  let shouldLogout = false;
  try {
    const [data, profile, monthStatus] = await Promise.all([
      getSchedules(session.token),
      getMe(session.token),
      // If the payments API isn't reachable, don't block the schedule.
      getMonthStatus(year, month, session.token).catch(() => null),
    ]);
    schedules = data.schedules;
    avatarKey = profile.avatarKey;
    owesCurrentMonth = monthStatus ? !monthStatus.paid : false;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await session.destroy();
      shouldLogout = true;
    }
    // Other errors (5xx, network): show empty state
  }

  // redirect() must be called outside try/catch (Next.js throws NEXT_REDIRECT internally)
  if (shouldLogout) {
    redirect("/");
  }

  const monthLabel = format(now, "MMMM yyyy", { locale: es });

  return (
    <>
      <AutoRefresh />
      <ScheduleView
        schedules={schedules}
        athleteName={session.name}
        dni={dni}
        avatarKey={avatarKey}
        payment={owesCurrentMonth ? { year, month, monthLabel } : null}
      />
    </>
  );
}
