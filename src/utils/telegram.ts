import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, SiteSettings, TelegramChat } from '../types/perfume-shop';

/**
 * Send order notification to Telegram
 */
export async function sendTelegramOrderNotification(order: Order, statusUpdate?: { oldStatus: string; newStatus: string }): Promise<boolean> {
  try {
    // Get Telegram settings from Firestore
    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    if (!settingsDoc.exists()) {
      console.warn('Telegram settings not found');
      return false;
    }

    const settings = settingsDoc.data() as SiteSettings;
    const botToken = settings.telegramBotToken;

    if (!botToken) {
      console.warn('Telegram bot token not configured');
      return false;
    }

    // Get active telegram chats
    const chatsSnapshot = await getDocs(
      query(collection(db, 'telegramChats'), where('active', '==', true))
    );

    const activeChats = chatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TelegramChat[];

    if (activeChats.length === 0) {
      // Fallback to old chatId if exists
      const chatId = settings.telegramChatId;
      if (chatId) {
        const message = formatOrderMessage(order, statusUpdate);
        return sendToChat(botToken, chatId, message);
      }
      console.warn('No active Telegram chats found');
      return false;
    }

    // Format order message
    const message = formatOrderMessage(order, statusUpdate);

    // Send to all active chats
    const sendPromises = activeChats.map(chat =>
      sendToChat(botToken, chat.chatId, message)
    );

    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    return successCount > 0;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

async function sendToChat(botToken: string, chatId: string, message: string): Promise<boolean> {
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
    console.error('Error sending to chat:', error);
    return false;
  }
}

/**
 * Format order message for Telegram
 */
function formatOrderMessage(order: Order, statusUpdate?: { oldStatus: string; newStatus: string }): string {
  // If this is a status update message
  if (statusUpdate) {
    return formatStatusUpdateMessage(order, statusUpdate.oldStatus, statusUpdate.newStatus);
  }

  const itemsList = order.items
    .map(
      (item, index) =>
        `${index + 1}. <b>${item.productNameAr || item.productName}</b>\n   📦 الكمية: ${item.quantity} قطعة\n   💰 السعر: ${item.price.toFixed(0)} د.ل`
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

  // Determine delivery type
  const isPickup = order.shippingAddress.addressLine1.includes('استلام من المتجر') || 
                   order.shippingMethod === 'same-day';
  const deliveryTypeEmoji = isPickup ? '🏪' : '🚚';
  const deliveryTypeText = isPickup ? '📦 الاستلام من المتجر' : '🚚 التوصيل إلى العنوان';

  return `
🎉 <b>طلب جديد - ${deliveryTypeText}</b>
━━━━━━━━━━━━━━━━━━

📦 <b>رقم الطلب:</b> <code>#${order.orderNumber}</code>
📅 <b>التاريخ والوقت:</b> ${new Date(order.createdAt?.toDate() || new Date()).toLocaleString('ar-LY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}

━━━━━━━━━━━━━━━━━━
👤 <b>معلومات العميل:</b>
━━━━━━━━━━━━━━━━━━
   👤 <b>الاسم:</b> ${order.customerName}
   📞 <b>الهاتف:</b> <code>${order.customerPhone}</code>
   ${order.customerEmail ? `   📧 <b>البريد:</b> ${order.customerEmail}` : ''}

${isPickup ? `
━━━━━━━━━━━━━━━━━━
${deliveryTypeEmoji} <b>طريقة الاستلام:</b>
━━━━━━━━━━━━━━━━━━
   🏪 <b>استلام من المتجر</b>
   📍 ${order.shippingAddress.city || 'العنوان من الإعدادات'}
` : `
━━━━━━━━━━━━━━━━━━
${deliveryTypeEmoji} <b>عنوان التوصيل:</b>
━━━━━━━━━━━━━━━━━━
   👤 <b>المستلم:</b> ${order.shippingAddress.fullName}
   📍 <b>العنوان:</b> ${order.shippingAddress.addressLine1}
   🏙️ <b>المدينة:</b> ${order.shippingAddress.city}
   ${order.shippingAddress.phone ? `   📞 <b>هاتف المستلم:</b> <code>${order.shippingAddress.phone}</code>` : ''}
   ${order.shippingAddress.addressLine2 ? `   📝 <b>ملاحظات:</b> ${order.shippingAddress.addressLine2}` : ''}
`}

━━━━━━━━━━━━━━━━━━
🛒 <b>المنتجات (${order.items.length}):</b>
━━━━━━━━━━━━━━━━━━
${itemsList}

━━━━━━━━━━━━━━━━━━
💰 <b>الإجماليات:</b>
━━━━━━━━━━━━━━━━━━
   المجموع الفرعي: ${order.subtotal.toFixed(0)} د.ل
   ${order.discount > 0 ? `   🎁 الخصم: <b>-${order.discount.toFixed(0)} د.ل</b>\n` : ''}
   ${order.shippingCost > 0 ? `   🚚 تكلفة الشحن: ${order.shippingCost.toFixed(0)} د.ل\n` : ''}
   ${order.tax > 0 ? `   📊 الضريبة: ${order.tax.toFixed(0)} د.ل\n` : ''}
   
   ━━━━━━━━━━━━━━━━━━
   <b>💵 الإجمالي النهائي: ${order.total.toFixed(0)} د.ل</b>
   ━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━
💳 <b>طريقة الدفع:</b> ${paymentLabels[order.paymentMethod] || order.paymentMethod}
📊 <b>الحالة:</b> ${statusLabels[order.status] || order.status}

${order.customerNote ? `\n━━━━━━━━━━━━━━━━━━\n📝 <b>ملاحظة العميل:</b>\n${order.customerNote}\n━━━━━━━━━━━━━━━━━━\n` : ''}

${isPickup ? '✅ <b>سيتم الاستلام من المتجر</b>' : '✅ <b>سيتم التوصيل إلى العنوان المحدد</b>'}
━━━━━━━━━━━━━━━━━━
  `.trim();
}

/**
 * Format status update message for Telegram
 */
function formatStatusUpdateMessage(order: Order, oldStatus: string, newStatus: string): string {
  const statusLabels: Record<string, string> = {
    pending: '🆕 قيد الانتظار',
    confirmed: '✅ مؤكد',
    processing: '⚙️ قيد المعالجة',
    shipped: '🚚 تم الشحن',
    delivered: '✓ تم التوصيل',
    cancelled: '❌ ملغى',
    refunded: '💸 مسترد',
  };

  const statusEmojis: Record<string, string> = {
    pending: '🆕',
    confirmed: '✅',
    processing: '⚙️',
    shipped: '🚚',
    delivered: '✓',
    cancelled: '❌',
    refunded: '💸',
  };

  const oldStatusLabel = statusLabels[oldStatus] || oldStatus;
  const newStatusLabel = statusLabels[newStatus] || newStatus;
  const statusEmoji = statusEmojis[newStatus] || '📊';

  const isPositiveUpdate = ['confirmed', 'processing', 'shipped', 'delivered'].includes(newStatus);
  const isNegativeUpdate = ['cancelled', 'refunded'].includes(newStatus);

  return `
${statusEmoji} <b>تحديث حالة الطلب</b>
━━━━━━━━━━━━━━━━━━

📦 <b>رقم الطلب:</b> <code>#${order.orderNumber}</code>
👤 <b>العميل:</b> ${order.customerName}
📞 <b>الهاتف:</b> <code>${order.customerPhone}</code>

━━━━━━━━━━━━━━━━━━
📊 <b>تغيير الحالة:</b>
━━━━━━━━━━━━━━━━━━
   من: ${oldStatusLabel}
   إلى: <b>${newStatusLabel}</b>

━━━━━━━━━━━━━━━━━━
💰 <b>إجمالي الطلب:</b> ${order.total.toFixed(0)} د.ل

━━━━━━━━━━━━━━━━━━
${isPositiveUpdate ? '✅ <b>تم التحديث بنجاح</b>' : isNegativeUpdate ? '⚠️ <b>تم تحديث الحالة</b>' : '📊 <b>تم التحديث</b>'}
━━━━━━━━━━━━━━━━━━
  `.trim();
}

/**
 * Test Telegram connection
 */
export async function testTelegramConnection(botToken: string, chatId: string): Promise<boolean> {
  try {
    // First, test bot token by getting bot info
    const botInfoResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`
    );

    if (!botInfoResponse.ok) {
      return false;
    }

    // Then test sending message
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ تم الاتصال بنجاح! إشعارات Telegram تعمل بشكل صحيح.\n\nهذه رسالة اختبار من متجر الشيخ للعطور.',
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram test error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error testing Telegram connection:', error);
    return false;
  }
}

/**
 * Send contact message to Telegram
 */
export async function sendContactMessageToTelegram(
  name: string,
  phone: string,
  email: string | undefined,
  subject: string,
  message: string
): Promise<boolean> {
  try {
    // Get Telegram settings from Firestore
    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    if (!settingsDoc.exists()) {
      console.warn('Telegram settings not found');
      return false;
    }

    const settings = settingsDoc.data() as SiteSettings;
    const botToken = settings.telegramBotToken;

    if (!botToken) {
      console.warn('Telegram bot token not configured');
      return false;
    }

    // Get active telegram chats
    const chatsSnapshot = await getDocs(
      query(collection(db, 'telegramChats'), where('active', '==', true))
    );

    const activeChats = chatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TelegramChat[];

    if (activeChats.length === 0) {
      // Fallback to old chatId if exists
      const chatId = settings.telegramChatId;
      if (chatId) {
        const formattedMessage = formatContactMessage(name, phone, email, subject, message);
        return sendToChat(botToken, chatId, formattedMessage);
      }
      console.warn('No active Telegram chats found');
      return false;
    }

    // Format contact message
    const formattedMessage = formatContactMessage(name, phone, email, subject, message);

    // Send to all active chats
    const sendPromises = activeChats.map(chat =>
      sendToChat(botToken, chat.chatId, formattedMessage)
    );

    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    return successCount > 0;
  } catch (error) {
    console.error('Error sending contact message to Telegram:', error);
    return false;
  }
}

/**
 * Format contact message for Telegram
 */
function formatContactMessage(
  name: string,
  phone: string,
  email: string | undefined,
  subject: string,
  message: string
): string {
  return `
📧 <b>رسالة تواصل جديدة</b>
━━━━━━━━━━━━━━━━━━

👤 <b>الاسم:</b> ${name}
📞 <b>الهاتف:</b> <code>${phone}</code>
${email ? `📧 <b>البريد الإلكتروني:</b> ${email}` : ''}

━━━━━━━━━━━━━━━━━━
📌 <b>الموضوع:</b>
━━━━━━━━━━━━━━━━━━
${subject}

━━━━━━━━━━━━━━━━━━
💬 <b>الرسالة:</b>
━━━━━━━━━━━━━━━━━━
${message}

━━━━━━━━━━━━━━━━━━
⏰ <b>التاريخ والوقت:</b> ${new Date().toLocaleString('ar-LY', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})}
━━━━━━━━━━━━━━━━━━
  `.trim();
}

