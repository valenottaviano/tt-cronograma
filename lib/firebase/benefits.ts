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
import { Benefit } from '../data';

export type BenefitInput = Omit<Benefit, 'id'>;

const BENEFITS_COLLECTION = 'benefits';

/**
 * Fetch all benefits ordered by creation date
 */
export async function getFirebaseBenefits(): Promise<Benefit[]> {
  if (!db) return [];

  try {
    const q = query(
      collection(db, BENEFITS_COLLECTION)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        company: data.company,
        logo: data.logo,
        linkCta: data.linkCta,
        instagramLink: data.instagramLink,
        whatsappLink: data.whatsappLink,
      } as Benefit;
    }).sort((a, b) => a.company.localeCompare(b.company));
  } catch (error) {
    console.error('Error fetching benefits:', error);
    return [];
  }
}

/**
 * Get a single benefit by ID
 */
export async function getFirebaseBenefit(id: string): Promise<Benefit | null> {
  if (!db) return null;

  try {
    const docRef = doc(db, BENEFITS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        company: data.company,
        logo: data.logo,
        linkCta: data.linkCta,
        instagramLink: data.instagramLink,
        whatsappLink: data.whatsappLink,
      } as Benefit;
    }
    return null;
  } catch (error) {
    console.error('Error fetching benefit:', error);
    return null;
  }
}

/**
 * Create a new benefit
 */
export async function createBenefit(input: BenefitInput): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = await addDoc(collection(db, BENEFITS_COLLECTION), {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating benefit:', error);
    throw new Error('Failed to create benefit');
  }
}

/**
 * Update an existing benefit
 */
export async function updateBenefit(id: string, input: Partial<BenefitInput>): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = doc(db, BENEFITS_COLLECTION, id);
    await updateDoc(docRef, {
      ...input,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating benefit:', error);
    throw new Error('Failed to update benefit');
  }
}

/**
 * Delete a benefit
 */
export async function deleteBenefit(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = doc(db, BENEFITS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting benefit:', error);
    throw new Error('Failed to delete benefit');
  }
}
