import { getBenefits } from "@/lib/google-sheets";
import { BenefitList } from "@/components/benefit-list";

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
        <div className="flex flex-col gap-4 mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Beneficios Exclusivos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descuentos en marcas, gimnasios y servicios seleccionados
            especialmente para el equipo.
          </p>
        </div>

        <BenefitList benefits={benefits} />
      </main>
    </div>
  );
}
