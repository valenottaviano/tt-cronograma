'use client';

import { use, useState, useEffect } from 'react';
import { Product, getProduct } from '@/lib/firebase/products';
import Image from 'next/image';
import { Package, ChevronLeft, ShoppingCart, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/components/navbar';
import { CheckoutModal } from '@/components/checkout-modal';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);


  useEffect(() => {
    async function loadProduct() {
      const data = await getProduct(id);
      setProduct(data);
      if (data) {
        // Auto-select first available size
        const firstAvailable = Object.entries(data.sizes).find(([_, stock]) => stock > 0);
        if (firstAvailable) setSelectedSize(firstAvailable[0]);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-white/20 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">Producto no encontrado</h1>
        <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const selectedStock = selectedSize ? product.sizes[selectedSize] || 0 : 0;
  const isOutOfStock = selectedStock <= 0;

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/#tienda" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Volver al catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl"
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10">
                <Package className="w-32 h-32" />
              </div>
            )}
          </motion.div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold tracking-widest uppercase rounded-full">
                    Indumentaria Oficial
                  </span>
                </div>
                <div className="text-3xl font-black text-brand-orange mt-4">
                  {formatPrice(product.price || 0)}
                </div>
              </div>

              <p className="text-lg text-white/60 leading-relaxed font-medium">
                {product.description}
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-white/40">Seleccionar talle</span>
                  {/* <Link href="/guide" className="text-xs text-blue-400 hover:text-blue-300 underline font-medium">
                    Guía de talles
                  </Link> */}
                </div>

                <div className="flex flex-wrap gap-3">
                  {Object.entries(product.sizes || {})
                    .sort(([a], [b]) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
                    .map(([size, stock]) => {
                    const available = (stock as number) > 0;
                    return (
                      <button
                        key={size}
                        disabled={!available}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "min-w-[60px] h-[50px] rounded-xl border-2 font-bold transition-all flex items-center justify-center relative overflow-hidden",
                          selectedSize === size
                            ? "bg-brand-orange border-brand-orange text-white shadow-xl shadow-brand-orange/20"
                            : available
                              ? "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                              : "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
                        )}
                      >
                        {size}
                        {!available && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[2px] bg-red-500/50 rotate-45" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isOutOfStock ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                    )}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider">
                        {isOutOfStock ? 'Sin disponibilidad' : 'Disponible en stock'}
                      </p>
                      {/* {!isOutOfStock && (
                        <p className="text-xs text-white/40 font-medium">
                          {selectedStock} unidades en talle {selectedSize}
                        </p>
                      )} */}
                    </div>
                  </div>
                </div>

                <button
                  disabled={isOutOfStock}
                  className={cn(
                    "w-full h-14 rounded-2xl text-base font-black italic tracking-widest uppercase transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-xl",
                    isOutOfStock
                      ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                      : "bg-gradient-to-r from-brand-orange to-brand-orange/80 text-white hover:from-brand-orange/90 hover:to-brand-orange/70 shadow-brand-orange/20"
                  )}
                  onClick={() => setShowCheckout(true)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isOutOfStock ? 'No disponible' : 'Comprar ahora'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-white/40">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-medium">Entrega en entrenamiento</span>
                </div>
                <div className="flex items-center gap-3 text-white/40">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-medium">Pagos en efectivo o trans.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showCheckout && selectedSize && product && (
          <CheckoutModal 
            product={product} 
            selectedSize={selectedSize} 
            onClose={() => setShowCheckout(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
