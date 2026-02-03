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
} from 'firebase/firestore';
import { db } from './config';
import { Track, TrackDifficulty } from '@/lib/data';

export type TrackInput = Omit<Track, 'id' | 'createdAt' | 'updatedAt'>;

const TRACKS_COLLECTION = 'tracks';

export async function getFirebaseTracks(): Promise<Track[]> {
  if (!db) return [];

  try {
    const q = query(collection(db, TRACKS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        difficulty: data.difficulty as TrackDifficulty,
        fileUrl: data.fileUrl,
        filePath: data.filePath,
        distanceKm: data.distanceKm,
        elevationGain: data.elevationGain,
        createdAt: data.createdAt?.toDate?.().toISOString?.(),
        updatedAt: data.updatedAt?.toDate?.().toISOString?.(),
      } satisfies Track;
    });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return [];
  }
}

export async function getFirebaseTrack(id: string): Promise<Track | null> {
  if (!db) return null;

  try {
    const docRef = doc(db, TRACKS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty as TrackDifficulty,
      fileUrl: data.fileUrl,
      filePath: data.filePath,
      distanceKm: data.distanceKm,
      elevationGain: data.elevationGain,
      createdAt: data.createdAt?.toDate?.().toISOString?.(),
      updatedAt: data.updatedAt?.toDate?.().toISOString?.(),
    } satisfies Track;
  } catch (error) {
    console.error('Error fetching track:', error);
    return null;
  }
}

export async function createTrack(input: TrackInput): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = await addDoc(collection(db, TRACKS_COLLECTION), {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating track:', error);
    throw new Error('Failed to create track');
  }
}

export async function updateTrack(id: string, input: Partial<TrackInput>): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = doc(db, TRACKS_COLLECTION, id);
    await updateDoc(docRef, {
      ...input,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating track:', error);
    throw new Error('Failed to update track');
  }
}

export async function deleteTrack(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const docRef = doc(db, TRACKS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting track:', error);
    throw new Error('Failed to delete track');
  }
}
