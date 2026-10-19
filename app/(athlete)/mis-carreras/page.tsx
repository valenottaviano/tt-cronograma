import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { AppHeader } from '@/components/app/app-header';
import { RacesSection } from '@/components/races-section';

export default function MisCarrerasPage() {
  return (
    <>
      <AppHeader
        title="Carreras"
        action={
          <Link
            href="/races"
            className="flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-black uppercase italic text-black shadow-[0_0_18px_rgba(250,204,21,0.35)] transition-transform hover:bg-yellow-300 active:scale-95"
          >
            <Ticket className="h-3.5 w-3.5" />
            Descuentos
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-4">
        <RacesSection />
      </main>
    </>
  );
}
