import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signInAsDemo as firebaseSignInAsDemo, logout } from '@/src/lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInAsDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const signInAsDemo = async () => {
    try {
      await firebaseSignInAsDemo();
    } catch (error: any) {
      if (error.code === 'auth/admin-restricted-operation') {
        toast.error('Demo mode (Anonymous Auth) is not enabled in Firebase project settings.');
      } else {
        toast.error('Failed to sign in as demo.');
      }
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInAsDemo, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
