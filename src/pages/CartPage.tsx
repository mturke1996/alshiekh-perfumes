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
    if (!productId) return;
    
    const validQuantity = Math.max(1, Math.floor(newQuantity));
    
    if (validQuantity < 1) {
      removeItem(productId);
      toast.success('تم حذف المنتج من السلة');
    } else {
      updateQuantity(productId, validQuantity);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-brand-maroon-600" size={22} />
            <h1 className="text-lg font-bold text-gray-900">سلة التسوق</h1>
            {items.length > 0 && (
              <span className="bg-brand-maroon-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {items.length}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من حذف جميع المنتجات من السلة؟')) {
                  clearCart();
                  toast.success('تم حذف جميع المنتجات');
                }
              }}
              className="text-red-600 text-sm font-medium hover:text-red-700 active:scale-95 transition-all"
            >
              مسح الكل
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 px-3 py-2">
        {/* Cart Items */}
        <AnimatePresence>
          {items
            .filter((item) => item.product && item.product.id) // Filter out invalid items
            .map((item, index) => {
            const product = item.product;
            
            // Validate product data
            if (!product || !product.id) {
              return null;
            }
            
            const finalPrice = product.discount && product.discount > 0
              ? product.price - (product.price * product.discount / 100)
              : (product.price || 0);
            
            const quantity = Math.max(1, item.quantity || 1);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                transition={{ delay: index * 0.03, type: "spring", stiffness: 300 }}
                className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 active:scale-[0.98]"
              >
                <div className="flex gap-2">
                  {/* Product Image */}
                  <Link
                    to={`/product/${product.id}`}
                    className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0 group"
                  >
                    <img
                      src={product.thumbnail || product.images[0]}
                      alt={product.nameAr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.discount && (
                      <div className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-bold text-gray-900 mb-0.5 line-clamp-2 hover:text-brand-maroon-600 transition-colors text-sm leading-tight">
                          {product.nameAr || product.name}
                        </h3>
                      </Link>
                      <p className="text-[10px] text-gray-500 mb-1">{product.brandAr || product.brand}</p>

                      {/* Price */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-base font-bold text-brand-maroon-600">
                          {formatCurrency(finalPrice, 'LYD')}
                        </span>
                        {product.discount && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatCurrency(product.price, 'LYD')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Actions */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-0.5 border border-gray-200">
                          <button
                            onClick={() => handleQuantityChange(product.id, quantity - 1)}
                            className="w-7 h-7 rounded-md bg-white flex items-center justify-center hover:bg-brand-maroon-50 hover:text-brand-maroon-600 active:scale-90 transition-all"
                          >
                            <Minus size={12} className="text-gray-700" />
                          </button>
                          <span className="text-xs font-bold text-gray-900 w-6 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product.id, quantity + 1)}
                            className="w-7 h-7 rounded-md bg-white flex items-center justify-center hover:bg-brand-maroon-50 hover:text-brand-maroon-600 active:scale-90 transition-all"
                          >
                            <Plus size={12} className="text-gray-700" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => {
                            removeItem(product.id);
                            toast.success('تم حذف المنتج');
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-medium">الإجمالي:</span>
                        <span className="text-sm font-bold text-brand-maroon-600">
                          {formatCurrency(finalPrice * quantity, 'LYD')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Summary Card - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-3 shadow-lg border border-gray-200 sticky bottom-20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">الإجمالي:</span>
            <span className="text-lg font-bold text-brand-maroon-600">
              {formatCurrency(total, 'LYD')}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>إتمام الطلب</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
