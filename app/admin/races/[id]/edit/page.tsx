import { RaceForm } from '@/components/admin/race-form';
import { getFirebaseRace } from '@/lib/firebase/races';
import { notFound } from 'next/navigation';

interface EditRacePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRacePage({ params }: EditRacePageProps) {
  const { id } = await params;
  const race = await getFirebaseRace(id);

  if (!race) {
    notFound();
  }

  return (
    <div className="space-y-10 pb-20">
      <RaceForm initialData={race} />
    </div>
  );
}
