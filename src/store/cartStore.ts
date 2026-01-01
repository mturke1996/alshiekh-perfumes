import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types/perfume-shop';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        // Validate item data
        if (!newItem || !newItem.product || !newItem.product.id) {
          return;
        }

        // Ensure quantity is valid
        const quantity = Math.max(1, newItem.quantity || 1);

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === newItem.product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === newItem.product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return { items: [...state.items, { ...newItem, quantity }] };
        });
      },

      removeItem: (productId) => {
        if (!productId) return;
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (!productId || quantity < 0) return;
        const validQuantity = Math.max(0, Math.floor(quantity));
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity: validQuantity } : item
          ).filter((item) => item.quantity > 0), // Remove items with 0 quantity
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          if (!item.product || !item.product.price) return total;
          const price = item.product.discount && item.product.discount > 0
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price;
          const quantity = Math.max(0, item.quantity || 0);
          return total + price * quantity;
        }, 0);
      },

      getItemsCount: () => {
        const items = get().items;
        return items.reduce((count, item) => {
          const quantity = Math.max(0, item.quantity || 0);
          return count + quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

