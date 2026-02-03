'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Upload, Save } from 'lucide-react';
import { Track, TrackDifficulty } from '@/lib/data';
import { TrackInput, createTrack, updateTrack } from '@/lib/firebase/tracks';
import { uploadTrackFile } from '@/lib/firebase/storage';
import { cn } from '@/lib/utils';
import { parseGpxFile, type TrackStats } from '@/lib/gpx';

const difficultyLabels: Record<TrackDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Alta',
};

interface TrackFormProps {
  initialData?: Track;
}

export function TrackForm({ initialData }: TrackFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsingGpx, setIsParsingGpx] = useState(false);
  const [autoStats, setAutoStats] = useState<TrackStats | null>(null);
  const [parseMessage, setParseMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<TrackInput>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    difficulty: initialData?.difficulty ?? 'medium',
    fileUrl: initialData?.fileUrl ?? '',
    filePath: initialData?.filePath ?? '',
    distanceKm: initialData?.distanceKm,
    elevationGain: initialData?.elevationGain,
  });

  const [distanceOverride, setDistanceOverride] = useState<string>(
    initialData?.distanceKm ? String(initialData.distanceKm) : ''
  );
  const [elevationOverride, setElevationOverride] = useState<string>(
    initialData?.elevationGain ? String(initialData.elevationGain) : ''
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setParseMessage(null);
    setAutoStats(null);
    if (!nextFile) {
      setFormData((prev) => ({ ...prev, fileUrl: initialData?.fileUrl ?? '', filePath: initialData?.filePath ?? '' }));
      return;
    }

    setIsParsingGpx(true);
    parseGpxFile(nextFile)
      .then((stats) => {
        setAutoStats(stats);
        setParseMessage(
          stats.points.length > 1
            ? 'Detectamos distancia y desnivel automáticamente. Podés ajustar los valores si hace falta.'
            : 'No encontramos datos suficientes en el GPX. Completá los campos manualmente.',
        );

        if (stats.points.length > 1) {
          setDistanceOverride(String(stats.distanceKm ?? ''));
          setElevationOverride(String(stats.elevationGain ?? ''));
        }
      })
      .catch((error) => {
        console.error('Error parsing GPX file:', error);
        setParseMessage('No pudimos leer el GPX. Verificá el archivo o cargá los datos manualmente.');
      })
      .finally(() => {
        setIsParsingGpx(false);
      });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Completá el título y la descripción.');
      return;
    }
    if (!file && !formData.fileUrl) {
      toast.error('Subí un archivo GPX.');
      return;
    }

    setIsSubmitting(true);
    try {
      let payload = { ...formData };

      if (file) {
        const { downloadUrl, storagePath } = await uploadTrackFile(file);
        payload = {
          ...payload,
          fileUrl: downloadUrl,
          filePath: storagePath,
        };
      }

      payload = {
        ...payload,
        distanceKm: distanceOverride.trim() ? Number(distanceOverride) : undefined,
        elevationGain: elevationOverride.trim() ? Number(elevationOverride) : undefined,
      };

      if (initialData) {
        await updateTrack(initialData.id, payload);
        toast.success('Track actualizado');
      } else {
        await createTrack(payload);
        toast.success('Track creado');
      }

      router.push('/admin/tracks');
      router.refresh();
    } catch (error) {
      console.error('Error saving track:', error);
      toast.error('No se pudo guardar el track');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto pb-20">
      <div className="bg-neutral-900 rounded-2xl md:rounded-[2.5rem] border border-neutral-700 p-6 md:p-10 space-y-8 md:space-y-10 shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-white/5 pb-6 md:pb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">
            {initialData ? 'Editar Track GPX' : 'Nuevo Track GPX'}
          </h2>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
            Subí archivos GPX y describí la dificultad para los atletas TT
          </p>
        </div>

        <div className="space-y-6">
          <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            Archivo GPX
          </label>
          <div className="flex flex-col md:flex-row gap-6">
            <div
              className="flex-1 rounded-3xl border-2 border-dashed border-white/10 bg-black/40 p-8 min-h-[220px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-orange/50 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mb-4 text-white/20" />
              <p className="text-sm text-white/60">
                {file ? file.name : initialData?.fileUrl ? 'Archivo cargado' : 'Arrastrá o hace clic para subir .gpx'}
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mt-2">
                Máx 10MB · Formato .gpx
              </p>
              <div className="mt-4 text-xs text-white/60 space-y-2">
                {isParsingGpx && (
                  <p className="flex items-center justify-center gap-2 text-white/80">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analizando GPX...
                  </p>
                )}
                {!isParsingGpx && autoStats && autoStats.points.length > 1 && (
                  <p className="text-white/80">
                    Detectado: {autoStats.distanceKm} km · {autoStats.elevationGain} m D+
                  </p>
                )}
                {parseMessage && (
                  <p className="text-white/60">{parseMessage}</p>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".gpx,application/gpx+xml,application/xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">
                    Distancia (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={distanceOverride}
                    onChange={(e) => setDistanceOverride(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-brand-orange/40 outline-none"
                    placeholder="Ej: 12.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">
                    Desnivel + (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={elevationOverride}
                    onChange={(e) => setElevationOverride(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-brand-orange/40 outline-none"
                    placeholder="Ej: 320"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            Info del Track
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all font-black text-lg"
                placeholder="Ej: Circuito Sierra Grande"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Dificultad</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as TrackDifficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={cn(
                      'rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all',
                      formData.difficulty === level
                        ? 'bg-white text-black shadow-lg'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    )}
                  >
                    {difficultyLabels[level]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all min-h-[140px]"
              placeholder="¿Qué tiene de especial este recorrido?"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white hover:bg-white/5 transition-all"
        >
          Descartar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex items-center justify-center gap-3 bg-white text-black hover:bg-brand-orange hover:text-white px-16 py-5 rounded-3xl transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em]">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {initialData ? 'Actualizar' : 'Publicar'}
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
