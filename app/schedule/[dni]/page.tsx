import { redirect } from "next/navigation";
import { getAthleteSession } from "@/lib/session";
import { getSchedules, Schedule } from "@/lib/coachApi";
import { ScheduleView } from "@/components/schedule-view";

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
  try {
    const data = await getSchedules(session.token);
    schedules = data.schedules;
  } catch {
    await session.destroy();
    redirect("/");
  }

  return (
    <ScheduleView
      schedules={schedules}
      athleteName={session.name}
      dni={dni}
    />
  );
}
