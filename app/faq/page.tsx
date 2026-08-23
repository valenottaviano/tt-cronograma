import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAthleteSession } from "@/lib/session";
import { getArticles, groupByCategory } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | TT",
  description:
    "Todo lo que suelen preguntarnos sobre entrenar con el Training Team: cuota, entrenamientos, competencias y más.",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  searchParams: Promise<{ from?: string }>;
}

export default async function FaqPage({ searchParams }: Props) {
  // Con sesión de atleta se suman los artículos internos. Un visitante no los
  // ve ni sabe que existen.
  const session = await getAthleteSession();
  const isAthlete = !!session.token;
  const groups = groupByCategory(getArticles(isAthlete));

  // De dónde vino, no quién es. Tener sesión de atleta no significa haber
  // llegado desde la planilla: se puede estar navegando el sitio público con la
  // sesión abierta, y ahí "volver" tiene que devolver al inicio.
  const { from } = await searchParams;
  const desdeLaPlanilla = from === "planilla" && isAthlete;
  const volverA = desdeLaPlanilla ? `/schedule/${session.dni}` : "/";
  const volverLabel = desdeLaPlanilla ? "Volver a mi planilla" : "Volver al inicio";
  // El origen se propaga al artículo para que su "volver" también sea correcto.
  const query = desdeLaPlanilla ? "?from=planilla" : "";

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/10 via-background to-background" />

      <div className="container mx-auto max-w-3xl px-4 relative z-10">
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 group">
            <Link href={volverA}>
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {volverLabel}
            </Link>
          </Button>
        </div>

        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold italic uppercase tracking-tight text-white mb-4">
            Preguntas frecuentes
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Lo que más nos consultan, respondido con calma.
          </p>
        </header>

        {groups.length === 0 ? (
          <p className="text-center text-white/50">Todavía no hay preguntas publicadas.</p>
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.category}>
                <h2 className="text-xs uppercase tracking-widest text-brand-orange mb-4">
                  {group.category}
                </h2>
                <ul className="space-y-3">
                  {group.articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/faq/${article.slug}${query}`}
                        className="glass-panel block rounded-2xl p-6 group hover:bg-neutral-800 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-brand-orange transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-white/60 leading-relaxed">{article.description}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-white/35">
                              {article.updated && <span>Actualizado el {formatDate(article.updated)}</span>}
                              {article.audience === "athlete" && (
                                <span className="inline-flex items-center gap-1 text-white/50">
                                  <Lock className="w-3 h-3" /> Sólo atletas
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-white/25 shrink-0 mt-1 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {!isAthlete && (
          <p className="text-center text-white/40 text-sm mt-12">
            Si ya entrenás con nosotros, iniciá sesión para ver también las preguntas del equipo.
          </p>
        )}
      </div>
    </div>
  );
}
