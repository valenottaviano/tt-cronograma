import { Hero } from "@/components/hero";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Store } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Hero />
      <main className="container mx-auto px-4 py-16">
        <section className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Beneficios Exclusivos</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Descubrí todo lo que tenemos para vos como parte del Training Team.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/races" className="block group">
              <Card className="h-full border-0 bg-white/5 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 p-8">
                  <div className="mb-6 w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Calendar className="w-7 h-7 text-blue-400" />
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2">
                    Calendario
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
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 p-8">
                  <div className="mb-6 w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Store className="w-7 h-7 text-purple-400" />
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2">
                    Beneficios
                  </CardTitle>
                  <CardDescription className="text-lg text-white/60 leading-relaxed">
                    Descuentos exclusivos en gimnasios, indumentaria y más.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
