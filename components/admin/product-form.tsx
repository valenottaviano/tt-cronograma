'use client';

import { useState, FormEvent, useRef } from 'react';
import { Product, ProductInput, createProduct, updateProduct } from '@/lib/firebase/products';
import { uploadProductImage } from '@/lib/firebase/storage';
import { Upload, X, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

interface ProductFormProps {
  initialData?: Product;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProductInput>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    price: initialData?.price || 0,
    sizes: initialData?.sizes || { 'M': 0 },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Size Handlers
  const handleSizeChange = (size: string, stock: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: Math.max(0, stock)
      }
    }));
  };

  const handleRenameSize = (oldSize: string, newSize: string) => {
    if (oldSize === newSize) return;
    if (formData.sizes[newSize] !== undefined) {
      toast.error('Este talle ya existe');
      return;
    }
    
    setFormData(prev => {
      const newSizes = { ...prev.sizes };
      newSizes[newSize] = newSizes[oldSize];
      delete newSizes[oldSize];
      return { ...prev, sizes: newSizes };
    });
  };

  const addSize = () => {
    const nextSize = SIZES.find(s => formData.sizes[s] === undefined) || 'Otro';
    handleSizeChange(nextSize, 0);
  };

  const removeSize = (size: string) => {
    if (Object.keys(formData.sizes).length <= 1) {
      toast.error('Debes tener al menos un talle');
      return;
    }
    const newSizes = { ...formData.sizes };
    delete newSizes[size];
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(formData.sizes).length === 0) {
      toast.error('Debes agregar al menos un talle');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile);
      }

      const productData = {
        ...formData,
        imageUrl: finalImageUrl,
      };

      if (initialData) {
        await updateProduct(initialData.id, productData);
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct(productData);
        toast.success('Producto creado correctamente');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto pb-20">
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 space-y-10 shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {initialData ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Configuración técnica del artículo</p>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            Foto del Producto
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div 
              className="relative w-48 h-48 rounded-[2rem] border-2 border-dashed border-white/10 bg-black/40 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-brand-orange/50 transition-all shadow-inner"
              onClick={() => !imagePreview && fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      className="p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-10 h-10 mx-auto text-white/10 mb-3 group-hover:text-brand-orange/50 transition-colors" />
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Subir Imagen</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02]"
              >
                {imagePreview ? 'Cambiar imagen' : 'Seleccionar archivo'}
              </button>
              <p className="text-[10px] font-bold text-white/20 leading-relaxed uppercase tracking-wider">
                PNG, JPG o WEBP.<br />Fondo neutro recomendado para la tienda.
              </p>
            </div>
          </div>
        </div>

        {/* Name & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-2">
            <label htmlFor="name" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              Nombre de la Prenda
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all font-bold italic text-lg tracking-tight"
              placeholder="Ej: MUSCULOSA MUJER (AZUL)"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              Precio (ARS)
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange font-black italic text-xl">$</span>
              <input
                id="price"
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full pl-10 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all font-black italic text-lg tracking-tight"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            Descripción / Detalles
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all resize-none font-medium text-sm leading-relaxed"
            placeholder="Materiales, tecnología de tela, calce..."
          />
        </div>

        {/* Sizes & Stocks */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-black text-white uppercase tracking-[0.3em]">
              Talles e Inventario
            </label>
            <button
              type="button"
              onClick={addSize}
              className="flex items-center gap-2 text-brand-orange hover:text-brand-orange/80 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir talle
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(formData.sizes)
              .sort(([a], [b]) => SIZES.indexOf(a) - SIZES.indexOf(b))
              .map(([size, stock]) => (
              <div key={size} className="flex gap-3 items-center bg-black/20 p-3 rounded-[1.25rem] border border-white/5 hover:border-white/10 transition-colors">
                <div className="w-24">
                  <select
                    value={size}
                    onChange={(e) => handleRenameSize(size, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white focus:ring-2 focus:ring-brand-orange/50 outline-none appearance-none"
                  >
                    {SIZES.map(s => (
                      <option key={s} value={s} disabled={formData.sizes[s] !== undefined && s !== size} className="bg-gray-900">
                        {s}
                      </option>
                    ))}
                    {!SIZES.includes(size) && <option value={size} className="bg-gray-900">{size}</option>}
                  </select>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => handleSizeChange(size, parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white outline-none focus:ring-1 focus:ring-brand-orange/30 transition-all text-center"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 uppercase tracking-tighter">unids.</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="p-2.5 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white hover:bg-white/5 transition-all text-center"
        >
          Descartar Cambios
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex items-center justify-center gap-3 bg-white text-black hover:bg-brand-orange hover:text-white px-16 py-5 rounded-3xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 font-black uppercase tracking-[0.2em] shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-orange to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-3">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {initialData ? 'Guardar Cambios' : 'Publicar Producto'}
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
