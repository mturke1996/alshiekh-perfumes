import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MapPin, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageCircle,
  Clock,
  ChevronLeft,
  Send,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sendContactMessageToTelegram } from '../utils/telegram';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('يرجى إدخال الاسم');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('يرجى إدخال الموضوع');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('يرجى إدخال الرسالة');
      return;
    }

    setLoading(true);

    try {
      // Save to Firestore
      await addDoc(collection(db, 'contactMessages'), {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        read: false,
        replied: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Send to Telegram
      toast.loading('جاري إرسال الرسالة...', { id: 'sending-message' });
      const telegramSent = await sendContactMessageToTelegram(
        formData.name.trim(),
        formData.phone.trim(),
        formData.email.trim() || undefined,
        formData.subject.trim(),
        formData.message.trim()
      );

      toast.dismiss('sending-message');

      if (telegramSent) {
        toast.success('✅ تم إرسال الرسالة بنجاح! سنتواصل معك قريباً');
      } else {
        toast.success('✅ تم حفظ الرسالة بنجاح! (ملاحظة: فشل إرسال إشعار Telegram)');
      }

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      console.error('Error sending contact message:', error);
      toast.dismiss('sending-message');
      
      let errorMessage = 'حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.';
      if (error?.code === 'permission-denied') {
        errorMessage = 'ليس لديك صلاحية لإرسال الرسالة. تحقق من إعدادات Firestore.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">تواصل معنا</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-maroon-600 to-brand-maroon-700 mb-4 shadow-lg">
            <MessageCircle className="text-white" size={36} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">نحن هنا لمساعدتك</h2>
          <p className="text-gray-600">تواصل معنا على مدار الساعة</p>
        </motion.div>

        {/* Contact Cards */}
        <div className="space-y-4">
          {/* Phone */}
          <motion.a
            href="tel:+218915080707"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.98 }}
            className="block bg-gradient-to-br from-brand-maroon-50 to-brand-maroon-100 rounded-3xl p-6 border-2 border-brand-maroon-200 shadow-lg active:bg-brand-maroon-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-maroon-600 to-brand-maroon-700 flex items-center justify-center shadow-xl flex-shrink-0">
                <Phone className="text-white" size={28} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-gray-600 mb-1">الهاتف</p>
                <p className="text-2xl font-bold text-gray-900">091 508 0707</p>
                <p className="text-xs text-gray-500 mt-1">اضغط للاتصال</p>
              </div>
            </div>
          </motion.a>

          {/* Address */}
          <motion.a
            href="https://maps.google.com/?q=تاج+مول+تاجوراء"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.98 }}
            className="block bg-gradient-to-br from-brand-gold-50 to-brand-gold-100 rounded-3xl p-6 border-2 border-brand-gold-200 shadow-lg active:bg-brand-gold-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-gold-600 to-brand-gold-700 flex items-center justify-center shadow-xl flex-shrink-0">
                <MapPin className="text-white" size={28} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-gray-600 mb-1">العنوان</p>
                <p className="text-lg font-bold text-gray-900 leading-relaxed">
                  تاج مول - الطابق الأرضي<br />
                  جزيرة الأندلسي - تاجوراء
                </p>
                <p className="text-xs text-gray-500 mt-1">اضغط لفتح الخريطة</p>
              </div>
            </div>
          </motion.a>

          {/* Email */}
          <motion.a
            href="mailto:info@alshiekhparfumes.com"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
            className="block bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200 shadow-lg active:bg-blue-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl flex-shrink-0">
                <Mail className="text-white" size={28} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
                <p className="text-xl font-bold text-gray-900">info@alshiekhparfumes.com</p>
                <p className="text-xs text-gray-500 mt-1">اضغط لإرسال بريد</p>
              </div>
            </div>
          </motion.a>

          {/* Working Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-xl flex-shrink-0">
                <Clock className="text-white" size={28} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-gray-600 mb-1">ساعات العمل</p>
                <p className="text-lg font-bold text-gray-900">يومياً: 9:00 صباحاً - 11:00 مساءً</p>
                <p className="text-xs text-gray-500 mt-1">نخدمك على مدار الأسبوع</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-xl"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">أرسل لنا رسالة</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                placeholder="0912345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموضوع <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                placeholder="موضوع الرسالة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرسالة <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 resize-none"
                placeholder="اكتب رسالتك هنا..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>إرسال الرسالة</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-xl"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">تابعنا على</h3>
          <div className="flex items-center justify-center gap-4">
            <motion.a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <Facebook className="text-white" size={28} />
            </motion.a>

            <motion.a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <Instagram className="text-white" size={28} />
            </motion.a>

            <motion.a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <Twitter className="text-white" size={28} />
            </motion.a>

            <motion.a
              href="https://wa.me/218915080707"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <MessageCircle className="text-white" size={28} />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
