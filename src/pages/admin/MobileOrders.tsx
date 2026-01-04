import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  CheckCircle,
  Truck,
  Phone,
  MapPin,
  ShoppingBag,
  User,
  Calendar,
  DollarSign,
  Package,
  X,
  ChevronDown,
  Loader2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Order } from "../../types/perfume-shop";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import toast from "react-hot-toast";
import { sendTelegramOrderNotification } from "../../utils/telegram";

const statusConfig: Record<
  Order["status"],
  { label: string; labelAr: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Pending",
    labelAr: "قيد الانتظار",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  confirmed: {
    label: "Confirmed",
    labelAr: "مؤكد",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
  },
  processing: {
    label: "Processing",
    labelAr: "قيد المعالجة",
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
  },
  shipped: {
    label: "Shipped",
    labelAr: "تم الشحن",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-200",
  },
  delivered: {
    label: "Delivered",
    labelAr: "تم التوصيل",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    labelAr: "ملغى",
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
  refunded: {
    label: "Refunded",
    labelAr: "مسترد",
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
  },
};

const statusOptions: Order["status"][] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function MobileOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<Order["status"] | "all">(
    "all"
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("حدث خطأ في تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setDeletingOrderId(orderId);
      await deleteDoc(doc(db, "orders", orderId));
      setOrders(orders.filter((o) => o.id !== orderId));
      toast.success("تم حذف الطلب بنجاح");
      setOrderToDelete(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("حدث خطأ في حذف الطلب");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      setUpdatingStatus(orderId);
      
      // Find the order to get old status
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        toast.error("لم يتم العثور على الطلب");
        return;
      }

      const oldStatus = order.status;

      // Update order in Firestore
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: Timestamp.now(),
        ...(newStatus === "confirmed" && { confirmedAt: Timestamp.now() }),
        ...(newStatus === "shipped" && { shippedAt: Timestamp.now() }),
        ...(newStatus === "delivered" && { deliveredAt: Timestamp.now() }),
      });

      // Update local state
      const updatedOrder = { ...order, status: newStatus };
      setOrders(
        orders.map((o) =>
          o.id === orderId ? updatedOrder : o
        )
      );

      // Send Telegram notification for status update
      try {
        await sendTelegramOrderNotification(updatedOrder as Order, {
          oldStatus,
          newStatus,
        });
        console.log(`✅ تم إرسال إشعار Telegram لتحديث حالة الطلب #${updatedOrder.orderNumber}`);
      } catch (telegramError) {
        console.error("Error sending Telegram notification:", telegramError);
        // Don't fail the update if Telegram fails
      }

      toast.success("تم تحديث حالة الطلب بنجاح");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("حدث خطأ في تحديث حالة الطلب");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery);
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const OrderCard = ({ order }: { order: Order }) => {
    const status = statusConfig[order.status];
    const isUpdating = updatingStatus === order.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4 hover:shadow-md transition-shadow"
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand-maroon-50 flex items-center justify-center">
                <ShoppingBag className="text-brand-maroon-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">رقم الطلب</p>
                <p className="text-sm font-bold text-gray-900">
                  #{order.orderNumber}
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 mb-1">التاريخ</p>
              <div className="flex items-center gap-1 text-xs text-gray-700">
                <Calendar size={12} />
                <span>
                  {format(
                    order.createdAt?.toDate() || new Date(),
                    "d MMM yyyy",
                    { locale: ar }
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Status Select */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              حالة الطلب
            </label>
            {isUpdating ? (
              <div className="flex items-center justify-center py-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <Loader2 className="animate-spin text-brand-maroon-600" size={18} />
              </div>
            ) : (
              <select
                value={order.status}
                onChange={(e) =>
                  handleStatusUpdate(
                    order.id,
                    e.target.value as Order["status"]
                  )
                }
                className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-medium appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 ${status.bgColor} ${status.color}`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "left 12px center",
                  paddingLeft: "2.5rem",
                }}
              >
                {statusOptions.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusConfig[statusOption].labelAr}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User className="text-blue-600" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">اسم العميل</p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {order.customerName}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Phone className="text-green-600" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
              <a
                href={`tel:${order.customerPhone}`}
                className="text-sm font-medium text-brand-maroon-600 hover:text-brand-maroon-700"
              >
                {order.customerPhone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="text-purple-600" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">عنوان التوصيل</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {order.shippingAddress?.city} -{" "}
                {order.shippingAddress?.addressLine1}
                {order.shippingAddress?.addressLine2 &&
                  ` - ${order.shippingAddress.addressLine2}`}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Package size={12} />
              المنتجات ({order.items?.length || 0})
            </p>
            <div className="space-y-2">
              {order.items?.slice(0, 2).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.productNameAr || item.productName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      الكمية: {item.quantity} × {item.price?.toFixed(0)} د.ل
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mr-2">
                    {(item.price * item.quantity)?.toFixed(0)} د.ل
                  </p>
                </div>
              ))}
              {order.items && order.items.length > 2 && (
                <p className="text-xs text-gray-500 text-center py-1">
                  و {order.items.length - 2} منتج آخر
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">المجموع الفرعي</span>
              <span className="font-medium text-gray-900">
                {order.subtotal?.toFixed(0) || 0} د.ل
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">الخصم</span>
                <span className="font-medium text-red-600">
                  -{order.discount?.toFixed(0) || 0} د.ل
                </span>
              </div>
            )}
            {order.shippingCost > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">تكلفة الشحن</span>
                <span className="font-medium text-gray-900">
                  {order.shippingCost?.toFixed(0) || 0} د.ل
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <DollarSign className="text-brand-maroon-600" size={18} />
                <span className="font-bold text-gray-900">الإجمالي</span>
              </div>
              <span className="text-xl font-bold text-brand-maroon-600">
                {order.total?.toFixed(0) || 0} د.ل
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSelectedOrder(order)}
              className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>عرض التفاصيل</span>
              <ChevronDown size={16} />
            </button>
            <button
              onClick={() => setOrderToDelete(order)}
              disabled={deletingOrderId === order.id}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingOrderId === order.id ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">حذف</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const OrderDetailModal = () => {
    if (!selectedOrder) return null;

    const status = statusConfig[selectedOrder.status];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  تفاصيل الطلب
                </h3>
                <p className="text-xs text-gray-500">#{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Status Update */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  تحديث حالة الطلب
                </label>
                {updatingStatus === selectedOrder.id ? (
                  <div className="flex items-center justify-center py-3 bg-gray-50 rounded-xl">
                    <Loader2 className="animate-spin text-brand-maroon-600" size={20} />
                  </div>
                ) : (
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusUpdate(
                        selectedOrder.id,
                        e.target.value as Order["status"]
                      )
                    }
                    className={`w-full px-4 py-3 rounded-xl border-2 text-base font-medium appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 ${status.bgColor} ${status.color}`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "left 12px center",
                      paddingLeft: "2.5rem",
                    }}
                  >
                    {statusOptions.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusConfig[statusOption].labelAr}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} />
                  معلومات العميل
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">الاسم الكامل</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrder.customerName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">رقم الهاتف</span>
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="text-sm font-medium text-brand-maroon-600"
                    >
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">البريد الإلكتروني</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedOrder.customerEmail}
                      </span>
                    </div>
                  )}
                  <div className="pt-2">
                    <p className="text-sm text-gray-600 mb-2">عنوان التوصيل</p>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {selectedOrder.shippingAddress?.city} -{" "}
                        {selectedOrder.shippingAddress?.addressLine1}
                        {selectedOrder.shippingAddress?.addressLine2 &&
                          ` - ${selectedOrder.shippingAddress.addressLine2}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={18} />
                  المنتجات ({selectedOrder.items?.length || 0})
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {item.productNameAr || item.productName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>الكمية: {item.quantity}</span>
                          <span>•</span>
                          <span>السعر: {item.price?.toFixed(0)} د.ل</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {(item.price * item.quantity)?.toFixed(0)} د.ل
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-brand-maroon-50 to-brand-gold-50 rounded-2xl p-4 border border-brand-maroon-200">
                <h4 className="font-bold text-gray-900 mb-4">ملخص الطلب</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">المجموع الفرعي</span>
                    <span className="font-medium text-gray-900">
                      {selectedOrder.subtotal?.toFixed(0) || 0} د.ل
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">الخصم</span>
                      <span className="font-medium text-red-600">
                        -{selectedOrder.discount?.toFixed(0) || 0} د.ل
                      </span>
                    </div>
                  )}
                  {selectedOrder.shippingCost > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">تكلفة الشحن</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.shippingCost?.toFixed(0) || 0} د.ل
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-brand-maroon-200 mt-2">
                    <span className="text-base font-bold text-gray-900">
                      الإجمالي النهائي
                    </span>
                    <span className="text-xl font-bold text-brand-maroon-600">
                      {selectedOrder.total?.toFixed(0) || 0} د.ل
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Shipping Info */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">طريقة الدفع</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedOrder.paymentMethod === "cash-on-delivery"
                      ? "دفع عند الاستلام"
                      : selectedOrder.paymentMethod === "credit-card"
                      ? "بطاقة ائتمانية"
                      : selectedOrder.paymentMethod === "bank-transfer"
                      ? "تحويل بنكي"
                      : "باي بال"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">حالة الدفع</span>
                  <span
                    className={`text-sm font-medium ${
                      selectedOrder.paymentStatus === "paid"
                        ? "text-green-600"
                        : selectedOrder.paymentStatus === "failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {selectedOrder.paymentStatus === "paid"
                      ? "مدفوع"
                      : selectedOrder.paymentStatus === "failed"
                      ? "فاشل"
                      : "قيد الانتظار"}
                  </span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">رقم التتبع</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrder.trackingNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Customer Note */}
              {selectedOrder.customerNote && (
                <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    ملاحظات العميل
                  </p>
                  <p className="text-sm text-yellow-800">
                    {selectedOrder.customerNote}
                  </p>
                </div>
              )}

              {/* Delete Button in Modal */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setOrderToDelete(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  disabled={deletingOrderId === selectedOrder.id}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={18} />
                  <span>حذف الطلب</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const DeleteConfirmModal = () => {
    if (!orderToDelete) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setOrderToDelete(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertCircle className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 text-center mb-6">
              هل أنت متأكد من حذف الطلب رقم{" "}
              <span className="font-bold text-gray-900">#{orderToDelete.orderNumber}</span>؟
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                لا يمكن التراجع عن هذا الإجراء
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDeleteOrder(orderToDelete.id)}
                disabled={deletingOrderId === orderToDelete.id}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingOrderId === orderToDelete.id ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>حذف</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 pb-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-1">الطلبات</h2>
          <p className="text-sm text-gray-500">
            إجمالي الطلبات: {filteredOrders.length} طلب
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="ابحث عن طلب برقم الطلب أو اسم العميل أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3.5 bg-white rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            تصفية حسب الحالة
          </label>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value === "all"
                  ? "all"
                  : (e.target.value as Order["status"])
              )
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 bg-white text-gray-900"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left 12px center",
              paddingLeft: "2.5rem",
            }}
          >
            <option value="all">جميع الطلبات</option>
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusConfig[statusOption].labelAr}
              </option>
            ))}
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-2xl border border-gray-200"
              >
                <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium mb-1">
                  لا توجد طلبات
                </p>
                <p className="text-sm text-gray-400">
                  {searchQuery || filterStatus !== "all"
                    ? "لا توجد طلبات تطابق البحث"
                    : "لم يتم إضافة أي طلبات بعد"}
                </p>
              </motion.div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal />
    </>
  );
}
