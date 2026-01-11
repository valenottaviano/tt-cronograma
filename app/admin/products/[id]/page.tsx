'use client';

import { use, useState, useEffect } from 'react';
import { Product, getProduct } from '@/lib/firebase/products';
import { ProductForm } from '@/components/admin/product-form';
import { Loader2 } from 'lucide-react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await getProduct(id);
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Producto no encontrado</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">El producto que buscas no existe o ha sido eliminado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Producto</h1>
        <p className="text-gray-600 dark:text-gray-400">Actualiza la información de {product.name}.</p>
      </div>
      
      <ProductForm initialData={product} />
    </div>
  );
}
