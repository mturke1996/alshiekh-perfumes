import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, SiteSettings } from '../types/perfume-shop';

/**
 * Get Telegram settings from Firestore
 * Returns botToken and all chatIds (main + additional)
 */
async function getTelegramSettings(): Promise<{ botToken: string; chatIds: string[] } | null> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    
    if (!settingsDoc.exists()) {
      console.error('❌ إعدادات Telegram غير موجودة في قاعدة البيانات');
      return null;
    }

    const settings = settingsDoc.data() as SiteSettings;
    const botToken = settings.telegramBotToken;
    const mainChatId = settings.telegramChatId;
    const additionalChatIds = settings.telegramAdditionalChatIds || [];

    if (!botToken || !mainChatId) {
      console.error('❌ Bot Token أو Chat ID الرئيسي غير موجود في قاعدة البيانات');
      return null;
    }

    // Combine main chat ID with additional ones
    const allChatIds = [String(mainChatId).trim(), ...additionalChatIds.map(id => String(id).trim())].filter(id => id);

    return { botToken: botToken.trim(), chatIds: allChatIds };
  } catch (error: any) {
    console.error('❌ خطأ في قراءة إعدادات Telegram:', error.message);
    return null;
  }
}

/**
 * Send message to a single Telegram chat
 */
async function sendToSingleChat(botToken: string, chatId: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();
    
    if (data.ok) {
      console.log(`✅ تم إرسال رسالة Telegram بنجاح إلى Chat ID: ${chatId.substring(0, 5)}...`);
      return true;
    } else {
      console.error(`❌ فشل إرسال رسالة Telegram إلى Chat ID ${chatId.substring(0, 5)}...:`, data.description);
      return false;
    }
  } catch (error: any) {
    console.error(`❌ خطأ في إرسال رسالة Telegram إلى Chat ID ${chatId.substring(0, 5)}...:`, error.message);
    return false;
  }
}

/**
 * Send message to all Telegram chats
 * Uses settings from database (settings/general)
 */
async function sendTelegramMessage(message: string): Promise<boolean> {
  try {
    const settings = await getTelegramSettings();
    
    if (!settings) {
      return false;
    }

    if (settings.chatIds.length === 0) {
      console.error('❌ لا توجد Chat IDs محفوظة');
      return false;
    }

    console.log(`📤 إرسال الرسالة إلى ${settings.chatIds.length} Chat ID(s)...`);

    // Send to all chat IDs in parallel
    const sendPromises = settings.chatIds.map(chatId => 
      sendToSingleChat(settings.botToken, chatId, message)
    );

    const results = await Promise.allSettled(sendPromises);
    
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const totalCount = settings.chatIds.length;

    if (successCount > 0) {
      console.log(`✅ تم إرسال الرسالة بنجاح إلى ${successCount}/${totalCount} Chat ID(s)`);
      return true;
    } else {
      console.error(`❌ فشل إرسال الرسالة إلى جميع Chat IDs`);
      return false;
    }
  } catch (error: any) {
    console.error('❌ خطأ في إرسال رسالة Telegram:', error.message);
    return false;
  }
}

/**
 * Send order notification to Telegram
 * Uses settings from database (settings/general)
 * Sends to all saved chat IDs
 */
export async function sendTelegramOrderNotification(order: Order, statusUpdate?: { oldStatus: string; newStatus: string }): Promise<boolean> {
  try {
    const message = formatOrderMessage(order, statusUpdate);
    return await sendTelegramMessage(message);
  } catch (error: any) {
    console.error('❌ خطأ في إرسال إشعار الطلب:', error.message);
    return false;
  }
}

/**
 * Send contact message to Telegram
 * Uses settings from database (settings/general)
 * Sends to all saved chat IDs
 */
export async function sendContactMessageToTelegram(
  name: string,
  phone: string,
  email: string | undefined,
  subject: string,
  message: string
): Promise<boolean> {
  try {
    const formattedMessage = formatContactMessage(name, phone, email, subject, message);
    return await sendTelegramMessage(formattedMessage);
  } catch (error: any) {
    console.error('❌ خطأ في إرسال رسالة التواصل:', error.message);
    return false;
  }
}

/**
 * Format order message for Telegram
 */
function formatOrderMessage(order: Order, statusUpdate?: { oldStatus: string; newStatus: string }): string {
  const items = order.items.map(item => 
    `• ${item.productNameAr || item.productName} (${item.quantity}x) - ${Math.round(item.price * item.quantity)} دينار`
  ).join('\n');

  let addressText = '';
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    addressText = `\n<b>عنوان التوصيل:</b>\n${addr.fullName}\n${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}\n${addr.city}${addr.state ? ', ' + addr.state : ''}\n${addr.country}`;
  }

  if (statusUpdate) {
    return `<b>تحديث حالة الطلب #${order.orderNumber}</b>

<b>الحالة القديمة:</b> ${getStatusAr(statusUpdate.oldStatus)}
<b>الحالة الجديدة:</b> ${getStatusAr(statusUpdate.newStatus)}

<b>العميل:</b> ${order.customerName}
<b>الهاتف:</b> ${order.customerPhone}

<b>المنتجات:</b>
${items}

<b>الإجمالي:</b> ${Math.round(order.total)} دينار${addressText}`;
  }

  return `<b>طلب جديد #${order.orderNumber}</b>

<b>العميل:</b> ${order.customerName}
<b>الهاتف:</b> ${order.customerPhone}

<b>المنتجات:</b>
${items}

<b>الإجمالي:</b> ${Math.round(order.total)} دينار${addressText}`;
}

/**
 * Get Arabic status name
 */
function getStatusAr(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'قيد الانتظار',
    'confirmed': 'تم التأكيد',
    'processing': 'قيد المعالجة',
    'shipped': 'تم الشحن',
    'delivered': 'تم التوصيل',
    'cancelled': 'ملغي',
    'refunded': 'مسترد',
  };
  return statusMap[status] || status;
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
  const emailSection = email && email.trim() !== '' ? `<b>البريد:</b> ${email}\n` : '';
  
  return `<b>رسالة جديدة من صفحة التواصل</b>

<b>الاسم:</b> ${name}
<b>الهاتف:</b> ${phone}
${emailSection}<b>الموضوع:</b> ${subject}

<b>الرسالة:</b>
${message}`;
}

/**
 * Test Telegram connection
 * Uses botToken and chatId from parameters (for testing only)
 */
export async function testTelegramConnection(botToken: string, chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken.trim()}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: '✅ اختبار الاتصال - الرسالة وصلت بنجاح!',
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();
    
    if (data.ok) {
      return { success: true, message: 'تم إرسال الرسالة بنجاح!' };
    } else {
      return { success: false, message: data.description || 'فشل الإرسال' };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'حدث خطأ' };
  }
}