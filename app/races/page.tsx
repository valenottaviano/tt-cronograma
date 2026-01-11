import { getFirebaseRaces } from "@/lib/firebase/races";
import { RaceList } from "@/components/race-list";

export const revalidate = 0;

export default async function RacesPage() {
  const races = await getFirebaseRaces();

  return (
    <div className="min-h-screen bg-background font-sans pt-24">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Calendario de Carreras
        </h1>
        <RaceList races={races} />
      </main>
    </div>
  );
}
