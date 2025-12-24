import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  CheckCircle,
  Truck,
  Phone,
  MapPin,
  ShoppingBag,
  Eye
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types/perfume-shop';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

const statusConfig: Record<Order['status'], { label: string; color: string; border?: string; icon: any }> = {
  pending: { label: 'جديد', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  confirmed: { label: 'مؤكد', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: CheckCircle },
  processing: { label: 'قيد المعالجة', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  shipped: { label: 'تم الشحن', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
  delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  cancelled: { label: 'ملغى', color: 'bg-red-100 text-red-700 border-red-200', icon: CheckCircle },
  refunded: { label: 'مسترد', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: CheckCircle },
};

export default function MobileOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('حدث خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery);
    const matchesFilter = !filterStatus || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const OrderCard = ({ order }: { order: Order }) => {
    const status = statusConfig[order.status];
    const StatusIcon = status.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setSelectedOrder(order)}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3 active:scale-[0.98] transition-transform cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-500">#{order.orderNumber}</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border ${status.color}`}>
                <StatusIcon size={12} />
                {status.label}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-base">{order.customerName}</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Phone size={12} />
                {order.customerPhone}
              </div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-xs text-gray-500 mb-1">التاريخ</div>
            <div className="flex items-center gap-1 text-xs text-gray-700">
              <Clock size={12} />
              {format(order.createdAt?.toDate() || new Date(), 'd MMM', { locale: ar })}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 py-2 border-t border-gray-100 mb-2">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-xs text-gray-600 flex-1">
            {order.shippingAddress?.city} - {order.shippingAddress?.addressLine1}
          </span>
        </div>

        {/* Products & Total */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">{order.items?.length || 0} منتج</span>
          </div>
          <div className="text-left">
            <div className="text-xs text-gray-500 mb-0.5">الإجمالي</div>
            <p className="text-lg font-bold text-brand-maroon-600">{order.total?.toFixed(0) || 0} IQD</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const OrderDetailModal = () => {
    if (!selectedOrder) return null;

    const status = statusConfig[selectedOrder.status];
    const StatusIcon = status.icon;

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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">تفاصيل الطلب</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Eye size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">رقم الطلب</span>
                  <span className="text-sm font-bold text-gray-900">#{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">الحالة</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border ${status.color}`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">التاريخ</span>
                  <span className="text-sm text-gray-900">
                    {format(selectedOrder.createdAt?.toDate() || new Date(), 'd MMM yyyy, h:mm a', { locale: ar })}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-gray-900 mb-2">معلومات العميل</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">الاسم</span>
                  <span className="text-sm font-medium text-gray-900">{selectedOrder.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">الهاتف</span>
                  <a href={`tel:${selectedOrder.customerPhone}`} className="text-sm font-medium text-brand-maroon-600">
                    {selectedOrder.customerPhone}
                  </a>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500 block mb-1">العنوان</span>
                  <span className="text-sm text-gray-900">
                    {selectedOrder.shippingAddress?.city} - {selectedOrder.shippingAddress?.addressLine1}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">المنتجات</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.productNameAr || item.productName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">الكمية: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{item.price?.toFixed(0) || 0} IQD</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-brand-maroon-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">الإجمالي</span>
                  <span className="text-xl font-bold text-brand-maroon-600">
                    {selectedOrder.total?.toFixed(0) || 0} IQD
                  </span>
                </div>
              </div>
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
          <h2 className="text-xl font-bold text-gray-900 mb-1">الطلبات</h2>
          <p className="text-sm text-gray-500">{filteredOrders.length} طلب</p>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ابحث عن طلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-white rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilterStatus(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              !filterStatus
                ? 'bg-brand-maroon-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            الكل
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === key
                  ? 'bg-brand-maroon-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">لا توجد طلبات</p>
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
    </>
  );
}
