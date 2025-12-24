import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Package,
  ChevronLeft
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);

  const total = getTotal();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      toast.success('تم حذف المنتج من السلة');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('السلة فارغة');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">سلة التسوق</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="relative mb-6">
              <Package className="mx-auto text-gray-300" size={80} />
              <div className="absolute -top-2 -right-2 w-24 h-24 bg-gray-100 rounded-full -z-10"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">السلة فارغة</h2>
            <p className="text-gray-500 mb-8">ابدأ التسوق لإضافة منتجات إلى السلة</p>
            <button
              onClick={() => navigate('/products')}
              className="px-8 py-4 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              تصفح المنتجات
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">سلة التسوق</h1>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من حذف جميع المنتجات من السلة؟')) {
                  clearCart();
                  toast.success('تم حذف جميع المنتجات');
                }
              }}
              className="text-red-600 text-sm font-medium"
            >
              مسح الكل
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 px-4 py-6">
        {/* Cart Items */}
        <AnimatePresence>
          {items.map((item, index) => {
            const product = item.product;
            const finalPrice = product.discount
              ? product.price - (product.price * product.discount / 100)
              : product.price;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    to={`/product/${product.id}`}
                    className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
                  >
                    <img
                      src={product.thumbnail || product.images[0]}
                      alt={product.nameAr}
                      className="w-full h-full object-cover"
                    />
                    {product.discount && (
                      <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 hover:text-brand-maroon-600 transition-colors">
                        {product.nameAr || product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mb-2">{product.brandAr || product.brand}</p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-brand-maroon-600">
                        {formatCurrency(finalPrice, 'LYD')}
                      </span>
                      {product.discount && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(product.price, 'LYD')}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => handleQuantityChange(product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
                        >
                          <Minus size={16} className="text-gray-600" />
                        </button>
                        <span className="text-sm font-bold text-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
                        >
                          <Plus size={16} className="text-gray-600" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          removeItem(product.id);
                          toast.success('تم حذف المنتج');
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">الإجمالي:</span>
                        <span className="text-base font-bold text-gray-900">
                          {formatCurrency(finalPrice * item.quantity, 'LYD')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky bottom-20"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h3>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">عدد المنتجات:</span>
              <span className="font-medium text-gray-900">{items.length} منتج</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">الكمية الإجمالية:</span>
              <span className="font-medium text-gray-900">
                {items.reduce((sum, item) => sum + item.quantity, 0)} قطعة
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">الإجمالي:</span>
                <span className="text-2xl font-bold text-brand-maroon-600">
                  {formatCurrency(total, 'LYD')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={24} />
                <span>إتمام الطلب</span>
              </>
            )}
          </button>

          <Link
            to="/products"
            className="block mt-4 text-center text-brand-maroon-600 font-medium hover:underline"
          >
            ← إضافة المزيد من المنتجات
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
