import { useEffect } from 'react';
import { collection, query, onSnapshot, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types/perfume-shop';
import { sendTelegramOrderNotification } from '../utils/telegram';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to listen for new orders and send Telegram notifications
 * Only works for admin users
 */
export function useTelegramNotification() {
  const { isAdmin, user } = useAuthStore();

  useEffect(() => {
    // Only listen for orders if user is authenticated and is admin
    if (!user || !isAdmin) {
      return;
    }

    // Listen for new orders (status: pending)
    const ordersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const order = {
            id: change.doc.id,
            ...change.doc.data()
          } as Order;

          // Check if order was created in the last minute (to avoid duplicate notifications)
          const orderDate = order.createdAt?.toDate();
          if (orderDate) {
            const now = new Date();
            const diffInSeconds = (now.getTime() - orderDate.getTime()) / 1000;
            
            // Only send notification if order was created in the last 60 seconds
            if (diffInSeconds < 60) {
              console.log('New order detected, sending Telegram notification...');
              await sendTelegramOrderNotification(order);
            }
          }
        }
      });
    },
      (error) => {
        // Silently handle permission errors (user might not be admin yet)
        if (error.code !== 'permission-denied') {
          console.error('Error listening to orders:', error);
        }
      }
    );

    return () => unsubscribe();
  }, [isAdmin, user]);
}

