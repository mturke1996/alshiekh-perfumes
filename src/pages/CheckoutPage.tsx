import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Truck,
  CreditCard,
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/helpers';
import { collection, addDoc, Timestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, SiteSettings } from '../types/perfume-shop';
import { sendTelegramOrderNotification } from '../utils/telegram';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Form state
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash-on-delivery' | 'credit-card' | 'bank-transfer'>('cash-on-delivery');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }

    // Load settings for shipping cost
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as SiteSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, [items, navigate]);

  const total = getTotal();
  const shippingCost = deliveryType === 'delivery' ? (settings?.shippingCost || 0) : 0;
  const subtotal = total;
  const discount = 0;
  const tax = 0;
  const finalTotal = subtotal + shippingCost + tax - discount;

  // Generate sequential order number starting from 1
  const generateOrderNumber = async (): Promise<string> => {
    try {
      // Get all orders to find the highest order number
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);

      let maxNumber = 0;

      snapshot.docs.forEach((doc) => {
        const order = doc.data() as Order;
        const orderNumber = order.orderNumber;

        if (!orderNumber) return;

        // Extract numeric part - prioritize simple sequential numbers: 1, 2, 3, 4...
        // First try parsing as simple number (1, 2, 3...)
        const simpleNumber = parseInt(orderNumber, 10);
        if (!isNaN(simpleNumber) && simpleNumber > 0 && simpleNumber < 10000 && simpleNumber > maxNumber) {
          maxNumber = simpleNumber;
          return; // Found simple number, move to next order
        }
        
        // If not simple number, try extracting from end (for formats like "ORD-123")
        const match = orderNumber.match(/(\d+)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          // Only consider reasonable sequential numbers (ignore timestamps > 10000)
          if (!isNaN(number) && number > 0 && number < 10000 && number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      // Return next sequential number (start from 1 if no orders found)
      const nextNumber = maxNumber + 1;
      console.log('Generated order number:', nextNumber, '(max found:', maxNumber, ')');
      return nextNumber.toString();
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback: try to get count of orders
      try {
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef);
        const count = snapshot.size + 1;
        console.log('Fallback: Using order count:', count);
        return count.toString();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        // Return 1 as last resort if everything fails
        return '1';
      }
    }
  };

  // Validate Libyan phone number
  const validateLibyanPhone = (phone: string): boolean => {
    // Remove spaces, dashes, and any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if starts with 091, 092, 093, or 094
    if (!/^(091|092|093|094)/.test(cleaned)) {
      return false;
    }
    
    // Accept 9 or 10 digits total
    // 9 digits: 091 + 6 numbers = 9 total
    // 10 digits: some numbers might have 7 numbers after prefix
    return cleaned.length === 9 || cleaned.length === 10;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔵 Form submitted with data:', {
      customerName,
      customerPhone,
      deliveryType,
      address: shippingAddress.addressLine1,
      itemsCount: items.length,
    });

    // Validate required fields
    if (!customerName.trim()) {
      toast.error('يرجى إدخال الاسم');
      console.error('❌ Validation failed: Name is empty');
      return;
    }

    if (!customerPhone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      console.error('❌ Validation failed: Phone is empty');
      return;
    }

    // Validate phone number
    const cleanedPhone = customerPhone.trim();
    if (!validateLibyanPhone(cleanedPhone)) {
      toast.error('رقم الهاتف غير صحيح. يجب أن يبدأ بـ 091 أو 092 أو 093 أو 094');
      console.error('❌ Validation failed: Invalid phone format', cleanedPhone);
      return;
    }

    // Only require address if delivery is selected
    if (deliveryType === 'delivery' && !shippingAddress.addressLine1.trim()) {
      toast.error('يرجى إدخال عنوان التوصيل');
      console.error('❌ Validation failed: Address is empty for delivery');
      return;
    }

    // Check if cart has items
    if (!items || items.length === 0) {
      toast.error('السلة فارغة. يرجى إضافة منتجات أولاً');
      console.error('❌ Validation failed: Cart is empty');
      return;
    }

    console.log('✅ All validations passed, starting order creation...');
    setLoading(true);

    try {
      const orderNumber = await generateOrderNumber();

      const orderData: Omit<Order, 'id'> = {
        userId: user?.uid || 'guest',
        orderNumber,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productNameAr: item.product.nameAr || item.product.name,
          productImage: item.product.thumbnail || item.product.images[0] || '',
          price: item.product.discount
            ? item.product.price - (item.product.price * item.product.discount / 100)
            : item.product.price,
          quantity: item.quantity,
          discount: item.product.discount || 0,
        })),
        subtotal,
        discount,
        shippingCost,
        tax,
        total: finalTotal,
        shippingAddress: deliveryType === 'delivery' ? {
          fullName: customerName,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'ليبيا',
          phone: customerPhone,
        } : {
          fullName: customerName,
          addressLine1: 'استلام من المتجر',
          addressLine2: '',
          city: settings?.address || '',
          state: '',
          zipCode: '',
          country: 'ليبيا',
          phone: customerPhone,
        },
        shippingMethod: deliveryType === 'delivery' ? 'standard' : 'same-day',
        paymentMethod,
        paymentStatus: paymentMethod === 'cash-on-delivery' ? 'pending' : 'pending',
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          timestamp: Timestamp.now(),
          note: 'تم إنشاء الطلب',
        }],
        customerName,
        customerEmail: '', // Not used anymore
        customerPhone,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Remove undefined fields (Firestore doesn't accept undefined)
      const cleanOrderData: any = {};
      Object.keys(orderData).forEach((key) => {
        const value = orderData[key as keyof typeof orderData];
        if (value !== undefined && value !== null) {
          cleanOrderData[key] = value;
        }
      });

      console.log('📦 Creating order with data:', {
        orderNumber,
        itemsCount: orderData.items.length,
        total: orderData.total,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryType,
        address: orderData.shippingAddress.addressLine1,
      });

      toast.loading('جاري حفظ الطلب في قاعدة البيانات...', { id: 'creating-order' });
      const docRef = await addDoc(collection(db, 'orders'), cleanOrderData);
      console.log('✅ Order created successfully with ID:', docRef.id, 'Order Number:', orderNumber);

      // Send Telegram notification
      toast.loading('جاري إرسال الإشعار إلى Telegram...', { id: 'creating-order' });
      let telegramSent = false;
      try {
        const orderWithId: Order = {
          id: docRef.id,
          ...cleanOrderData,
        } as Order;
        
        console.log('📤 Sending Telegram notification for order:', orderNumber);
        const telegramResult = await sendTelegramOrderNotification(orderWithId);
        telegramSent = telegramResult;
        
        if (telegramSent) {
          console.log('✅ Telegram notification sent successfully');
        } else {
          console.warn('⚠️ Telegram notification returned false - check bot token and chat IDs');
        }
      } catch (telegramError: any) {
        console.error('❌ Error sending Telegram notification:', telegramError);
        console.error('Telegram error details:', {
          message: telegramError?.message,
          code: telegramError?.code,
        });
        telegramSent = false;
      }

      toast.dismiss('creating-order');
      
      // Always show success even if Telegram failed
      toast.success(`✅ تم إنشاء الطلب بنجاح!\nرقم الطلب: ${orderNumber}`, { duration: 5000 });
      
      // Log Telegram status separately
      if (!telegramSent) {
        console.warn('⚠️ Telegram notification was not sent - check bot token and active chats');
      }
      
      // Clear cart
      clearCart();
      
      // Navigate to success page or home
      setTimeout(() => {
        navigate('/');
      }, 2500);

    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      });
      
      // More specific error messages
      let errorMessage = 'حدث خطأ في إنشاء الطلب. يرجى المحاولة مرة أخرى.';
      
      if (error?.code === 'permission-denied') {
        errorMessage = 'ليس لديك صلاحية لإنشاء الطلب. تحقق من إعدادات Firestore.';
      } else if (error?.code === 'unavailable') {
        errorMessage = 'الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً.';
      } else if (error?.code === 'failed-precondition') {
        errorMessage = 'فشل الشرط المسبق. تحقق من البيانات المدخلة.';
      } else if (error?.code === 'invalid-argument') {
        errorMessage = 'البيانات المدخلة غير صحيحة. يرجى التحقق من جميع الحقول.';
      } else if (error?.message) {
        errorMessage = `خطأ: ${error.message}`;
      }
      
      toast.error(errorMessage, { duration: 5000 });
      
      // Log full error for debugging
      if (error?.code || error?.message) {
        console.error('Full error object:', JSON.stringify(error, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">إتمام الطلب</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-6 px-4 py-6">
        {/* Delivery Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="text-brand-maroon-600" size={20} />
            طريقة الاستلام
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDeliveryType('delivery')}
              className={`p-4 rounded-xl border-2 transition-all ${
                deliveryType === 'delivery'
                  ? 'border-brand-maroon-600 bg-brand-maroon-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <Truck className={`mx-auto mb-2 ${deliveryType === 'delivery' ? 'text-brand-maroon-600' : 'text-gray-400'}`} size={24} />
              <p className={`font-bold ${deliveryType === 'delivery' ? 'text-brand-maroon-600' : 'text-gray-700'}`}>
                التوصيل
              </p>
              {settings?.shippingCost && (
                <p className="text-xs text-gray-500 mt-1">
                  {settings.shippingCost} د.ل
                </p>
              )}
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('pickup')}
              className={`p-4 rounded-xl border-2 transition-all ${
                deliveryType === 'pickup'
                  ? 'border-brand-maroon-600 bg-brand-maroon-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <Package className={`mx-auto mb-2 ${deliveryType === 'pickup' ? 'text-brand-maroon-600' : 'text-gray-400'}`} size={24} />
              <p className={`font-bold ${deliveryType === 'pickup' ? 'text-brand-maroon-600' : 'text-gray-700'}`}>
                استلام من المتجر
              </p>
              <p className="text-xs text-gray-500 mt-1">مجاناً</p>
            </button>
          </div>
        </motion.div>

        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="text-brand-maroon-600" size={20} />
            معلومات العميل
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                placeholder="أدخل اسمك الكامل"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  // Allow only numbers, spaces, and dashes
                  const value = e.target.value.replace(/[^\d\s-]/g, '');
                  setCustomerPhone(value);
                }}
                maxLength={13}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                placeholder="0912345678"
              />
              <p className="text-xs text-gray-500 mt-1">يجب أن يبدأ بـ 091 أو 092 أو 093 أو 094 (9-10 أرقام)</p>
            </div>
          </div>
        </motion.div>

        {/* Shipping Address - Only if delivery - Simplified */}
        {deliveryType === 'delivery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-brand-maroon-600" size={20} />
              عنوان التوصيل
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={shippingAddress.addressLine1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                  placeholder="أدخل العنوان الكامل (الشارع، المنطقة، المدينة)"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="text-brand-maroon-600" size={20} />
            طريقة الدفع
          </h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash-on-delivery')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                paymentMethod === 'cash-on-delivery'
                  ? 'border-brand-maroon-600 bg-brand-maroon-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-bold ${paymentMethod === 'cash-on-delivery' ? 'text-brand-maroon-600' : 'text-gray-700'}`}>
                    الدفع عند الاستلام
                  </p>
                  <p className="text-xs text-gray-500 mt-1">ادفع نقداً عند {deliveryType === 'delivery' ? 'التوصيل' : 'الاستلام'}</p>
                </div>
                {paymentMethod === 'cash-on-delivery' && (
                  <CheckCircle2 className="text-brand-maroon-600" size={24} />
                )}
              </div>
            </button>
          </div>
        </motion.div>

        {/* Compact Order Summary & Submit Button */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">الإجمالي:</span>
            <span className="text-xl font-bold text-brand-maroon-600">
              {formatCurrency(finalTotal, 'LYD')}
            </span>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>جاري إنشاء الطلب...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={22} />
                <span>تأكيد الطلب</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
