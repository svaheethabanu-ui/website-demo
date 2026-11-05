import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  testConnection,
} from '../lib/firebase';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  firestoreConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  signInDemoMode: () => void;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firestoreConnected, setFirestoreConnected] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Test initial connection to Firestore
    testConnection().then((connected) => {
      setFirestoreConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL,
        });
      } else {
        // Check if there is an active demo session saved in sessionStorage
        const savedDemo = sessionStorage.getItem('apex_demo_user');
        if (savedDemo) {
          try {
            setUser(JSON.parse(savedDemo));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      sessionStorage.removeItem('apex_demo_user');
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      const errorMsg =
        err instanceof Error ? err.message : 'Google authentication failed. Please try again.';
      setAuthError(errorMsg);
      throw err;
    }
  };

  const signInDemoMode = () => {
    const demo: AuthUser = {
      uid: 'demo-user-apex-2026',
      email: 'demo.developer@apexcloud.io',
      displayName: 'Demo Specialist',
      photoURL: null,
      isDemo: true,
    };
    sessionStorage.setItem('apex_demo_user', JSON.stringify(demo));
    setUser(demo);
  };

  const logout = async () => {
    sessionStorage.removeItem('apex_demo_user');
    if (user?.isDemo) {
      setUser(null);
      return;
    }
    await signOut(auth);
    setUser(null);
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firestoreConnected,
        signInWithGoogle,
        signInDemoMode,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
