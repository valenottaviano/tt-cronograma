import { MovedToPanel } from '@/components/admin/moved-to-panel';

/**
 * Los beneficios ya no viven acá.
 *
 * Se migraron a Postgres (roberto-parodi) porque el comercio que los ofrece es
 * la misma entidad que registra ventas en tt-comercios. El CRUD que estaba en
 * esta sección escribía a Firestore, que ya nadie lee.
 */
export const metadata = { title: 'Beneficios | Admin TT' };

export default function AdminBenefitsPage() {
  return (
    <MovedToPanel
      title="Beneficios"
      panelPath="/merchants"
      panelLabel="Comercios"
      why="El comercio que da el beneficio es el mismo que registra las ventas en TT Comercios. Para que una venta pueda apuntar a un comercio de verdad, los comercios y sus beneficios pasaron a la base del panel."
      publicPath="/benefits"
    />
  );
}
