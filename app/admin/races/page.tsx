import { MovedToPanel } from '@/components/admin/moved-to-panel';

/**
 * El calendario de carreras ya no vive acá.
 *
 * Se migró a Postgres (roberto-parodi) y se administra desde el panel del coach,
 * en Contenido web → Carreras. El CRUD que estaba en esta sección escribía a
 * Firestore, que ya nadie lee: cada edición se habría perdido en silencio.
 */
export const metadata = { title: 'Carreras | Admin TT' };

export default function AdminRacesPage() {
  return (
    <MovedToPanel
      title="Calendario de carreras"
      panelPath="/web/races"
      panelLabel="Contenido web → Carreras"
      why="El calendario pasó a la base del panel junto con el resto del contenido de la web, para que haya un solo lugar donde se administra y un solo origen de verdad."
      publicPath="/races"
    />
  );
}
