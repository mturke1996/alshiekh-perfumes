import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, SiteSettings, TelegramChat } from '../types/perfume-shop';

/**
 * Send order notification to Telegram
 */
export async function sendTelegramOrderNotification(order: Order, statusUpdate?: { oldStatus: string; newStatus: string }): Promise<boolean> {
  try {
    console.log('🔍 جاري التحقق من إعدادات Telegram...');
    
    // Get Telegram settings from Firestore
    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    if (!settingsDoc.exists()) {
      console.error('❌ Telegram: مستند الإعدادات غير موجود في Firestore');
      return false;
    }

    const settings = settingsDoc.data() as SiteSettings;
    const botToken = settings.telegramBotToken;

    if (!botToken || botToken.trim() === '') {
      console.error('❌ Telegram: Bot Token غير موجود أو فارغ. يرجى إضافته في الإعدادات');
      return false;
    }

    console.log('✅ تم العثور على Bot Token');

    // Get active telegram chats
    let activeChats: TelegramChat[] = [];
    try {
      const chatsSnapshot = await getDocs(
        query(collection(db, 'telegramChats'), where('active', '==', true))
      );

      activeChats = chatsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TelegramChat[];
    } catch (chatsError) {
      // If error getting chats, continue with fallback
      activeChats = [];
    }

    // Format order message
    const message = formatOrderMessage(order, statusUpdate);
    
    // Validate message is not empty
    if (!message || message.trim() === '') {
      console.error('❌ Telegram: الرسالة فارغة');
      return false;
    }

    console.log(`📝 تم إنشاء الرسالة (${message.length} حرف)`);

    // If we have active chats, send to all of them
    if (activeChats.length > 0) {
      console.log(`📬 إرسال إلى ${activeChats.length} محادثة نشطة...`);
      const sendPromises = activeChats.map((chat, index) => {
        const chatId = chat.chatId;
        if (chatId) {
          // Handle both string and number chat IDs
          if (typeof chatId === 'string' && chatId.trim() !== '') {
            console.log(`📤 إرسال إلى Chat ID: ${chatId.substring(0, 5)}...`);
            return sendToChat(botToken, chatId, message);
          } else if (typeof chatId === 'number') {
            console.log(`📤 إرسال إلى Chat ID (رقم): ${chatId}`);
            return sendToChat(botToken, chatId, message);
          }
        }
        return Promise.resolve(false);
      });

      const results = await Promise.allSettled(sendPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      if (successCount > 0) {
        console.log(`✅ تم الإرسال بنجاح إلى ${successCount} محادثة`);
        return true;
      } else {
        console.warn('⚠️ فشل الإرسال إلى جميع المحادثات النشطة');
      }
    }

    // Fallback to old chatId if exists and no active chats succeeded
    const chatId = settings.telegramChatId;
    if (chatId) {
      console.log('🔄 استخدام Chat ID الاحتياطي...');
      // Handle both string and number chat IDs
      if (typeof chatId === 'string' && chatId.trim() !== '') {
        console.log(`📤 إرسال إلى Chat ID احتياطي: ${chatId.substring(0, 5)}...`);
        const result = await sendToChat(botToken, chatId, message);
        if (result) {
          console.log('✅ تم الإرسال بنجاح إلى Chat ID الاحتياطي');
        } else {
          console.error('❌ فشل الإرسال إلى Chat ID الاحتياطي');
        }
        return result;
      } else if (typeof chatId === 'number') {
        console.log(`📤 إرسال إلى Chat ID احتياطي (رقم): ${chatId}`);
        const result = await sendToChat(botToken, chatId, message);
        if (result) {
          console.log('✅ تم الإرسال بنجاح إلى Chat ID الاحتياطي');
        } else {
          console.error('❌ فشل الإرسال إلى Chat ID الاحتياطي');
        }
        return result;
      }
    }

    console.error('❌ Telegram: لا توجد محادثات نشطة أو Chat ID في الإعدادات');
    console.error('💡 يرجى إضافة telegramChatId في Firebase → settings → general');
    return false;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Telegram: Error in sendTelegramOrderNotification:', error);
    }
    return false;
  }
}

async function sendToChat(botToken: string, chatId: string | number, message: string, retryCount = 0): Promise<boolean> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  try {
    // Validate inputs
    if (!botToken || typeof botToken !== 'string' || botToken.trim() === '') {
      console.error('❌ Telegram: Bot Token غير صحيح');
      return false;
    }

    // Chat ID can be a string or number
    if (!chatId || (typeof chatId === 'string' && chatId.trim() === '')) {
      console.error('❌ Telegram: Chat ID غير صحيح');
      return false;
    }

    // Clean bot token
    const cleanBotToken = botToken.trim();
    
    // Convert chat ID to string if it's a number, otherwise trim it
    const cleanChatId = typeof chatId === 'number' ? chatId.toString() : chatId.trim();

    // Ensure message is not empty
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.error('❌ Telegram: الرسالة فارغة');
      return false;
    }

    const cleanMessage = message.trim();

    if (retryCount > 0) {
      console.log(`🔄 إعادة المحاولة ${retryCount}/${MAX_RETRIES}...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
    } else {
      console.log('🌐 جاري الاتصال بـ Telegram API...');
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${cleanBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: cleanChatId,
            text: cleanMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Get response data
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Log error details
        if (data) {
          console.error('❌ Telegram API Error:', {
            error_code: data.error_code,
            description: data.description,
            chat_id: cleanChatId.substring(0, 5) + '...',
          });
          
          // Retry on certain errors
          if (retryCount < MAX_RETRIES && (
            data.error_code === 429 || // Too many requests
            data.error_code === 500 || // Server error
            data.error_code === 502 || // Bad gateway
            data.error_code === 503    // Service unavailable
          )) {
            console.log(`⏳ خطأ مؤقت، إعادة المحاولة...`);
            return await sendToChat(botToken, chatId, message, retryCount + 1);
          }
          
          // Common error messages in Arabic
          if (data.error_code === 401) {
            console.error('💡 المشكلة: Bot Token غير صحيح أو غير مفعل');
            console.error('💡 الحل: تحقق من Bot Token في Firebase → settings → general');
          } else if (data.error_code === 400) {
            console.error('💡 المشكلة: Chat ID غير صحيح. تأكد من إرسال رسالة للبوت أولاً');
            console.error('💡 الحل: أرسل /start للبوت أولاً، ثم احصل على Chat ID');
          } else if (data.error_code === 403) {
            console.error('💡 المشكلة: البوت محظور من إرسال رسائل لهذا Chat ID');
            console.error('💡 الحل: ألغِ حظر البوت أو استخدم Chat ID آخر');
          }
        } else {
          console.error('❌ Telegram: خطأ في الاتصال بالخادم');
          // Retry on network errors
          if (retryCount < MAX_RETRIES) {
            return await sendToChat(botToken, chatId, message, retryCount + 1);
          }
        }
        return false;
      }

      // Verify response is successful
      if (data && data.ok === true && data.result) {
        console.log('✅ تم إرسال الرسالة بنجاح إلى Telegram');
        return true;
      }

      console.error('❌ Telegram: استجابة غير متوقعة من API');
      return false;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ Telegram: انتهت مهلة الاتصال (Timeout)');
        if (retryCount < MAX_RETRIES) {
          return await sendToChat(botToken, chatId, message, retryCount + 1);
        }
      } else {
        throw fetchError;
      }
      return false;
    }
  } catch (error: any) {
    console.error('❌ Telegram: خطأ في الاتصال:', error.message);
    
    // Retry on network errors
    if (retryCount < MAX_RETRIES && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('timeout')
    )) {
      console.log(`⏳ خطأ في الشبكة، إعادة المحاولة...`);
      return await sendToChat(botToken, chatId, message, retryCount + 1);
    }
    
    console.error('💡 تأكد من الاتصال بالإنترنت');
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

  // Validate order data
  if (!order.items || order.items.length === 0) {
    return '⚠️ طلب بدون منتجات';
  }

  const itemsList = order.items
    .map(
      (item, index) =>
        `${index + 1}. <b>${item.productNameAr || item.productName || 'منتج'}</b>\n   📦 ${item.quantity || 1} × ${(item.price || 0).toFixed(0)} د.ل = ${((item.quantity || 1) * (item.price || 0)).toFixed(0)} د.ل`
    )
    .join('\n');

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

  // Handle createdAt - it might be a Timestamp object or a Date
  let orderDate: Date;
  if (order.createdAt) {
    if (typeof order.createdAt === 'object' && 'toDate' in order.createdAt) {
      // Firestore Timestamp
      orderDate = (order.createdAt as any).toDate();
    } else if (order.createdAt instanceof Date) {
      // Already a Date object
      orderDate = order.createdAt;
    } else if (typeof order.createdAt === 'number') {
      // Timestamp in milliseconds
      orderDate = new Date(order.createdAt);
    } else {
      // Fallback to current date
      orderDate = new Date();
    }
  } else {
    orderDate = new Date();
  }

  const formattedDate = orderDate.toLocaleString('ar-LY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `🎉 <b>طلب جديد</b> ${deliveryTypeEmoji}

📦 <b>رقم الطلب:</b> <code>#${order.orderNumber}</code>
📅 <b>التاريخ:</b> ${formattedDate}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
👤 <b>معلومات العميل</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
• الاسم: <b>${order.customerName}</b>
• الهاتف: <code>${order.customerPhone}</code>
${order.customerEmail ? `• البريد: ${order.customerEmail}` : ''}

${isPickup ? `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
🏪 <b>الاستلام من المتجر</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
📍 ${order.shippingAddress.city || 'العنوان من الإعدادات'}` : `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
🚚 <b>عنوان التوصيل</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
• المستلم: <b>${order.shippingAddress.fullName}</b>
• العنوان: ${order.shippingAddress.addressLine1}
${order.shippingAddress.city ? `• المدينة: ${order.shippingAddress.city}` : ''}
${order.shippingAddress.phone ? `• هاتف المستلم: <code>${order.shippingAddress.phone}</code>` : ''}
${order.shippingAddress.addressLine2 ? `• ملاحظات: ${order.shippingAddress.addressLine2}` : ''}`}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
🛒 <b>المنتجات (${order.items.length})</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
${itemsList}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
💰 <b>الإجماليات</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
• المجموع الفرعي: ${order.subtotal.toFixed(0)} د.ل
${order.discount > 0 ? `• الخصم: <b>-${order.discount.toFixed(0)} د.ل</b>` : ''}
${order.shippingCost > 0 ? `• الشحن: ${order.shippingCost.toFixed(0)} د.ل` : ''}
${order.tax > 0 ? `• الضريبة: ${order.tax.toFixed(0)} د.ل` : ''}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
💵 <b>الإجمالي النهائي: ${order.total.toFixed(0)} د.ل</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

💳 <b>طريقة الدفع:</b> ${paymentLabels[order.paymentMethod] || order.paymentMethod}
📊 <b>الحالة:</b> ${statusLabels[order.status] || order.status}
${order.customerNote ? `\n\n📝 <b>ملاحظة العميل:</b>\n${order.customerNote}` : ''}

${isPickup ? '✅ سيتم الاستلام من المتجر' : '✅ سيتم التوصيل إلى العنوان المحدد'}`;
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

  return `${statusEmoji} <b>تحديث حالة الطلب</b>

📦 <b>رقم الطلب:</b> <code>#${order.orderNumber}</code>
👤 <b>العميل:</b> ${order.customerName}
📞 <b>الهاتف:</b> <code>${order.customerPhone}</code>

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
📊 <b>تغيير الحالة</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
• من: ${oldStatusLabel}
• إلى: <b>${newStatusLabel}</b>

💰 <b>الإجمالي:</b> ${order.total.toFixed(0)} د.ل
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
${isPositiveUpdate ? '✅ تم التحديث بنجاح' : isNegativeUpdate ? '⚠️ تم تحديث الحالة' : '📊 تم التحديث'}`;
}

/**
 * Test Telegram connection
 */
export async function testTelegramConnection(botToken: string, chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🧪 بدء اختبار اتصال Telegram...');
    
    if (!botToken || botToken.trim() === '') {
      return { success: false, message: 'Bot Token فارغ' };
    }

    if (!chatId || chatId.trim() === '') {
      return { success: false, message: 'Chat ID فارغ' };
    }

    // First, test bot token by getting bot info
    console.log('🔍 التحقق من Bot Token...');
    const botInfoResponse = await fetch(
      `https://api.telegram.org/bot${botToken.trim()}/getMe`
    );

    if (!botInfoResponse.ok) {
      const errorData = await botInfoResponse.json().catch(() => ({}));
      if (errorData.error_code === 401) {
        return { success: false, message: 'Bot Token غير صحيح أو غير مفعل' };
      }
      return { success: false, message: 'فشل التحقق من Bot Token' };
    }

    const botInfo = await botInfoResponse.json();
    console.log('✅ Bot Token صحيح:', botInfo.result?.username || 'غير معروف');

    // Then test sending message
    console.log('📤 إرسال رسالة اختبار...');
    const response = await fetch(
      `https://api.telegram.org/bot${botToken.trim()}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: '✅ تم الاتصال بنجاح! إشعارات Telegram تعمل بشكل صحيح.\n\nهذه رسالة اختبار من متجر الشيخ للعطور.',
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (data) {
        if (data.error_code === 400) {
          return { success: false, message: 'Chat ID غير صحيح. تأكد من إرسال رسالة للبوت أولاً' };
        } else if (data.error_code === 403) {
          return { success: false, message: 'البوت محظور من إرسال رسائل لهذا Chat ID' };
        }
        return { success: false, message: data.description || 'فشل إرسال الرسالة' };
      }
      return { success: false, message: 'فشل إرسال الرسالة' };
    }

    if (data && data.ok === true) {
      console.log('✅ تم إرسال رسالة الاختبار بنجاح');
      return { success: true, message: 'تم الاتصال بنجاح! الرسالة وصلت إلى Telegram' };
    }

    return { success: false, message: 'استجابة غير متوقعة من API' };
  } catch (error: any) {
    console.error('❌ خطأ في اختبار الاتصال:', error);
    return { success: false, message: `خطأ في الاتصال: ${error.message}` };
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
      return false;
    }

    const settings = settingsDoc.data() as SiteSettings;
    const botToken = settings.telegramBotToken;

    if (!botToken) {
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

    // Format contact message
    const formattedMessage = formatContactMessage(name, phone, email, subject, message);

    // If we have active chats, send to all of them
    if (activeChats.length > 0) {
      const sendPromises = activeChats.map(chat => {
        const chatId = chat.chatId;
        if (chatId) {
          // Handle both string and number chat IDs
          if (typeof chatId === 'string' && chatId.trim() !== '') {
            return sendToChat(botToken, chatId, formattedMessage);
          } else if (typeof chatId === 'number') {
            return sendToChat(botToken, chatId, formattedMessage);
          }
        }
        return Promise.resolve(false);
      });

      const results = await Promise.allSettled(sendPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      if (successCount > 0) {
        return true;
      }
    }

    // Fallback to old chatId if exists and no active chats succeeded
    const chatId = settings.telegramChatId;
    if (chatId) {
      // Handle both string and number chat IDs
      if (typeof chatId === 'string' && chatId.trim() !== '') {
        return await sendToChat(botToken, chatId, formattedMessage);
      } else if (typeof chatId === 'number') {
        return await sendToChat(botToken, chatId, formattedMessage);
      }
    }

    return false;
  } catch (error) {
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
  const formattedDate = new Date().toLocaleString('ar-LY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `📧 <b>رسالة تواصل جديدة</b>

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
👤 <b>معلومات المرسل</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
• الاسم: <b>${name}</b>
• الهاتف: <code>${phone}</code>
${email ? `• البريد: ${email}` : ''}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
📌 <b>الموضوع</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
${subject}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
💬 <b>الرسالة</b>
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
${message}

⏰ <b>التاريخ:</b> ${formattedDate}`;
}

