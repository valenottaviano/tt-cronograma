import { RacesList } from '@/components/admin/races-list';

export default function AdminRacesPage() {
  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Calendario de Carreras</h1>
        <p className="text-white/40 font-medium tracking-widest uppercase text-xs mt-1">Gestión del cronograma oficial y beneficios para el equipo</p>
      </div>
      
      <RacesList />
    </div>
  );
}
