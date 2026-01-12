import { Hero } from "@/components/hero";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Store, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { getNews } from "@/lib/google-sheets";
import { NewsNotifier } from "@/components/news-notifier";


export default async function Home() {
  // const news = await getNews();

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* <NewsNotifier news={news} /> */}
      <Hero />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto space-y-32">
          {/* Main Navigation Sections */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-6 italic tracking-tight">EXPLORÁ TU POTENCIAL</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Descubrí todo lo que tenemos para vos como parte del Training Team.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <Link href="/races" className="block group">
                <Card className="h-full border-0 bg-white/5 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="relative z-10 p-8">
                    <div className="mb-6 w-14 h-14 rounded-2xl bg-brand-orange/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Calendar className="w-7 h-7 text-brand-orange" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2 italic">
                      CALENDARIO
                    </CardTitle>
                    <CardDescription className="text-lg text-white/60 leading-relaxed">
                      Accedé al cronograma oficial y planificá tus próximas
                      competencias con el equipo.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/benefits" className="block group relative">
                <Card className="h-full border-0 bg-white/5 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="relative z-10 p-8">
                    <div className="mb-6 w-14 h-14 rounded-2xl bg-brand-orange/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Store className="w-7 h-7 text-brand-orange" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2 italic">
                      BENEFICIOS
                    </CardTitle>
                    <CardDescription className="text-lg text-white/60 leading-relaxed">
                      Descuentos exclusivos en gimnasios, indumentaria y más.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
