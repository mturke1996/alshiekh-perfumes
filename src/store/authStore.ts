import { create } from 'zustand';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, isAdmin: false });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
}));

