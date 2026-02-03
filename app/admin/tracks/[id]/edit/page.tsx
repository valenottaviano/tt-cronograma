import { TrackForm } from '@/components/admin/track-form';
import { getFirebaseTrack } from '@/lib/firebase/tracks';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTrackPage({ params }: Props) {
  const { id } = await params;
  const track = await getFirebaseTrack(id);
  if (!track) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center text-white/60">
        Track no encontrado.
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      <TrackForm initialData={track} />
    </main>
  );
}
