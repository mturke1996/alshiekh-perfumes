import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Save,
  Globe,
  Shield,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  X,
  Trash2,
  Loader2,
  Upload,
} from "lucide-react";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { SiteSettings } from "../../types/perfume-shop";
import { uploadMultipleImagesToImgBB } from "../../utils/imgbb";
import toast from "react-hot-toast";

// Gemini API Key Component
function GeminiApiKeySection() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const apiKeyDoc = await getDoc(doc(db, "apiKeys", "gemini"));
      if (apiKeyDoc.exists()) {
        setApiKey(apiKeyDoc.data().key || "");
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async () => {
    try {
      setSaving(true);
      await setDoc(
        doc(db, "apiKeys", "gemini"),
        { key: apiKey, updatedAt: Timestamp.now() },
        { merge: true }
      );
      toast.success("تم حفظ Gemini API Key بنجاح");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("حدث خطأ في حفظ API Key");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gemini API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="أدخل Gemini API Key"
          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          احصل على API Key من{" "}
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-maroon-600 hover:underline"
          >
            Google AI Studio
          </a>
        </p>
      </div>
      <button
        type="button"
        onClick={saveApiKey}
        disabled={saving}
        className="w-full px-4 py-2 bg-brand-maroon-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
      >
        {saving ? "جاري الحفظ..." : "حفظ API Key"}
      </button>
    </div>
  );
}

export default function MobileSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    storeName: "ALSHIEKH PARFUMES",
    storeNameAr: "الشيخ للعطور",
    email: "",
    phone: "",
    currency: "LYD",
    currencySymbol: "د.ل",
    emailNotifications: true,
    heroImages: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHeroImages, setUploadingHeroImages] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsDoc = await getDoc(doc(db, "settings", "general"));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as SiteSettings;
        setSettings({
          ...settings,
          ...data,
          heroImages: data.heroImages || [],
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const settingsRef = doc(db, "settings", "general");

      await setDoc(
        settingsRef,
        {
          ...settings,
          heroImages: settings.heroImages || [],
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      // Force reload hero images in carousel
      window.dispatchEvent(new CustomEvent("heroImagesUpdated"));

      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("حدث خطأ في حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageUpload = async (files: File[]) => {
    try {
      if (files.length > 5) {
        toast.error("يمكنك رفع 5 صور كحد أقصى");
        return;
      }

      setUploadingHeroImages(true);
      toast.loading("جاري رفع الصور إلى imgBB...", { id: "upload-hero" });

      const urls = await uploadMultipleImagesToImgBB(files.slice(0, 5));
      const currentImages = settings.heroImages || [];
      const newImages = [...currentImages, ...urls].slice(0, 5);

      // Update local state
      setSettings({ ...settings, heroImages: newImages });

      // Save to database immediately
      const settingsRef = doc(db, "settings", "general");
      await setDoc(
        settingsRef,
        {
          heroImages: newImages,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      // Force reload hero images in carousel
      window.dispatchEvent(new CustomEvent("heroImagesUpdated"));

      toast.success(`تم رفع وحفظ ${urls.length} صورة بنجاح`, {
        id: "upload-hero",
      });
    } catch (error: any) {
      console.error("Error uploading hero images:", error);
      toast.error(error.message || "فشل رفع الصور", { id: "upload-hero" });
    } finally {
      setUploadingHeroImages(false);
    }
  };

  const removeHeroImage = async (index: number) => {
    try {
      const newImages = [...(settings.heroImages || [])];
      newImages.splice(index, 1);

      // Update local state
      setSettings({ ...settings, heroImages: newImages });

      // Save to database
      const settingsRef = doc(db, "settings", "general");
      await setDoc(
        settingsRef,
        {
          heroImages: newImages,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      // Force reload hero images in carousel
      window.dispatchEvent(new CustomEvent("heroImagesUpdated"));

      toast.success("تم حذف الصورة بنجاح");
    } catch (error) {
      console.error("Error removing hero image:", error);
      toast.error("حدث خطأ في حذف الصورة");
    }
  };

  const SettingSection = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
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

  // Memoize InputField to prevent re-renders that close keyboard
  const InputField = React.memo(({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    icon: Icon,
    onKeyPress,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    icon?: any;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={18}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (onKeyPress) {
              onKeyPress(e);
            } else if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          onBlur={(e) => {
            // Prevent default blur behavior that might close keyboard
            e.stopPropagation();
          }}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={false}
          className={`w-full ${
            Icon ? "pr-10" : "pr-3"
          } pl-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 focus:border-brand-maroon-500`}
        />
      </div>
    </div>
  ));

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
          value={settings.storeNameAr || ""}
          onChange={(value) => setSettings({ ...settings, storeNameAr: value })}
          placeholder="الشيخ للعطور"
        />
        <InputField
          label="اسم المتجر (إنجليزي)"
          value={settings.storeName || ""}
          onChange={(value) => setSettings({ ...settings, storeName: value })}
          placeholder="ALSHIEKH PARFUMES"
        />
      </SettingSection>

      {/* Contact Information */}
      <SettingSection title="معلومات الاتصال" icon={Phone}>
        <InputField
          label="البريد الإلكتروني"
          value={settings.email || ""}
          onChange={(value) => setSettings({ ...settings, email: value })}
          type="email"
          placeholder="info@alshiekh.com"
          icon={Mail}
        />
        <InputField
          label="رقم الهاتف"
          value={settings.phone || ""}
          onChange={(value) => setSettings({ ...settings, phone: value })}
          type="tel"
          placeholder="091 508 0707"
          icon={Phone}
        />
        <InputField
          label="العنوان"
          value={settings.address || ""}
          onChange={(value) => setSettings({ ...settings, address: value })}
          placeholder="تاج مول - الطابق الأرضي"
          icon={MapPin}
        />
      </SettingSection>

      {/* Hero Images Management */}
      <SettingSection title="صور الهيرو (حتى 5 صور)" icon={ImageIcon}>
        <div className="mb-4">
          <label className="flex items-center justify-center w-full min-h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-maroon-500 transition-colors bg-gray-50 hover:bg-gray-100">
            <div className="text-center p-4">
              {uploadingHeroImages ? (
                <>
                  <Loader2
                    className="mx-auto text-brand-maroon-600 mb-2 animate-spin"
                    size={24}
                  />
                  <p className="text-sm text-gray-600">جاري رفع الصور...</p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    اضغط لرفع صور الهيرو
                  </p>
                  <p className="text-xs text-gray-500">يمكنك رفع حتى 5 صور</p>
                  <p className="text-xs text-gray-400 mt-1">
                    سيتم رفع الصور على imgBB
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              disabled={uploadingHeroImages}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleHeroImageUpload(files);
                }
              }}
            />
          </label>
        </div>

        {settings.heroImages && settings.heroImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                تم رفع{" "}
                <span className="font-bold text-brand-maroon-600">
                  {settings.heroImages.length}
                </span>{" "}
                صورة
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {settings.heroImages.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-gray-200 hover:border-brand-maroon-500 transition-colors">
                    <img
                      src={url}
                      alt={`Hero ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <motion.button
                        type="button"
                        onClick={() => removeHeroImage(index)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </SettingSection>

      {/* Social Media Links */}
      <SettingSection title="روابط وسائل التواصل" icon={Globe}>
        <InputField
          label="فيسبوك"
          value={settings.facebook || ""}
          onChange={(value) => setSettings({ ...settings, facebook: value })}
          placeholder="https://facebook.com/yourpage"
        />
        <InputField
          label="إنستغرام"
          value={settings.instagram || ""}
          onChange={(value) => setSettings({ ...settings, instagram: value })}
          placeholder="https://instagram.com/yourpage"
        />
        <InputField
          label="تويتر"
          value={settings.twitter || ""}
          onChange={(value) => setSettings({ ...settings, twitter: value })}
          placeholder="https://twitter.com/yourpage"
        />
        <InputField
          label="يوتيوب"
          value={settings.youtube || ""}
          onChange={(value) => setSettings({ ...settings, youtube: value })}
          placeholder="https://youtube.com/yourchannel"
        />
        <InputField
          label="تيك توك"
          value={settings.tiktok || ""}
          onChange={(value) => setSettings({ ...settings, tiktok: value })}
          placeholder="https://tiktok.com/@yourpage"
        />
      </SettingSection>

      {/* API Keys */}
      <SettingSection title="مفاتيح API" icon={Shield}>
        <GeminiApiKeySection />
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="الإشعارات" icon={Bell}>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-900">
              إشعارات البريد الإلكتروني
            </p>
            <p className="text-xs text-gray-500">
              تلقي إشعارات على البريد الإلكتروني
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSettings({
                ...settings,
                emailNotifications: !settings.emailNotifications,
              });
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.emailNotifications
                ? "bg-brand-maroon-600"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.emailNotifications ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </SettingSection>

      {/* Save Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.preventDefault();
          saveSettings();
        }}
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
