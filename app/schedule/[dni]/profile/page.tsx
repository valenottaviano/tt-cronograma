import { redirect } from "next/navigation";
import { getAthleteSession } from "@/lib/session";
import { getMe } from "@/lib/coachApi";
import { ProfileView } from "@/components/profile-view";

interface Props {
  params: Promise<{ dni: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { dni } = await params;
  const session = await getAthleteSession();

  if (!session.token || session.dni !== dni) {
    redirect("/");
  }

  let profile = null;
  try {
    profile = await getMe(session.token);
  } catch {
    // show empty state in client component
  }

  return <ProfileView initialProfile={profile} dni={dni} />;
}
