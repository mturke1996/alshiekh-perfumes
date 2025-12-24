import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Bot,
  Save,
  Key,
  MessageSquare,
  Globe,
  Shield,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { SiteSettings } from '../../types/perfume-shop';
import toast from 'react-hot-toast';

export default function MobileSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    storeName: 'ALSHIEKH PARFUMES',
    storeNameAr: 'الشيخ للعطور',
    email: '',
    phone: '',
    currency: 'LYD',
    currencySymbol: 'د.ل',
    telegramBotToken: '',
    telegramChatId: '',
    emailNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as SiteSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const settingsRef = doc(db, 'settings', 'general');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const SettingSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-brand-maroon-100 rounded-lg">
          <Icon size={18} className="text-brand-maroon-600" />
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  const InputField = ({ label, value, onChange, type = 'text', placeholder, icon: Icon }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    icon?: any;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pr-10' : 'pr-3'} pl-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500`}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-1">الإعدادات</h2>
        <p className="text-sm text-gray-500">إدارة إعدادات المتجر</p>
      </motion.div>

      {/* Store Information */}
      <SettingSection title="معلومات المتجر" icon={Globe}>
        <InputField
          label="اسم المتجر (عربي)"
          value={settings.storeNameAr || ''}
          onChange={(value) => setSettings({ ...settings, storeNameAr: value })}
          placeholder="الشيخ للعطور"
        />
        <InputField
          label="اسم المتجر (إنجليزي)"
          value={settings.storeName || ''}
          onChange={(value) => setSettings({ ...settings, storeName: value })}
          placeholder="ALSHIEKH PARFUMES"
        />
      </SettingSection>

      {/* Contact Information */}
      <SettingSection title="معلومات الاتصال" icon={Phone}>
        <InputField
          label="البريد الإلكتروني"
          value={settings.email || ''}
          onChange={(value) => setSettings({ ...settings, email: value })}
          type="email"
          placeholder="info@alshiekh.com"
          icon={Mail}
        />
        <InputField
          label="رقم الهاتف"
          value={settings.phone || ''}
          onChange={(value) => setSettings({ ...settings, phone: value })}
          type="tel"
          placeholder="091 508 0707"
          icon={Phone}
        />
        <InputField
          label="العنوان"
          value={settings.address || ''}
          onChange={(value) => setSettings({ ...settings, address: value })}
          placeholder="تاج مول - الطابق الأرضي"
          icon={MapPin}
        />
      </SettingSection>

      {/* Telegram Integration */}
      <SettingSection title="تكامل Telegram" icon={Bot}>
        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700 mb-2">
            لإعداد Telegram Bot:
          </p>
          <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
            <li>افتح @BotFather على Telegram</li>
            <li>أرسل /newbot واتبع التعليمات</li>
            <li>انسخ الـ Token الذي ستحصل عليه</li>
            <li>احصل على Chat ID من @userinfobot</li>
          </ol>
        </div>
        <InputField
          label="Telegram Bot Token"
          value={settings.telegramBotToken || ''}
          onChange={(value) => setSettings({ ...settings, telegramBotToken: value })}
          type="password"
          placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
          icon={Key}
        />
        <InputField
          label="Telegram Chat ID"
          value={settings.telegramChatId || ''}
          onChange={(value) => setSettings({ ...settings, telegramChatId: value })}
          placeholder="123456789"
          icon={MessageSquare}
        />
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="الإشعارات" icon={Bell}>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-900">إشعارات البريد الإلكتروني</p>
            <p className="text-xs text-gray-500">تلقي إشعارات على البريد الإلكتروني</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.emailNotifications ? 'bg-brand-maroon-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </SettingSection>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={saveSettings}
        disabled={saving}
        className="w-full py-4 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>جاري الحفظ...</span>
          </>
        ) : (
          <>
            <Save size={20} />
            <span>حفظ الإعدادات</span>
          </>
        )}
      </motion.button>
    </div>
  );
}

