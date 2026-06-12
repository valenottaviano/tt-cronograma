import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { redirect } from "next/navigation";
import { getVideos, ApiError, Video } from "@/lib/coachApi";
import { getAthleteSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(iso))
    .toUpperCase();
}

export default async function VideosPage() {
  const session = await getAthleteSession();
  if (!session.token) redirect("/");

  let videos: Video[] = [];
  try {
    videos = await getVideos(session.token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await session.destroy();
      redirect("/");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24 space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href={`/schedule/${session.dni}`}
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver
          </Link>
          <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40">
            TRAINING TEAM · VIDEOS
          </p>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight">
            Videos de entrenamiento
          </h1>
          <p className="text-white/60 max-w-2xl">
            Recursos audiovisuales de Rober
          </p>
        </div>

        {/* Video list */}
        {videos.length === 0 ? (
          <div className="text-white/50 py-12 text-center">
            <Play className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p>Aún no hay videos disponibles.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((video) => (
              <article
                key={video.id}
                className="bg-neutral-900/90 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.4)] hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-5 p-5 md:p-7">
                  {/* Play icon */}
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-brand-orange/20 hover:bg-brand-orange/40 border border-brand-orange/30 flex items-center justify-center transition-colors group"
                    aria-label={`Ver ${video.title}`}
                  >
                    <Play className="w-5 h-5 text-brand-orange group-hover:scale-110 transition-transform" />
                  </a>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/30">
                      {formatDate(video.createdAt)}
                    </p>
                    <h2 className="text-base md:text-lg font-bold italic uppercase tracking-tight text-white leading-tight">
                      {video.title}
                    </h2>
                    {video.description && (
                      <p className="text-sm text-white/55 leading-relaxed line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 hidden sm:inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-white/70 hover:text-white hover:border-white/40 transition"
                  >
                    Ver video
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
