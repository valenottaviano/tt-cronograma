'use client';

import { Product } from '@/lib/firebase/products';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatPrice } from '@/components/navbar';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Calculate total stock across all sizes
  const sizes = product.sizes || {};
  const totalStock = Object.values(sizes).reduce((acc, stock) => acc + (stock as number), 0);
  const isOutOfStock = totalStock <= 0;
  
  // Get available sizes for display
  const availableSizes = Object.entries(sizes)
    .filter(([_, stock]) => (stock as number) > 0)
    .map(([size]) => size)
    .sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card className="overflow-hidden border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] shadow-2xl py-0 flex flex-col gap-0 border-white/10">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-500 group-hover:scale-110",
                isOutOfStock && "grayscale opacity-50"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-12 h-12" />
            </div>
          )}
          
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
              <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Sin Stock
              </span>
            </div>
          )}
          
          {!isOutOfStock && totalStock <= 5 && (
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">
                Últimas unidades
              </span>
            </div>
          )}

          <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end max-w-[120px]">
            {availableSizes.slice(0, 3).map(size => (
              <span key={size} className="bg-white/10 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20">
                {size}
              </span>
            ))}
            {availableSizes.length > 3 && (
              <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20">
                +{availableSizes.length - 3}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 bg-brand-orange/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-black italic shadow-xl">
            {formatPrice(product.price || 0)}
          </div>
        </div>

        <CardContent className="p-5">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-orange transition-colors italic tracking-tight">
            {product.name}
          </h3>
          <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </CardContent>

        <CardFooter className="px-5 pb-5 pt-0 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Talles</span>
            <span className={cn(
              "text-sm font-bold",
              isOutOfStock ? "text-red-400" : "text-white/80"
            )}>
              {isOutOfStock ? 'No disponible' : availableSizes.join(', ')}
            </span>
          </div>
          
          <div className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all transform group-hover:bg-brand-orange group-active:scale-95 shadow-lg",
              isOutOfStock 
                ? "bg-white/5 text-white/20" 
                : "bg-white/10 text-white"
            )}>
            Ver más
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
