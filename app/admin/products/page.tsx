import { MovedToPanel } from '@/components/admin/moved-to-panel';

export const metadata = { title: 'Productos | Admin TT' };

export default function AdminProductsPage() {
  return (
    <MovedToPanel
      title="Productos"
      panelPath="/web/products"
      panelLabel="Contenido web → Productos"
      why="Los productos pasaron a la base del panel junto con los pedidos, porque el stock por talle se descuenta cuando se verifica un pedido: las dos cosas tenían que vivir en el mismo lugar para que eso sea una transacción y no dos escrituras que pueden desincronizarse."
      publicPath="/store"
    />
  );
}
