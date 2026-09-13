/**
 * Tipos y helpers de la tienda.
 *
 * Antes el tipo `Product` vivía en `lib/firebase/products.ts` y los componentes
 * leían Firestore directamente desde el navegador. Ahora los productos viven en
 * Postgres (roberto-parodi) y se consumen por las rutas de `app/api/store/*`, que
 * son proxies del servidor: así el secreto compartido nunca llega al browser.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  /** Mapa talle → stock, ej. `{ "M": 7, "S": 4 }`. */
  sizes: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/store/products");
  if (!res.ok) throw new Error("No se pudieron cargar los productos");
  const json = await res.json();
  return json.data ?? [];
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const products = await fetchProducts();
  return products.find((p) => p.id === id) ?? null;
}

export interface OrderInput {
  productId: string;
  size: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  receipt: File;
}

/**
 * Crea el pedido. El comprobante va en el mismo request que los datos: así no
 * queda un archivo huérfano si el alta falla, y hay una sola escritura pública.
 */
export async function createOrder(input: OrderInput): Promise<{ id: string }> {
  const body = new FormData();
  body.append("productId", input.productId);
  body.append("size", input.size);
  body.append("customerFirstName", input.customerFirstName);
  body.append("customerLastName", input.customerLastName);
  body.append("customerPhone", input.customerPhone);
  body.append("receipt", input.receipt);

  const res = await fetch("/api/store/orders", { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "No se pudo procesar la compra");
  return json.data;
}
