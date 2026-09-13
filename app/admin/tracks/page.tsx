import { MovedToPanel } from '@/components/admin/moved-to-panel';

/**
 * Los tracks ya no viven acá.
 *
 * Se migraron a Postgres (roberto-parodi). Los archivos .gpx de los 13 tracks
 * existentes siguen en Firebase Storage y sus URLs no cambiaron; los que se
 * suban desde el panel van al storage propio.
 */
export const metadata = { title: 'Tracks | Admin TT' };

export default function AdminTracksPage() {
  return (
    <MovedToPanel
      title="Tracks GPX"
      panelPath="/web/tracks"
      panelLabel="Contenido web → Tracks"
      why="Los tracks pasaron a la base del panel junto con el resto del contenido de la web. Los archivos .gpx de los tracks existentes siguen alojados donde estaban, así que las URLs no cambiaron."
      publicPath="/tracks"
    />
  );
}
