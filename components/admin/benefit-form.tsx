'use client';

import { useState, FormEvent, useRef } from 'react';
import { Benefit } from '@/lib/data';
import { BenefitInput, createBenefit, updateBenefit } from '@/lib/firebase/benefits';
import { uploadBenefitLogo } from '@/lib/firebase/storage';
import { Upload, X, Loader2, Save, Trash2, Instagram, MessageCircle, Link as LinkIcon, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

interface BenefitFormProps {
  initialData?: Benefit;
}

export function BenefitForm({ initialData }: BenefitFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<BenefitInput>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    company: initialData?.company || '',
    logo: initialData?.logo || '',
    linkCta: initialData?.linkCta || '',
    instagramLink: initialData?.instagramLink || '',
    whatsappLink: initialData?.whatsappLink || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.logo || '');
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
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalLogoUrl = formData.logo;

      if (imageFile) {
        finalLogoUrl = await uploadBenefitLogo(imageFile);
      }

      const benefitData = {
        ...formData,
        logo: finalLogoUrl,
      };

      if (initialData) {
        await updateBenefit(initialData.id, benefitData);
        toast.success('Beneficio actualizado correctamente');
      } else {
        await createBenefit(benefitData);
        toast.success('Beneficio creado correctamente');
      }

      router.push('/admin/benefits');
      router.refresh();
    } catch (error) {
      console.error('Error saving benefit:', error);
      toast.error('Error al guardar el beneficio');
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
              {initialData ? 'Editar Beneficio' : 'Nuevo Beneficio'}
            </h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Configuración del acuerdo comercial</p>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            Logo de la Empresa
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div 
              className="relative w-40 h-40 rounded-[2rem] border-2 border-dashed border-white/10 bg-black/40 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-brand-orange/50 transition-all shadow-inner"
              onClick={() => !imagePreview && fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain p-4"
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
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Subir Logo</span>
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
                {imagePreview ? 'Cambiar logo' : 'Seleccionar archivo'}
              </button>
              <p className="text-[10px] font-bold text-white/20 leading-relaxed uppercase tracking-wider">
                PNG o WEBP.<br />Se recomienda logo con fondo transparente.
              </p>
            </div>
          </div>
        </div>

        {/* Company & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="company" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              Nombre de la Empresa
            </label>
            <input
              id="company"
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all font-bold italic text-lg tracking-tight"
              placeholder="Ej: SPORTLINE"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              Título del Beneficio
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-brand-orange placeholder:text-brand-orange/20 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all font-black italic text-lg tracking-tight"
              placeholder="Ej: 20% DE DESCUENTO"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            Descripción / Condiciones
          </label>
          <textarea
            id="description"
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all resize-none font-medium text-sm leading-relaxed"
            placeholder="Detalla cómo aplicar el beneficio, exclusiones, etc."
          />
        </div>

        {/* Links */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <label className="block text-[10px] font-black text-white uppercase tracking-[0.3em]">
            Links y Redes Sociales
          </label>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                <Instagram className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={formData.instagramLink}
                onChange={(e) => setFormData({ ...formData, instagramLink: e.target.value })}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-pink-500/50 outline-none transition-all text-sm"
                placeholder="Instagram Link (opcional)"
              />
            </div>

            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                <MessageCircle className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={formData.whatsappLink}
                onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-green-500/50 outline-none transition-all text-sm"
                placeholder="WhatsApp Link (opcional)"
              />
            </div>

            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                <LinkIcon className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={formData.linkCta}
                onChange={(e) => setFormData({ ...formData, linkCta: e.target.value })}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm"
                placeholder="Website o Link Externo (opcional)"
              />
            </div>
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
                {initialData ? 'Guardar Cambios' : 'Publicar Beneficio'}
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
