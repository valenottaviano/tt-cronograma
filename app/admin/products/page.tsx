import { ProductList } from '@/components/admin/product-list';

export default function AdminProductsPage() {
  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Productos y Stock</h1>
        <p className="text-white/40 font-medium tracking-widest uppercase text-xs mt-1">Administración del catálogo oficial y niveles de inventario</p>
      </div>
      
      <ProductList />
    </div>
  );
}
