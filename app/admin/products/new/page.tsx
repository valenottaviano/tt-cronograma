import { ProductForm } from '@/components/admin/product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crear Nuevo Producto</h1>
        <p className="text-gray-600 dark:text-gray-400">Completa los datos para añadir una nueva prenda al inventario.</p>
      </div>
      
      <ProductForm />
    </div>
  );
}
