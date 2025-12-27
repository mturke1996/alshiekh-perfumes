import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, Package, ShoppingBag } from 'lucide-react';
import { useFavoritesStore } from '../store/favoritesStore';
import EnhancedProductCard from '../components/EnhancedProductCard';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { items, removeFromFavorites } = useFavoritesStore();

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
            <h1 className="text-lg font-bold text-gray-900">المفضلة</h1>
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
              <Heart className="mx-auto text-gray-300" size={80} fill="none" />
              <div className="absolute -top-2 -right-2 w-24 h-24 bg-gray-100 rounded-full -z-10"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">قائمة المفضلة فارغة</h2>
            <p className="text-gray-500 mb-8">ابدأ بإضافة المنتجات التي تعجبك إلى المفضلة</p>
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
          <div className="flex items-center gap-2">
            <Heart className="text-red-500" size={22} fill="currentColor" />
            <h1 className="text-lg font-bold text-gray-900">المفضلة</h1>
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {items.length}
            </span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {items.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <EnhancedProductCard product={product} view="grid" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
