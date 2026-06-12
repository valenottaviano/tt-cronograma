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
  let shouldLogout = false;
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
      shouldLogout = true;
    }
    // Other errors (5xx, network): show empty state
  }

  // redirect() must be called outside try/catch (Next.js throws NEXT_REDIRECT internally)
  if (shouldLogout) {
    redirect("/");
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
