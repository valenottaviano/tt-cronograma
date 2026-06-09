import { redirect } from "next/navigation";
import { getAthleteSession } from "@/lib/session";
import { getSchedules, getMe, Schedule, ApiError } from "@/lib/coachApi";
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

  let schedules: Schedule[] = [];
  let avatarKey: string | null = null;
  try {
    const [data, profile] = await Promise.all([
      getSchedules(session.token),
      getMe(session.token),
    ]);
    schedules = data.schedules;
    avatarKey = profile.avatarKey;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await session.destroy();
      redirect("/");
    }
    // Other errors (5xx, network): show empty state
  }

  return (
    <>
      <AutoRefresh />
      <ScheduleView
        schedules={schedules}
        athleteName={session.name}
        dni={dni}
        avatarKey={avatarKey}
      />
    </>
  );
}
