import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './config';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  size: string;
  totalPrice: number;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  receiptUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
}

export type OrderInput = Omit<Order, 'id' | 'createdAt' | 'status'>;

const ORDERS_COLLECTION = 'orders';

/**
 * Fetch all orders ordered by creation date
 */
export async function getOrders(): Promise<Order[]> {
  if (!db) return [];

  try {
    const q = query(
      collection(db, ORDERS_COLLECTION), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Order;
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Create a new order
 */
export async function createOrder(input: OrderInput): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...input,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to place order');
  }
}

/**
 * Update order status and handle stock adjustments
 */
export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    await runTransaction(db!, async (transaction) => {
      const orderRef = doc(db!, ORDERS_COLLECTION, id);
      const orderSnap = await transaction.get(orderRef);
      
      if (!orderSnap.exists()) throw new Error('Order not found');
      
      const orderData = orderSnap.data() as Order;
      const productRef = doc(db!, 'products', orderData.productId);
      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists()) throw new Error('Product not found');
      
      const productData = productSnap.data();
      const currentSizes = { ...productData.sizes };
      const currentStatus = orderData.status;

      // Handle Stock Changes
      // 1. Verification: Decrement stock
      if (status === 'verified' && currentStatus !== 'verified') {
        const currentStock = currentSizes[orderData.size] || 0;
        if (currentStock <= 0) throw new Error('No hay stock disponible para este talle');
        currentSizes[orderData.size] = currentStock - 1;
        transaction.update(productRef, { sizes: currentSizes, updatedAt: Timestamp.now() });
      }
      
      // 2. Cancellation/Rejection of a previously verified order: Restock (Optional helper)
      if (status === 'rejected' && currentStatus === 'verified') {
        const currentStock = currentSizes[orderData.size] || 0;
        currentSizes[orderData.size] = currentStock + 1;
        transaction.update(productRef, { sizes: currentSizes, updatedAt: Timestamp.now() });
      }

      // Update Order Status
      transaction.update(orderRef, { status });
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}
