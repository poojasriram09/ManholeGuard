import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { id: string; email: string; role: string } | null;
  setAuth: (token: string, user: { id: string; email: string; role: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('auth-token', token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem('auth-token');
        set({ token: null, user: null });
      },
    }),
    { name: 'auth-storage' }
  )
);
