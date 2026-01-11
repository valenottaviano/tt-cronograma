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
import { ProductCatalog } from "@/components/product-catalog";

export default async function Home() {
  const news = await getNews();

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

          {/* Product Catalog Section */}
          <section id="tienda" className="space-y-16">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold tracking-widest uppercase mb-2">
                <ShoppingBag className="w-3 h-3" />
                Indumentaria Oficial
              </div>
              <h2 className="text-5xl font-black italic tracking-tighter">CATÁLOGO TT</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Equipamiento de alta performance diseñado para el Training Team.
              </p>
            </div>
            
            <ProductCatalog />
          </section>
        </div>
      </main>
    </div>
  );
}
