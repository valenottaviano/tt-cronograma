import { getBenefits } from "@/lib/google-sheets";
import { BenefitList } from "@/components/benefit-list";
import { TTCCredencialDialog } from "@/components/tt-credencial-dialog";
import { AlertCircle } from "lucide-react";

export const revalidate = 0;

export const metadata = {
  title: "Beneficios | TT Cronograma",
  description: "Descuentos y beneficios exclusivos para corredores.",
};

export default async function BenefitsPage() {
  const benefits = await getBenefits();

  return (
    <div className="min-h-screen bg-background font-sans pt-24">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 mb-8 text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Beneficios Exclusivos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descuentos en marcas, gimnasios y servicios seleccionados
            especialmente para el equipo.
          </p>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl max-w-2xl mx-auto flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Recordatorio importante</span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Para acceder a estos beneficios, debés presentar tu{" "}
              <span className="font-bold text-foreground">credencial de TT activa</span> al momento de la compra o reserva.
            </p>
            <TTCCredencialDialog />
          </div>
        </div>

        <BenefitList benefits={benefits} />
      </main>
    </div>
  );
}
