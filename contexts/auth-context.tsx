'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInAdmin, signOut as firebaseSignOut } from '@/lib/firebase/auth';
import { isUserAdmin } from '@/lib/firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user is admin
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
        
        // If not admin, sign them out
        if (!adminStatus) {
          await firebaseSignOut().catch(console.error);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    // If auth is not initialized (e.g. missing credentials), onAuthChange returns a no-op unsubscribe
    // and doesn't call the callback. In this case, we should stop loading immediately.
    // We can check if auth exists indirectly by seeing if the unsubscribe is an empty function 
    // (though that's hacky) or just by checking auth directly if we exported it differently.
    // Better yet, just add a small timeout or check if onAuthChange did anything.
    
    // Actually, I'll just check if onAuthChange is returning a no-op
    if (unsubscribe.toString() === '() => {}') {
        setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInAdmin(email, password);
      // User state will be updated by onAuthChange
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut();
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
