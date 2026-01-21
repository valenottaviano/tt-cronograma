'use client';

import { useState, useEffect } from 'react';
import { Product, getProducts, deleteProduct } from '@/lib/firebase/products';
import { deleteProductImage } from '@/lib/firebase/storage';
import { Edit2, Trash2, Plus, Package, Layers } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/components/navbar';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      return;
    }

    try {
      await deleteProduct(product.id);
      if (product.imageUrl) {
        await deleteProductImage(product.imageUrl);
      }
      toast.success('Producto eliminado correctamente');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white italic uppercase tracking-tighter leading-none">Inventario de Ropa</h2>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Total: {products.length} artículos</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white px-4 md:px-6 py-3 rounded-xl md:rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-orange/20 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-neutral-900 rounded-2xl md:rounded-3xl border border-neutral-700 border-dashed p-10 md:p-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full mb-4 md:mb-6">
            <Package className="w-8 h-8 md:w-10 md:h-10 text-white/20" />
          </div>
          <p className="text-white/20 font-black uppercase tracking-[0.2em] text-sm">No hay productos registrados aún</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {products.map((product) => {
              const sizes = product.sizes || {};
              const totalStock = Object.values(sizes).reduce((a, b) => a + (b as number), 0);
              
              return (
                <div key={product.id} className="bg-neutral-900 rounded-2xl border border-neutral-700 overflow-hidden">
                  <div className="p-4 space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 m-5 text-white/10" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base text-white italic uppercase tracking-tighter leading-tight truncate">{product.name}</p>
                        <p className="text-[10px] font-bold text-white/30 truncate mt-1">{product.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="font-black text-lg text-brand-orange italic tracking-tighter">
                            {formatPrice(product.price || 0)}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              totalStock > 10 ? 'bg-green-500' : totalStock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                            )} />
                            <span className="text-[10px] font-bold text-white/60 uppercase">{totalStock} unids</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(sizes)
                        .sort(([a], [b]) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
                        .map(([size, stock]) => (
                        <div 
                          key={size}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black border uppercase",
                            (stock as number) > 0 
                              ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                              : "bg-white/2 text-white/20 border-white/5"
                          )}
                        >
                          <span>{size}:</span>
                          <span className={cn((stock as number) > 0 && "text-white")}>{stock}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/10 text-[10px] font-bold uppercase"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/10 text-[10px] font-bold uppercase"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-neutral-900 rounded-3xl border border-neutral-700 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Producto</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Variantes (Talles)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Precio</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Stock Total</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => {
                    const sizes = product.sizes || {};
                    const totalStock = Object.values(sizes).reduce((a, b) => a + (b as number), 0);
                    
                    return (
                      <tr key={product.id} className="group hover:bg-white/[0.04] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-6">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10 group-hover:border-brand-orange/30 transition-colors">
                              {product.imageUrl ? (
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <Package className="w-6 h-6 m-4 text-white/10" />
                              )}
                            </div>
                            <div className="max-w-md">
                              <p className="font-black text-lg text-white italic uppercase tracking-tighter leading-tight">{product.name}</p>
                              <p className="text-[10px] font-bold text-white/30 truncate mt-1 tracking-wider">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(sizes)
                              .sort(([a], [b]) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
                              .map(([size, stock]) => (
                              <div 
                                key={size}
                                className={cn(
                                  "flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase tracking-wider",
                                  (stock as number) > 0 
                                    ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                                    : "bg-white/2 text-white/20 border-white/5"
                                )}
                              >
                                <span>{size}:</span>
                                <span className={cn((stock as number) > 0 && "text-white")}>{stock}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-black text-lg text-white italic tracking-tighter">
                            {formatPrice(product.price || 0)}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                              totalStock > 10 ? 'bg-green-500' : totalStock > 0 ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-red-500 shadow-red-500/50'
                            )} />
                            <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                              {totalStock} <span className="text-[10px]">unidades</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/5 hover:border-white/20"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5 hover:border-red-500/20"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

