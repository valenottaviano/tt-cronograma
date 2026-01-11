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
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  sizes: Record<string, number>; // { "S": 10, "M": 5 }
  createdAt: Date;
  updatedAt: Date;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetch all products ordered by creation date
 */
export async function getProducts(): Promise<Product[]> {
  if (!db) return [];

  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Product;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: string): Promise<Product | null> {
  if (!db) return null;

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Create a new product
 */
export async function createProduct(input: ProductInput): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...input,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}
