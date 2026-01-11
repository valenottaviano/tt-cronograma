import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

export interface AdminData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

/**
 * Check if a user is an admin by looking up their UID in the admins collection
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  if (!db) {
    console.error('Firestore is not initialized');
    return false;
  }

  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin data from Firestore
 */
export async function getAdminData(uid: string): Promise<AdminData | null> {
  if (!db) {
    console.error('Firestore is not initialized');
    return null;
  }

  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting admin data:', error);
    return null;
  }
}
