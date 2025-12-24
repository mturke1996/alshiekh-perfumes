import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, SiteSettings } from '../types/perfume-shop';

/**
 * Send order notification to Telegram
 */
export async function sendTelegramOrderNotification(order: Order): Promise<boolean> {
  try {
    // Get Telegram settings from Firestore
    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    if (!settingsDoc.exists()) {
      console.warn('Telegram settings not found');
      return false;
    }

    const settings = settingsDoc.data() as SiteSettings;
    const botToken = settings.telegramBotToken;
    const chatId = settings.telegramChatId;

    if (!botToken || !chatId) {
      console.warn('Telegram bot token or chat ID not configured');
      return false;
    }

    // Format order message
    const message = formatOrderMessage(order);

    // Send message to Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * Format order message for Telegram
 */
function formatOrderMessage(order: Order): string {
  const itemsList = order.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.productNameAr || item.productName}\n   الكمية: ${item.quantity}\n   السعر: ${item.price.toFixed(0)} IQD`
    )
    .join('\n\n');

  const statusLabels: Record<string, string> = {
    pending: '🆕 جديد',
    confirmed: '✅ مؤكد',
    processing: '⚙️ قيد المعالجة',
    shipped: '🚚 تم الشحن',
    delivered: '✓ تم التوصيل',
    cancelled: '❌ ملغى',
  };

  const paymentLabels: Record<string, string> = {
    'cash-on-delivery': '💵 الدفع عند الاستلام',
    'credit-card': '💳 بطاقة ائتمانية',
    paypal: '💳 PayPal',
    'bank-transfer': '🏦 تحويل بنكي',
  };

  return `
🛍️ <b>طلب جديد</b>

📦 <b>رقم الطلب:</b> #${order.orderNumber}
📅 <b>التاريخ:</b> ${new Date(order.createdAt?.toDate() || new Date()).toLocaleDateString('ar-LY')}

👤 <b>معلومات العميل:</b>
   الاسم: ${order.customerName}
   الهاتف: ${order.customerPhone}
   ${order.customerEmail ? `البريد: ${order.customerEmail}` : ''}

📍 <b>عنوان التوصيل:</b>
   ${order.shippingAddress.fullName}
   ${order.shippingAddress.addressLine1}
   ${order.shippingAddress.city}
   ${order.shippingAddress.phone}

🛒 <b>المنتجات:</b>
${itemsList}

💰 <b>الإجماليات:</b>
   المجموع الفرعي: ${order.subtotal.toFixed(0)} IQD
   ${order.discount > 0 ? `الخصم: -${order.discount.toFixed(0)} IQD\n` : ''}
   ${order.shippingCost > 0 ? `الشحن: ${order.shippingCost.toFixed(0)} IQD\n` : ''}
   ${order.tax > 0 ? `الضريبة: ${order.tax.toFixed(0)} IQD\n` : ''}
   <b>الإجمالي: ${order.total.toFixed(0)} IQD</b>

💳 <b>طريقة الدفع:</b> ${paymentLabels[order.paymentMethod] || order.paymentMethod}
📊 <b>الحالة:</b> ${statusLabels[order.status] || order.status}

${order.customerNote ? `\n📝 <b>ملاحظة العميل:</b>\n${order.customerNote}` : ''}
  `.trim();
}

/**
 * Test Telegram connection
 */
export async function testTelegramConnection(botToken: string, chatId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ تم الاتصال بنجاح! إشعارات Telegram تعمل بشكل صحيح.',
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error testing Telegram connection:', error);
    return false;
  }
}

