import { ProductCatalog } from "@/components/product-catalog";
import { ShoppingBag } from "lucide-react";

export default function StorePage() {
  return (
    <main className="container mx-auto px-4 py-32">
      <div className="max-w-7xl mx-auto space-y-16">
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
  );
}
