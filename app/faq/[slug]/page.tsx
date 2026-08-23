import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { getAthleteSession } from "@/lib/session";
import { getArticle } from "@/lib/faq";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const session = await getAthleteSession();
  const article = getArticle(slug, !!session.token);
  if (!article) return { title: "Preguntas frecuentes | TT" };
  return {
    title: `${article.title} | TT`,
    description: article.description,
    // Los artículos internos no deberían terminar en un buscador.
    robots: article.audience === "athlete" ? { index: false, follow: false } : undefined,
  };
}

export default async function FaqArticlePage({ params }: Props) {
  const { slug } = await params;
  const session = await getAthleteSession();
  const isAthlete = !!session.token;

  // El filtrado también se aplica acá, no sólo en el listado: si no, bastaría
  // con adivinar la URL para leer un artículo interno.
  const article = getArticle(slug, isAthlete);
  if (!article) notFound();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/10 via-background to-background" />

      <div className="container mx-auto max-w-2xl px-4 relative z-10">
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 group">
            <Link href="/faq">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Todas las preguntas
            </Link>
          </Button>
        </div>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-widest text-brand-orange">
                {article.category}
              </span>
              {article.audience === "athlete" && (
                <span className="inline-flex items-center gap-1 text-xs text-white/40">
                  <Lock className="w-3 h-3" /> Sólo atletas
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold italic uppercase tracking-tight text-white leading-tight">
              {article.title}
            </h1>
            {article.updated && (
              <p className="text-sm text-white/35 mt-4">
                Actualizado el {formatDate(article.updated)}
              </p>
            )}
          </header>

          <div className="prose-tt">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>
        </article>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Button asChild variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">
            <Link href="/faq">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Todas las preguntas
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
