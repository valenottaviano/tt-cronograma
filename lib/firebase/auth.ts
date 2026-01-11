import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';
import { isUserAdmin } from './firestore';

/**
 * Sign in with email and password (admin only)
 * Throws an error if the user is not an admin
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your configuration.');
  }

  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is an admin
    const isAdmin = await isUserAdmin(userCredential.user.uid);
    
    if (!isAdmin) {
      // Sign out immediately if not an admin
      await firebaseSignOut(auth);
      throw new Error('Access denied. Only administrators can log in.');
    }
    
    return userCredential;
  } catch (error: any) {
    // Re-throw with a more friendly message
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    } else if (error.message.includes('Access denied')) {
      throw error; // Re-throw our custom admin error
    } else {
      throw new Error('Failed to sign in. Please try again.');
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized.');
  }

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    console.warn('Firebase Auth is not initialized');
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if the current user is an admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const user = getCurrentUser();
  if (!user) return false;
  return isUserAdmin(user.uid);
}
