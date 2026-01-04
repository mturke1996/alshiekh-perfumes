import { useCallback } from 'react';
import { sendTelegramOrderNotification } from '../utils/telegram';
import { Order } from '../types/perfume-shop';

interface SendResult {
  success: boolean;
  attempts: number;
  error?: string;
}

/**
 * Hook for guaranteed Telegram message delivery
 * Implements retry logic with exponential backoff and error tracking
 */
export function useGuaranteedTelegram() {
  /**
   * Send order notification with guaranteed delivery
   * Will retry up to 5 times with exponential backoff
   */
  const sendOrderNotification = useCallback(async (
    order: Order,
    options?: {
      maxRetries?: number;
      onSuccess?: () => void;
      onFailure?: (error: string) => void;
    }
  ): Promise<SendResult> => {
    const maxRetries = options?.maxRetries || 5;
    let lastError: string | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 محاولة إرسال ${attempt}/${maxRetries}...`);
        
        const success = await sendTelegramOrderNotification(order);
        
        if (success) {
          console.log(`✅ تم إرسال الرسالة بنجاح في المحاولة ${attempt}`);
          options?.onSuccess?.();
          return {
            success: true,
            attempts: attempt,
          };
        } else {
          lastError = 'فشل إرسال الرسالة - تحقق من إعدادات Telegram';
          console.warn(`⚠️ فشلت المحاولة ${attempt}/${maxRetries}`);
          
          // If not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            // Exponential backoff: 2s, 4s, 8s, 16s
            const delay = 2000 * Math.pow(2, attempt - 1);
            console.log(`⏳ انتظار ${delay / 1000} ثانية قبل إعادة المحاولة...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      } catch (error: any) {
        lastError = error.message || 'خطأ غير معروف';
        console.error(`❌ خطأ في المحاولة ${attempt}:`, error.message);
        
        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = 2000 * Math.pow(2, attempt - 1);
          console.log(`⏳ انتظار ${delay / 1000} ثانية قبل إعادة المحاولة...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All attempts failed
    const finalError = lastError || 'فشل إرسال الرسالة بعد جميع المحاولات';
    console.error(`❌ فشل إرسال الرسالة بعد ${maxRetries} محاولات`);
    options?.onFailure?.(finalError);
    
    return {
      success: false,
      attempts: maxRetries,
      error: finalError,
    };
  }, []);

  return {
    sendOrderNotification,
  };
}


