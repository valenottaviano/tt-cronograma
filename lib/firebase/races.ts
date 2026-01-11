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
import { Race } from '../data';

export type RaceInput = Omit<Race, 'id'>;

const RACES_COLLECTION = 'races';

/**
 * Fetch all races ordered by date
 */
export async function getFirebaseRaces(): Promise<Race[]> {
  if (!db) return [];

  try {
    const q = query(
      collection(db, RACES_COLLECTION)
    );
    const querySnapshot = await getDocs(q);
    
    const races = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Race;
    });

    // Sort by date (A-Z)
    return races.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching races:', error);
    return [];
  }
}

/**
 * Get a single race by ID
 */
export async function getFirebaseRace(id: string): Promise<Race | null> {
  if (!db) return null;

  try {
    const docRef = doc(db, RACES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      } as Race;
    }
    return null;
  } catch (error) {
    console.error('Error fetching race:', error);
    return null;
  }
}

/**
 * Create a new race
 */
export async function createRace(input: RaceInput): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = await addDoc(collection(db, RACES_COLLECTION), {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating race:', error);
    throw new Error('Failed to create race');
  }
}

/**
 * Update an existing race
 */
export async function updateRace(id: string, input: Partial<RaceInput>): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = doc(db, RACES_COLLECTION, id);
    await updateDoc(docRef, {
      ...input,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating race:', error);
    throw new Error('Failed to update race');
  }
}

/**
 * Delete a race
 */
export async function deleteRace(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = doc(db, RACES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting race:', error);
    throw new Error('Failed to delete race');
  }
}
