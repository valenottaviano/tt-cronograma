'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, FileText, Trash2, MapPin, Download, Plus } from 'lucide-react';
import { Track } from '@/lib/data';
import { deleteTrack, getFirebaseTracks } from '@/lib/firebase/tracks';
import { deleteTrackFile } from '@/lib/firebase/storage';
import { toast } from 'sonner';

export function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getFirebaseTracks()
      .then(setTracks)
      .catch((error) => {
        console.error('Error loading tracks:', error);
        toast.error('No se pudieron cargar los tracks');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (track: Track) => {
    if (!confirm(`¿Eliminar el track "${track.title}"?`)) return;

    setDeletingId(track.id);
    try {
      await deleteTrack(track.id);
      if (track.filePath) {
        await deleteTrackFile(track.filePath);
      }
      setTracks((prev) => prev.filter((t) => t.id !== track.id));
      toast.success('Track eliminado');
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('No se pudo eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/60">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando tracks...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Biblioteca GPX</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Tracks TT</h1>
          <p className="text-sm text-white/60">Gestioná circuitos y recorridos entrenables.</p>
        </div>
        <Link
          href="/admin/tracks/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-orange hover:text-white transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo Track
        </Link>
      </div>

      {tracks.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center">
          <p className="text-white/60">Todavía no cargaste ningún GPX.</p>
          <Link href="/admin/tracks/new" className="text-brand-orange font-medium mt-2 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Crear el primero
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tracks.map((track) => (
            <div key={track.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">{track.difficulty}</p>
                <h3 className="text-xl font-black text-white">{track.title}</h3>
                <p className="text-sm text-white/60 line-clamp-2">{track.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/60">
                  {track.distanceKm && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {track.distanceKm} km
                    </span>
                  )}
                  {track.elevationGain && (
                    <span>{track.elevationGain} m D+</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/tracks/${track.id}/edit`}
                  className="px-4 py-2 rounded-2xl border border-white/20 text-xs uppercase font-black tracking-[0.2em] text-white/70 hover:text-white"
                >
                  Editar
                </Link>
                <a
                  href={track.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-2xl border border-white/20 text-xs uppercase font-black tracking-[0.2em] text-white/70 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(track)}
                  disabled={deletingId === track.id}
                  className="px-3 py-2 rounded-2xl border border-red-400/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deletingId === track.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
