import { MovedToPanel } from '@/components/admin/moved-to-panel';

/**
 * Los pedidos ya no viven acá.
 *
 * El histórico de Firestore no se migró: esta sección arrancó de cero en el
 * panel. Los pedidos viejos siguen consultables en la consola de Firebase.
 */
export const metadata = { title: 'Pedidos | Admin TT' };

export default function AdminOrdersPage() {
  return (
    <MovedToPanel
      title="Pedidos"
      panelPath="/web/orders"
      panelLabel="Contenido web → Pedidos"
      why="Los pedidos nuevos entran en la base del panel. El histórico anterior no se migró y queda consultable en la consola de Firebase. Además, el checkout dejó de escribir desde el navegador: ahora pasa por un endpoint del servidor con límite de pedidos por visitante."
      publicPath="/store"
    />
  );
}
