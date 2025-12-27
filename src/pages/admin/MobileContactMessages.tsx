import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Loader2,
  MessageSquare,
} from "lucide-react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { ContactMessage } from "../../types/perfume-shop";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function MobileContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messagesRef = collection(db, "contactMessages");
      const q = query(messagesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContactMessage[];
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("حدث خطأ في تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "contactMessages", messageId), {
        read: true,
        updatedAt: Timestamp.now(),
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
      toast.success("تم تحديد الرسالة كمقروءة");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("حدث خطأ في تحديث الرسالة");
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "contactMessages", messageId));
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      toast.success("تم حذف الرسالة بنجاح");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("حدث خطأ في حذف الرسالة");
    }
  };

  const filteredMessages =
    filter === "all"
      ? messages
      : filter === "read"
      ? messages.filter((m) => m.read)
      : messages.filter((m) => !m.read);

  const unreadCount = messages.filter((m) => !m.read).length;

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
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <MessageSquare className="text-brand-maroon-600" size={24} />
          رسائل التواصل ({messages.length})
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount} غير مقروءة
            </span>
          )}
        </h2>
        <p className="text-sm text-gray-500">إدارة رسائل التواصل من العملاء</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
            filter === "all"
              ? "bg-brand-maroon-600 text-white"
              : "bg-white text-gray-700 border border-gray-200"
          }`}
        >
          الكل ({messages.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
            filter === "unread"
              ? "bg-brand-maroon-600 text-white"
              : "bg-white text-gray-700 border border-gray-200"
          }`}
        >
          غير مقروءة ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
            filter === "read"
              ? "bg-brand-maroon-600 text-white"
              : "bg-white text-gray-700 border border-gray-200"
          }`}
        >
          مقروءة ({messages.length - unreadCount})
        </button>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Mail className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="text-sm">لا توجد رسائل</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 bg-white rounded-xl border-2 ${
                message.read
                  ? "border-gray-200"
                  : "border-brand-maroon-500 bg-brand-maroon-50"
              } shadow-sm`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1" onClick={() => setSelectedMessage(message)}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="text-brand-maroon-600" size={18} />
                    <p className="font-bold text-gray-900">{message.name}</p>
                    {!message.read && (
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-medium">
                        جديد
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    {message.subject}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {message.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      <span>{message.phone}</span>
                    </div>
                    {message.email && (
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span>{message.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        {format(
                          message.createdAt?.toDate() || new Date(),
                          "yyyy-MM-dd HH:mm",
                          { locale: ar }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!message.read && (
                    <button
                      onClick={() => markAsRead(message.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="تحديد كمقروءة"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMessage(message)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="عرض التفاصيل"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => deleteMessage(message.id)}
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">تفاصيل الرسالة</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">الاسم</label>
                <p className="font-bold text-gray-900">{selectedMessage.name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">الهاتف</label>
                <p className="font-bold text-gray-900">{selectedMessage.phone}</p>
              </div>

              {selectedMessage.email && (
                <div>
                  <label className="text-sm text-gray-500">البريد الإلكتروني</label>
                  <p className="font-bold text-gray-900">{selectedMessage.email}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500">الموضوع</label>
                <p className="font-bold text-gray-900">{selectedMessage.subject}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">الرسالة</label>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {selectedMessage.message}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">التاريخ والوقت</label>
                <p className="text-gray-700">
                  {format(
                    selectedMessage.createdAt?.toDate() || new Date(),
                    "yyyy-MM-dd HH:mm",
                    { locale: ar }
                  )}
                </p>
              </div>

              {!selectedMessage.read && (
                <button
                  onClick={() => {
                    markAsRead(selectedMessage.id);
                    setSelectedMessage({ ...selectedMessage, read: true });
                  }}
                  className="w-full py-3 bg-brand-maroon-600 text-white rounded-xl font-medium hover:bg-brand-maroon-700 transition-colors"
                >
                  تحديد كمقروءة
                </button>
              )}

              <button
                onClick={() => {
                  deleteMessage(selectedMessage.id);
                  setSelectedMessage(null);
                }}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                حذف الرسالة
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

