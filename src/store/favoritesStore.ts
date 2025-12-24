import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/perfume-shop';

interface FavoritesState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInFavorites: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          if (exists) return state;
          return { items: [...state.items, product] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      isInFavorites: (productId) => {
        const items = get().items;
        return items.some((item) => item.id === productId);
      },

      clearFavorites: () => set({ items: [] }),
    }),
    {
      name: 'favorites-storage',
    }
  )
);

