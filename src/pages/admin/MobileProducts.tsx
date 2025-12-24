import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types/perfume-shop';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function MobileProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'products'));
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('حدث خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        inStock: !currentStatus,
        updatedAt: Timestamp.now(),
      });
      toast.success('تم تحديث حالة المنتج');
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('حدث خطأ في تحديث المنتج');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('تم حذف المنتج');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('حدث خطأ في حذف المنتج');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ProductCard = ({ product }: { product: Product }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3"
      >
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {product.thumbnail || product.images?.[0] ? (
              <img
                src={product.thumbnail || product.images[0]}
                alt={product.nameAr || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-bold">غير متوفر</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
              {product.nameAr || product.name}
            </h3>
            <p className="text-xs text-gray-500 mb-2">{product.brandAr || product.brand}</p>
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-bold text-brand-maroon-600">
                  {product.price.toFixed(0)} IQD
                </p>
                {product.discount && (
                  <p className="text-xs text-gray-400 line-through">
                    {((product.price * 100) / (100 - product.discount)).toFixed(0)} IQD
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleProductStatus(product.id, product.inStock)}
                className={`p-2 rounded-lg transition-colors ${
                  product.inStock
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {product.inStock ? (
                  <ToggleRight size={20} />
                ) : (
                  <ToggleLeft size={20} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                تعديل
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-1">العطور</h2>
          <p className="text-sm text-gray-500">{filteredProducts.length} منتج</p>
        </motion.div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="p-3 bg-brand-maroon-600 text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="ابحث عن عطر..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-3 bg-white rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
        />
      </div>

      {/* Products List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">لا توجد منتجات</p>
              <button
                onClick={() => navigate('/admin/products/new')}
                className="px-6 py-3 bg-brand-maroon-600 text-white rounded-xl font-medium active:scale-95 transition-transform"
              >
                إضافة منتج جديد
              </button>
            </motion.div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

