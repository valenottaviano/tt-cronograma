'use client';

import { useState, FormEvent, useRef } from 'react';
import { Race } from '@/lib/data';
import { RaceInput, createRace, updateRace } from '@/lib/firebase/races';
// I'll reuse the uploadBenefitLogo logic but rename it to be more generic if needed
// or just create a new generic one in storage.ts
import { uploadBenefitLogo as uploadRaceImage } from '@/lib/firebase/storage';
import { Upload, X, Loader2, Save, Trash2, Calendar, MapPin, Award, ExternalLink, Info, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RaceFormProps {
  initialData?: Race;
}

export function RaceForm({ initialData }: RaceFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<RaceInput>({
    name: initialData?.name || '',
    date: initialData?.date || '',
    location: initialData?.location || '',
    province: initialData?.province || '',
    distance: initialData?.distance || '',
    type: initialData?.type || 'trail',
    url: initialData?.url || '',
    discountCode: initialData?.discountCode || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || '');
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
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.image;

      if (imageFile) {
        // Reuse uploadBenefitLogo since it follows the same logic (upload to firebase storage)
        finalImageUrl = await uploadRaceImage(imageFile);
      }

      const raceData = {
        ...formData,
        image: finalImageUrl,
      };

      if (initialData) {
        await updateRace(initialData.id, raceData);
        toast.success('Carrera actualizada correctamente');
      } else {
        await createRace(raceData);
        toast.success('Carrera creada correctamente');
      }

      router.push('/admin/races');
      router.refresh();
    } catch (error) {
      console.error('Error saving race:', error);
      toast.error('Error al guardar la carrera');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto pb-20">
      <div className="bg-neutral-900 rounded-2xl md:rounded-[2.5rem] border border-neutral-700 p-6 md:p-10 space-y-8 md:space-y-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 border-b border-white/5 pb-6 md:pb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">
              {initialData ? 'Editar Carrera' : 'Nueva Carrera'}
            </h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Configuración del evento y detalles logísticos</p>
          </div>
          <div className="flex gap-2">
            <button
               type="button"
               onClick={() => setFormData({...formData, type: 'trail'})}
               className={cn(
                 "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                 formData.type === 'trail' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-white/40 hover:bg-white/10"
               )}
            >
               Trail
            </button>
            <button
               type="button"
               onClick={() => setFormData({...formData, type: 'road'})}
               className={cn(
                 "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                 formData.type === 'road' ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "bg-white/5 text-white/40 hover:bg-white/10"
               )}
            >
               Calle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left Column: Image */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              Flyer / Imagen del Evento
            </label>
            <div 
              className="relative aspect-[3/4] w-full rounded-[2rem] border-2 border-dashed border-white/10 bg-black/40 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all shadow-inner"
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
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                  <Upload className="w-10 h-10 mx-auto text-white/10 mb-3 group-hover:text-blue-500/50 transition-colors" />
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Subir Imagen</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Right Columns: Main Fields */}
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                Nombre de la Carrera
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-black italic text-xl tracking-tight"
                placeholder="Ej: CRUCE TANDILIA"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label htmlFor="date" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                  Fecha
                </label>
                <div className="relative">
                   <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                   <input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold"
                  />
                </div>
              </div>

               <div className="space-y-2">
                  <label htmlFor="distance" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                    Distancias (separadas por coma)
                  </label>
                  <div className="relative">
                    <Award className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      id="distance"
                      type="text"
                      required
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold"
                      placeholder="Ej: 5K, 10K, 21K"
                    />
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label htmlFor="location" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                  Localidad
                </label>
                <div className="relative">
                   <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                   <input
                    id="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold"
                    placeholder="Ej: Villa La Angostura"
                  />
                </div>
              </div>

               <div className="space-y-2">
                  <label htmlFor="province" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                    Provincia
                  </label>
                  <div className="relative">
                    <Map className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      id="province"
                      type="text"
                      required
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold"
                      placeholder="Ej: Neuquén"
                    />
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Description & Links */}
        <div className="space-y-8 pt-8 border-t border-white/5">
           <div className="space-y-2">
            <label htmlFor="description" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              Información Adicional (opcional)
            </label>
            <div className="relative">
              <Info className="absolute left-6 top-5 w-4 h-4 text-white/20" />
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none font-medium text-sm leading-relaxed"
                placeholder="Detalles sobre acreditación, charlas técnicas, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="url" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                Link Web / Inscripción
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="discountCode" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                Código de Descuento (opcional)
              </label>
              <div className="relative">
                <Award className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  id="discountCode"
                  type="text"
                  value={formData.discountCode}
                  onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-2 focus:ring-green-500/50 outline-none transition-all font-black"
                  placeholder="Ej: TEAMTTCRONO"
                />
              </div>
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
          className="group relative flex items-center justify-center gap-3 bg-white text-black hover:bg-blue-600 hover:text-white px-16 py-5 rounded-3xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 font-black uppercase tracking-[0.2em] shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-3">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {initialData ? 'Guardar Cambios' : 'Publicar Carrera'}
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
