'use client';

import { useState, useEffect } from 'react';
import { Race } from '@/lib/data';
import { getFirebaseRaces, deleteRace, createRace } from '@/lib/firebase/races';
import { fetchRacesFromSheets, getExistingRacesKeys } from '@/lib/firebase/seed-races';
import { Edit2, Trash2, Plus, Calendar, MapPin, ExternalLink, Award, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function RacesList() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    setLoading(true);
    const data = await getFirebaseRaces();
    setRaces(data);
    setLoading(false);
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      const fetchResponse = await fetchRacesFromSheets();
      if (!fetchResponse.success || !fetchResponse.races) {
        throw new Error(fetchResponse.error || 'No se pudieron recuperar las carreras');
      }

      const existingKeys = await getExistingRacesKeys();
      const existingSet = new Set(existingKeys);

      let importedCount = 0;
      let skippedCount = 0;

      for (const race of fetchResponse.races) {
        const key = `${race.name.toLowerCase()}|${race.date}`;
        
        if (!existingSet.has(key)) {
          await createRace({
            name: race.name,
            date: race.date,
            location: race.location,
            province: race.province,
            distance: race.distance,
            type: race.type,
            url: race.url || '',
            discountCode: race.discountCode || '',
            description: race.description || '',
            image: race.image || '',
          });
          importedCount++;
        } else {
          skippedCount++;
        }
      }

      toast.success(`Importación completada: ${importedCount} nuevas, ${skippedCount} omitidas.`);
      fetchRaces();
    } catch (error) {
      console.error('Error during import:', error);
      toast.error(`Error al importar: ${(error as Error).message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (race: Race) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la carrera "${race.name}"?`)) {
      return;
    }

    try {
      await deleteRace(race.id);
      toast.success('Carrera eliminada correctamente');
      fetchRaces();
    } catch (error) {
      console.error('Error deleting race:', error);
      toast.error('Error al eliminar la carrera');
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
          <h2 className="text-lg md:text-xl font-black text-white italic uppercase tracking-tighter leading-none">Calendario de Carreras</h2>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Total: {races.length} carreras</p>
        </div>
        <Link
          href="/admin/races/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 py-3 rounded-xl md:rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Nueva Carrera
        </Link>
      </div>

      {races.length === 0 ? (
        <div className="bg-neutral-900 rounded-2xl md:rounded-3xl border border-neutral-700 border-dashed p-10 md:p-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full mb-4 md:mb-6">
            <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white/20" />
          </div>
          <p className="text-white/20 font-black uppercase tracking-[0.2em] text-sm">No hay carreras registradas aún</p>
          <div className="mt-6">
             <button 
                onClick={handleImport}
                className="text-xs text-blue-500 font-bold uppercase tracking-widest hover:underline"
             >
                ¿Importar desde Google Sheets?
             </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {races.map((race) => (
              <div key={race.id} className="bg-neutral-900 rounded-2xl border border-neutral-700 overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex gap-4 items-start">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
                      {race.image ? (
                        <Image
                          src={race.image}
                          alt={race.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Calendar className="w-6 h-6 m-4 text-white/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base text-white italic uppercase tracking-tighter leading-tight truncate">{race.name}</p>
                      <p className="text-[10px] font-bold text-blue-500 uppercase mt-0.5">
                        {race.type === 'trail' ? 'Trail Running' : 'Calle / Road'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      {new Date(race.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-medium uppercase">
                      <MapPin className="w-3 h-3" />
                      {race.location}, {race.province}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {race.distance.split(',').map((d, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-black text-white/60 uppercase">
                        {d.trim()}
                      </span>
                    ))}
                  </div>
                  
                  {/* Extras */}
                  <div className="flex gap-2">
                    {race.discountCode && (
                      <div className="p-2 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20" title={`Cupón: ${race.discountCode}`}>
                         <Award className="w-4 h-4" />
                      </div>
                    )}
                    {race.url && (
                      <a 
                        href={race.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20" 
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {race.description && (
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 border border-purple-500/20" title="Tiene descripción">
                         <Info className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <Link
                      href={`/admin/races/${race.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/10 text-[10px] font-bold uppercase"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(race)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/10 text-[10px] font-bold uppercase"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-neutral-900 rounded-3xl border border-neutral-700 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Carrera</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Fecha y Ubicación</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Distancias</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Extras</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {races.map((race) => (
                    <tr key={race.id} className="group hover:bg-white/[0.04] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10 group-hover:border-blue-500/30 transition-colors">
                            {race.image ? (
                              <Image
                                src={race.image}
                                alt={race.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <Calendar className="w-6 h-6 m-4 text-white/10" />
                            )}
                          </div>
                          <div className="max-w-md">
                            <p className="font-black text-lg text-white italic uppercase tracking-tighter leading-tight">{race.name}</p>
                            <p className="text-[10px] font-bold text-blue-500 truncate mt-1 tracking-wider uppercase">
                              {race.type === 'trail' ? 'Trail Running' : 'Calle / Road'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-tight">
                            <Calendar className="w-3 h-3 text-blue-500" />
                            {new Date(race.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2 text-white/40 text-[10px] font-medium uppercase tracking-widest">
                            <MapPin className="w-3 h-3" />
                            {race.location}, {race.province}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1.5">
                          {race.distance.split(',').map((d, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-black text-white/60 uppercase tracking-tighter">
                              {d.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          {race.discountCode && (
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20" title={`Cupón: ${race.discountCode}`}>
                               <Award className="w-4 h-4" />
                            </div>
                          )}
                          {race.url && (
                            <a 
                              href={race.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-colors" 
                              title="Web Oficial"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {race.description && (
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 border border-purple-500/20" title="Tiene descripción">
                               <Info className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/races/${race.id}/edit`}
                            className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/5 hover:border-white/20"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(race)}
                            className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5 hover:border-red-500/20"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

