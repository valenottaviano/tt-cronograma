import Link from 'next/link';
import { CalendarSearch } from 'lucide-react';
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
            className="flex items-center gap-1.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <CalendarSearch className="h-3.5 w-3.5" />
            Calendario
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-4">
        <RacesSection />
      </main>
    </>
  );
}
