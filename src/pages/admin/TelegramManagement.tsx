import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  TestTube,
  ToggleRight,
  ToggleLeft,
  Key,
  MessageSquare,
  Save,
} from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { TelegramChat } from "../../types/perfume-shop";
import { testTelegramConnection } from "../../utils/telegram";
import toast from "react-hot-toast";

export default function TelegramManagement() {
  const [botToken, setBotToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Chat form
  const [chatName, setChatName] = useState("");
  const [chatId, setChatId] = useState("");
  const [addingChat, setAddingChat] = useState(false);

  // Chats list
  const [chats, setChats] = useState<TelegramChat[]>([]);

  useEffect(() => {
    loadSettings();
    loadChats();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "general"));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setBotToken(data.telegramBotToken || "");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async () => {
    try {
      const snapshot = await getDocs(collection(db, "telegramChats"));
      const chatsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TelegramChat[];
      setChats(chatsData);
    } catch (error) {
      console.error("Error loading chats:", error);
      toast.error("حدث خطأ في تحميل الشارتات");
    }
  };

  const saveBotToken = async () => {
    if (!botToken.trim()) {
      toast.error("يرجى إدخال Bot Token");
      return;
    }

    try {
      setSaving(true);
      await setDoc(
        doc(db, "settings", "general"),
        {
          telegramBotToken: botToken.trim(),
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
      toast.success("تم حفظ Bot Token بنجاح");
    } catch (error: any) {
      console.error("Error saving token:", error);
      toast.error("حدث خطأ في حفظ Bot Token");
    } finally {
      setSaving(false);
    }
  };

  const addChat = async () => {
    const trimmedName = chatName.trim();
    const trimmedId = chatId.trim();
    const trimmedToken = botToken.trim();

    if (!trimmedName) {
      toast.error("يرجى إدخال اسم الشارت");
      return;
    }

    if (!trimmedId) {
      toast.error("يرجى إدخال Chat ID");
      return;
    }

    if (!trimmedToken) {
      toast.error("يرجى إدخال Bot Token أولاً");
      return;
    }

    // Check if chat ID already exists
    const existingChat = chats.find((chat) => chat.chatId === trimmedId);
    if (existingChat) {
      toast.error("هذا Chat ID موجود بالفعل");
      return;
    }

    try {
      setAddingChat(true);

      // Save chat directly to Firestore first
      const chatData: Omit<TelegramChat, "id"> = {
        name: trimmedName,
        chatId: trimmedId,
        active: true,
        createdAt: Timestamp.now(),
      };

      toast.loading("جاري حفظ الشارت...", { id: "save-chat" });

      const docRef = await addDoc(collection(db, "telegramChats"), chatData);

      // Verify document was created
      if (!docRef || !docRef.id) {
        throw new Error("فشل إنشاء المستند في قاعدة البيانات");
      }

      // Clear form immediately after successful save
      setChatName("");
      setChatId("");

      // Reload chats to show the new one
      await loadChats();

      toast.dismiss("save-chat");
      toast.success(`✅ تم إضافة الشارت "${trimmedName}" بنجاح`);

      // Test connection after saving (optional, non-blocking)
      setTimeout(async () => {
        try {
          const isValid = await testTelegramConnection(trimmedToken, trimmedId);
          if (isValid) {
            toast.success(`✅ تم التحقق من الاتصال مع "${trimmedName}"`);
          } else {
            toast.error(
              `⚠️ تحذير: فشل اختبار الاتصال مع "${trimmedName}" - تحقق من Chat ID`
            );
          }
        } catch (testError) {
          console.error("Test error (non-blocking):", testError);
          // Don't show error, just log it
        }
      }, 500);
    } catch (error: any) {
      console.error("Error adding chat:", error);
      toast.dismiss("save-chat");

      let errorMessage = "حدث خطأ في إضافة الشارت";
      if (error?.code === "permission-denied") {
        errorMessage =
          "ليس لديك صلاحية لإضافة الشارت. تحقق من إعدادات Firestore";
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        errorMessage += ` (كود الخطأ: ${error.code})`;
      }

      toast.error(errorMessage);
    } finally {
      setAddingChat(false);
    }
  };

  const toggleChatActive = async (chat: TelegramChat) => {
    try {
      await updateDoc(doc(db, "telegramChats", chat.id), {
        active: !chat.active,
        updatedAt: Timestamp.now(),
      });

      await loadChats();
      toast.success(`تم ${!chat.active ? "تفعيل" : "إلغاء تفعيل"} الشارت`);
    } catch (error) {
      console.error("Error toggling chat:", error);
      toast.error("حدث خطأ في تحديث الشارت");
    }
  };

  const deleteChat = async (chatId: string, chatName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الشارت "${chatName}"؟`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "telegramChats", chatId));
      await loadChats();
      toast.success("تم حذف الشارت بنجاح");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("حدث خطأ في حذف الشارت");
    }
  };

  const testAllChats = async () => {
    if (!botToken.trim()) {
      toast.error("يرجى إدخال Bot Token أولاً");
      return;
    }

    const activeChats = chats.filter((chat) => chat.active);
    if (activeChats.length === 0) {
      toast.error("لا توجد شارتات نشطة للاختبار");
      return;
    }

    try {
      setTesting(true);
      toast.loading("جاري اختبار جميع الشارتات...", { id: "test-all" });

      let successCount = 0;
      let failCount = 0;

      for (const chat of activeChats) {
        try {
          const isValid = await testTelegramConnection(
            botToken.trim(),
            chat.chatId
          );
          if (isValid) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      toast.dismiss("test-all");
      if (failCount === 0) {
        toast.success(`✅ تم اختبار ${successCount} شارت بنجاح`);
      } else {
        toast.error(`نجح: ${successCount} | فشل: ${failCount}`);
      }
    } catch (error) {
      console.error("Error testing chats:", error);
      toast.error("حدث خطأ في اختبار الشارتات");
      toast.dismiss("test-all");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="mx-auto mb-4 animate-spin text-brand-maroon-600"
            size={32}
          />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Bot className="text-brand-maroon-600" size={24} />
          إدارة Telegram
        </h2>
        <p className="text-sm text-gray-500">إدارة Bot Token والشارتات</p>
      </div>

      {/* Bot Token Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="text-brand-maroon-600" size={20} />
          Bot Token
        </h3>

        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700 mb-2 font-medium">
            كيفية الحصول على Bot Token:
          </p>
          <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
            <li>افتح @BotFather على Telegram</li>
            <li>أرسل /newbot واتبع التعليمات</li>
            <li>انسخ الـ Token الذي ستحصل عليه</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
            />
          </div>
          <button
            onClick={saveBotToken}
            disabled={saving || !botToken.trim()}
            className="px-6 py-3 bg-brand-maroon-600 hover:bg-brand-maroon-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>حفظ</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Add New Chat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="text-brand-maroon-600" size={20} />
          إضافة شارت جديد
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الشارت <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="مثال: الشارت الرئيسي"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 focus:border-brand-maroon-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chat ID <span className="text-red-500">*</span>
            </label>
            <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600">
                💡 احصل على Chat ID من @userinfobot على Telegram
              </p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={chatId}
              onChange={(e) => {
                // Allow only numbers
                const value = e.target.value.replace(/[^0-9-]/g, "");
                setChatId(value);
              }}
              placeholder="123456789"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 focus:border-brand-maroon-500"
            />
          </div>

          <button
            onClick={addChat}
            disabled={
              addingChat ||
              !chatName.trim() ||
              !chatId.trim() ||
              !botToken.trim()
            }
            className="w-full py-3 bg-brand-maroon-600 hover:bg-brand-maroon-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {addingChat ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>جاري الإضافة...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>إضافة شارت</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Chats List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-brand-maroon-600" size={20} />
            الشارتات ({chats.length})
          </h3>
          {chats.length > 0 && (
            <button
              onClick={testAllChats}
              disabled={testing || !botToken.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {testing ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>جاري الاختبار...</span>
                </>
              ) : (
                <>
                  <TestTube size={16} />
                  <span>اختبار الكل</span>
                </>
              )}
            </button>
          )}
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="mx-auto mb-3 text-gray-300" size={48} />
            <p className="text-sm">لا توجد شارتات مضافة</p>
            <p className="text-xs mt-1">أضف شارتاً جديداً أعلاه</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{chat.name}</p>
                      {chat.active ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <Check size={12} />
                          نشط
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                          غير نشط
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Chat ID: {chat.chatId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleChatActive(chat)}
                      className={`p-2 rounded-lg transition-colors ${
                        chat.active
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                      title={chat.active ? "إلغاء التفعيل" : "تفعيل"}
                    >
                      {chat.active ? (
                        <ToggleRight size={20} />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => deleteChat(chat.id, chat.name)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
