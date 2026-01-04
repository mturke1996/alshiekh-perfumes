import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Save, TestTube, Loader2, Key, MessageSquare, Plus, Trash2, X } from "lucide-react";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { testTelegramConnection } from "../../utils/telegram";
import toast from "react-hot-toast";

export default function TelegramManagement() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [additionalChatIds, setAdditionalChatIds] = useState<string[]>([]);
  const [newChatId, setNewChatId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingChatId, setTestingChatId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "general"));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setBotToken(data.telegramBotToken || "");
        setChatId(data.telegramChatId || "");
        setAdditionalChatIds(data.telegramAdditionalChatIds || []);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("فشل تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!botToken.trim()) {
      toast.error("يرجى إدخال Bot Token");
      return;
    }

    if (!botToken.includes(':')) {
      toast.error("Bot Token غير صحيح - يجب أن يحتوي على ':'");
      return;
    }

    if (!chatId.trim()) {
      toast.error("يرجى إدخال Chat ID الرئيسي");
      return;
    }

    try {
      setSaving(true);
      toast.loading("جاري الحفظ...", { id: "save-settings" });

      await setDoc(
        doc(db, "settings", "general"),
        {
          telegramBotToken: botToken.trim(),
          telegramChatId: chatId.trim(),
          telegramAdditionalChatIds: additionalChatIds.filter(id => id.trim() !== ""),
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      // Verify the save
      const verifyDoc = await getDoc(doc(db, "settings", "general"));
      if (verifyDoc.exists()) {
        const saved = verifyDoc.data();
        if (saved.telegramBotToken === botToken.trim() && saved.telegramChatId === chatId.trim()) {
          toast.dismiss("save-settings");
          toast.success("✅ تم حفظ الإعدادات في قاعدة البيانات بنجاح");
        } else {
          toast.dismiss("save-settings");
          toast.error("⚠️ تم الحفظ لكن يوجد خطأ في التحقق");
        }
      } else {
        toast.dismiss("save-settings");
        toast.error("⚠️ فشل التحقق من الحفظ");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.dismiss("save-settings");
      toast.error("حدث خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const addAdditionalChatId = () => {
    const trimmedId = newChatId.trim();
    
    if (!trimmedId) {
      toast.error("يرجى إدخال Chat ID");
      return;
    }

    if (trimmedId === chatId) {
      toast.error("هذا Chat ID موجود بالفعل كـ Chat ID رئيسي");
      return;
    }

    if (additionalChatIds.includes(trimmedId)) {
      toast.error("هذا Chat ID موجود بالفعل");
      return;
    }

    setAdditionalChatIds([...additionalChatIds, trimmedId]);
    setNewChatId("");
    toast.success("✅ تم إضافة Chat ID");
  };

  const removeAdditionalChatId = (idToRemove: string) => {
    setAdditionalChatIds(additionalChatIds.filter(id => id !== idToRemove));
    toast.success("✅ تم حذف Chat ID");
  };

  const testConnection = async (testChatId?: string) => {
    const chatIdToTest = testChatId || chatId;
    
    if (!botToken.trim() || !chatIdToTest.trim()) {
      toast.error("يرجى إدخال Bot Token و Chat ID أولاً");
      return;
    }

    try {
      setTesting(true);
      setTestingChatId(chatIdToTest);
      toast.loading("جاري اختبار الاتصال...", { id: "test-connection" });

      const result = await testTelegramConnection(botToken.trim(), chatIdToTest.trim());
      
      toast.dismiss("test-connection");
      
      if (result.success) {
        toast.success(`✅ تم إرسال الرسالة بنجاح إلى Chat ID: ${chatIdToTest.substring(0, 5)}...`);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error: any) {
      toast.dismiss("test-connection");
      toast.error("حدث خطأ في الاختبار");
    } finally {
      setTesting(false);
      setTestingChatId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-brand-maroon-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Bot className="text-brand-maroon-600" size={24} />
          إعدادات Telegram
        </h2>
        <p className="text-sm text-gray-500">أدخل Bot Token و Chat IDs لإرسال إشعارات الطلبات</p>
      </div>

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="space-y-4">
          {/* Bot Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Key size={16} className="text-brand-maroon-600" />
              Bot Token
            </label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              احصل على Bot Token من @BotFather على Telegram
            </p>
          </div>

          {/* Main Chat ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare size={16} className="text-brand-maroon-600" />
              Chat ID الرئيسي
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="123456789"
                className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
              />
              <button
                onClick={() => testConnection()}
                disabled={testing || !botToken.trim() || !chatId.trim() || testingChatId !== null}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {testing && testingChatId === chatId ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <TestTube size={18} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              احصل على Chat ID من @userinfobot على Telegram
            </p>
          </div>

          {/* Additional Chat IDs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Plus size={16} className="text-brand-maroon-600" />
              Chat IDs إضافية (اختياري)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              يمكنك إضافة أكثر من Chat ID لإرسال الرسائل لجميعها في نفس الوقت
            </p>
            
            {/* Add new Chat ID */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newChatId}
                onChange={(e) => setNewChatId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAdditionalChatId()}
                placeholder="أدخل Chat ID إضافي"
                className="flex-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
              />
              <button
                onClick={addAdditionalChatId}
                disabled={!newChatId.trim()}
                className="px-4 py-2 bg-brand-maroon-600 hover:bg-brand-maroon-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Plus size={18} />
                <span>إضافة</span>
              </button>
            </div>

            {/* List of additional Chat IDs */}
            {additionalChatIds.length > 0 && (
              <div className="space-y-2">
                {additionalChatIds.map((id, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-500" />
                      <span className="text-sm font-mono text-gray-700">{id}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => testConnection(id)}
                        disabled={testing || !botToken.trim() || testingChatId !== null}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {testing && testingChatId === id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <TestTube size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => removeAdditionalChatId(id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {additionalChatIds.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">
                لا توجد Chat IDs إضافية - سيتم الإرسال إلى Chat ID الرئيسي فقط
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full px-6 py-3 bg-brand-maroon-600 hover:bg-brand-maroon-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>حفظ الإعدادات</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-2xl p-4"
      >
        <h3 className="text-sm font-bold text-blue-900 mb-2">معلومات مهمة:</h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Chat ID الرئيسي: يتم إرسال جميع الرسائل إليه دائماً</li>
          <li>Chat IDs الإضافية: يتم إرسال الرسائل إليها أيضاً عند الحفظ</li>
          <li>يمكنك اختبار كل Chat ID قبل الحفظ للتأكد من صحته</li>
          <li>الرسائل ستصل لجميع Chat IDs المحفوظة عند إنشاء طلب جديد</li>
        </ul>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-4"
      >
        <h3 className="text-sm font-bold text-green-900 mb-2">كيفية الإعداد:</h3>
        <ol className="text-xs text-green-800 space-y-1 list-decimal list-inside">
          <li>افتح @BotFather على Telegram وأرسل /newbot لإنشاء بوت جديد</li>
          <li>انسخ Bot Token الذي ستحصل عليه</li>
          <li>افتح @userinfobot على Telegram للحصول على Chat ID</li>
          <li>أدخل Bot Token و Chat ID الرئيسي واضغط "حفظ الإعدادات"</li>
          <li>(اختياري) أضف Chat IDs إضافية لإرسال الرسائل لعدة أشخاص</li>
        </ol>
      </motion.div>
    </div>
  );
}