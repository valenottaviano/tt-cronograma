import Link from 'next/link';
import { getFirebaseTracks } from '@/lib/firebase/tracks';
import { TrackPreview } from '@/components/tracks/track-preview';

const difficultyConfig = {
  easy: {
    label: 'Fácil',
    badge: 'border-emerald-400/40 text-emerald-200 bg-emerald-500/10',
    copy: 'Ideal para iniciarse en trail o para rodajes regenerativos.',
  },
  medium: {
    label: 'Media',
    badge: 'border-amber-400/40 text-amber-200 bg-amber-500/10',
    copy: 'Exigencia moderada, buen ritmo y desnivel controlado.',
  },
  hard: {
    label: 'Alta',
    badge: 'border-rose-400/40 text-rose-200 bg-rose-500/10',
    copy: 'Recorrido técnico con desnivel pronunciado.',
  },
} as const;

export default async function TracksPage() {
  const tracks = await getFirebaseTracks();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 space-y-10">
        <div className="space-y-3">
          <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40">
            GPX / TT TRACKS
          </p>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight">
            Descargá circuitos TT
          </h1>
          <p className="text-white/60 max-w-2xl">
            Recorridos curados por el cuerpo técnico TT para entrenar trail y calle donde quieras.
          </p>
        </div>

        {tracks.length === 0 ? (
          <div className="text-white/60">Aún no hay circuitos disponibles.</div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {tracks.map((track) => {
              const trackDate = track.createdAt ?? track.updatedAt;
              const dateLabel = trackDate
                ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' })
                    .format(new Date(trackDate))
                    .toUpperCase()
                : 'NUEVO';

              return (
                <article
                  key={track.id}
                  className="bg-neutral-900/90 border border-white/5 rounded-[1.75rem] md:rounded-[2.75rem] overflow-hidden shadow-[0_10px_80px_rgba(0,0,0,0.55)]"
                >
                <div className="flex flex-col gap-6 md:gap-8 md:flex-row">
                  <div className="flex-1 px-5 py-6 md:p-10 space-y-5 md:space-y-6">
                    <div className="flex flex-wrap gap-2 items-center text-[9px] font-black uppercase tracking-[0.4em] text-white/50">
                      <span>GPX · TT</span>
                      <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
                      <span>{dateLabel}</span>
                    </div>
                    <div className="space-y-3">
                      <p
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] ${difficultyConfig[track.difficulty].badge}`}
                      >
                        {difficultyConfig[track.difficulty].label}
                      </p>
                      <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-white">
                        {track.title}
                      </h2>
                      <p className="text-white/70 leading-relaxed text-sm md:text-lg">
                        {track.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm md:grid md:grid-cols-2">
                      <div className="flex-1 min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-[9px] uppercase tracking-[0.35em] text-white/40">Distancia</p>
                        <p className="text-xl md:text-2xl font-black text-white">
                          {track.distanceKm ? `${track.distanceKm} km` : '—'}
                        </p>
                      </div>
                      <div className="flex-1 min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-[9px] uppercase tracking-[0.35em] text-white/40">Desnivel +</p>
                        <p className="text-xl md:text-2xl font-black text-white">
                          {typeof track.elevationGain === 'number' ? `${track.elevationGain} m` : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/tracks/${track.id}`}
                        className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-black hover:bg-brand-orange hover:text-white transition"
                      >
                        Ver detalle
                      </Link>
                      <a
                        href={track.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/80 hover:text-white"
                      >
                        Descargar GPX
                      </a>
                    </div>
                  </div>
                  <div className="md:w-[45%] px-5 pb-6 md:py-10 md:pr-10">
                    {track.fileUrl ? (
                      <TrackPreview
                        fileUrl={track.fileUrl}
                        distanceKm={track.distanceKm}
                        elevationGain={track.elevationGain}
                        variant="card"
                      />
                    ) : (
                      <div className="rounded-[1.5rem] md:rounded-[2rem] border border-white/10 p-6 text-white/60 text-sm">
                        Aún no hay archivo GPX adjunto.
                      </div>
                    )}
                  </div>
                </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
