import { create } from 'zustand';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  setFirebaseUser: (firebaseUser: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  firebaseUser: null,
  loading: true,
  setUser: (user) => set({ user }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setLoading: (loading) => set({ loading }),
  logout: () => {
    auth.signOut();
    set({ user: null, firebaseUser: null });
  },
}));

// Listen to Firebase auth state changes and sync with backend
onAuthStateChanged(auth, async (firebaseUser) => {
  const store = useAuthStore.getState();

  if (firebaseUser) {
    store.setFirebaseUser(firebaseUser);

    try {
      // Sync with backend to get/create Prisma user
      const token = await firebaseUser.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${API_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        store.setUser(data.data.user);
      } else {
        // Backend rejected — sign out
        auth.signOut();
        store.setUser(null);
      }
    } catch {
      // Network error — keep firebaseUser but no backend user
      store.setUser(null);
    }
  } else {
    store.setFirebaseUser(null);
    store.setUser(null);
  }

  store.setLoading(false);
});
