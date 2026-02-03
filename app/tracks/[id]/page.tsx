import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFirebaseTrack } from '@/lib/firebase/tracks';
import { TrackPreview } from '@/components/tracks/track-preview';

export const dynamic = 'force-dynamic';

interface TrackDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
  const { id } = await params;
  const track = await getFirebaseTrack(id);

  if (!track) {
    notFound();
  }

  const difficultyMeta = {
    easy: {
      badge: 'border-emerald-400/40 text-emerald-200 bg-emerald-500/10',
      label: 'Fácil',
      copy: 'Circuitos fluidos para sumar volumen con confianza.',
    },
    medium: {
      badge: 'border-amber-400/40 text-amber-200 bg-amber-500/10',
      label: 'Media',
      copy: 'Terreno mixto con cambios de ritmo controlados.',
    },
    hard: {
      badge: 'border-rose-400/40 text-rose-200 bg-rose-500/10',
      label: 'Alta',
      copy: 'Secciones técnicas y rampas para esfuerzos largos.',
    },
  }[track.difficulty];

  const createdAt = track.createdAt ? new Date(track.createdAt) : null;
  const formattedDate = createdAt
    ? new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(createdAt)
    : 'Lanzamiento reciente';

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-12">
        <div className="space-y-6">
          <Link
            href="/tracks"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.35em] text-white/50 hover:text-white"
          >
            ← Volver a tracks
          </Link>
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[11px] font-black uppercase tracking-[0.35em] text-white/80">
              GPX exclusivo TT · {formattedDate.toUpperCase()}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight text-white">
                {track.title}
              </h1>
              <span className={`rounded-full border px-4 py-1 text-[10px] font-black uppercase tracking-[0.35em] ${difficultyMeta.badge}`}>
                {difficultyMeta.label}
              </span>
            </div>
            <p className="max-w-3xl text-lg md:text-xl text-white/70 leading-relaxed">
              {track.description}
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <TrackPreview
            fileUrl={track.fileUrl}
            distanceKm={track.distanceKm}
            elevationGain={track.elevationGain}
            variant="panel"
          />

          <div className="space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-6 md:p-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Datos principales</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.3em]">Distancia</p>
                  <p className="text-3xl font-black text-white">
                    {track.distanceKm ? `${track.distanceKm} km` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.3em]">Desnivel +</p>
                  <p className="text-3xl font-black text-white">
                    {typeof track.elevationGain === 'number' ? `${track.elevationGain} m` : '—'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Acciones</p>
              <div className="space-y-3">
                <a
                  href={track.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 rounded-full bg-white px-8 py-3 text-[11px] font-black uppercase tracking-[0.35em] text-black hover:bg-brand-orange hover:text-white transition"
                >
                  Descargar GPX
                </a>
              </div>
            </div>

            <div className="space-y-2 text-sm text-white/60">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Consejos TT</p>
              <ul className="space-y-2 text-white/70">
                <li>· Revisá el clima antes de salir.</li>
                <li>· Llevá agua suficiente y un tracker.</li>
                <li>· Compartí tu recorrido con tu coach.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
