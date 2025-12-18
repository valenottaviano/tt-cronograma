import { getRaces } from "@/lib/google-sheets";
import { Hero } from "@/components/hero";
import { RaceList } from "@/components/race-list";

// Cambiamos de 3600 a 0 para que no guarde caché y veas los cambios al recargar.
// Cuando la web esté terminada y en producción, podemos ponerlo en 60 o 300.
export const revalidate = 0;

export default async function Home() {
  const races = await getRaces();

  return (
    <div className="min-h-screen bg-background font-sans">
      <Hero />
      <main className="container mx-auto px-4 py-8">
        <RaceList races={races} />
      </main>
    </div>
  );
}
