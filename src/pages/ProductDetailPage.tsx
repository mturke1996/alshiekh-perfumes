import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/perfume-shop';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { formatPrice, formatCurrency } from '../utils/helpers';
import { 
  ArrowRight, 
  Heart, 
  ShoppingCart, 
  Star, 
  Share2, 
  Minus, 
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Package,
  Award,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  const { addItem } = useCartStore();
  const { items, addItem: addFavorite, removeItem: removeFavorite } = useFavoritesStore();
  const isFavorite = items.some(item => item.id === product?.id);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      if (!id) return;

      const productDoc = await getDoc(doc(db, 'products', id));
      if (productDoc.exists()) {
        const productData = { id: productDoc.id, ...productDoc.data() } as Product;
        setProduct(productData);
        fetchRelatedProducts(productData);
      } else {
        toast.error('المنتج غير موجود');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('حدث خطأ أثناء تحميل المنتج');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (currentProduct: Product) => {
    try {
      const relatedQuery = query(
        collection(db, 'products'),
        where('category', '==', currentProduct.category),
        limit(4)
      );
      const snapshot = await getDocs(relatedQuery);
      const related = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Product))
        .filter(p => p.id !== currentProduct.id)
        .slice(0, 3);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    
    addItem({
      product: product,
      quantity: quantity
    });
    
    toast.success('تمت الإضافة إلى السلة بنجاح');
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    
    if (isFavorite) {
      removeFavorite(product.id);
      toast.success('تمت الإزالة من المفضلة');
    } else {
      addFavorite(product);
      toast.success('تمت الإضافة إلى المفضلة');
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.nameAr,
          text: product.descriptionAr || product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ رابط المنتج');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-maroon-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">المنتج غير موجود</h2>
          <Link to="/products" className="text-brand-maroon-600 font-medium">
            العودة للمنتجات
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.thumbnail];

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
          <h1 className="text-lg font-bold text-gray-900">تفاصيل المنتج</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition-colors ${
                isFavorite ? 'text-red-500' : 'hover:bg-gray-100'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Image Gallery */}
        <div className="bg-white">
          <div className="relative aspect-square w-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={images[selectedImageIndex]}
                alt={product.nameAr}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              {product.featured && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-brand-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                >
                  <Sparkles size={12} />
                  مميز
                </motion.div>
              )}
              {product.isNew && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                >
                  جديد
                </motion.div>
              )}
              {product.discount && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                >
                  خصم {product.discount}%
                </motion.div>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-brand-maroon-600 ring-2 ring-brand-maroon-200'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.nameAr} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="bg-white px-4 py-6 space-y-4">
          {/* Brand & Category */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-brand-maroon-600">{product.brandAr || product.brand}</span>
            <span>•</span>
            <span>{product.categoryAr || product.category}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {product.nameAr || product.name}
          </h1>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount && (
                <span className="text-sm text-gray-500">
                  ({product.reviewCount} تقييم)
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 py-2">
            <span className="text-3xl font-bold text-brand-maroon-600">
              {formatCurrency(finalPrice, 'LYD')}
            </span>
            {product.discount && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(product.price, 'LYD')}
                </span>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                  وفر {product.discount}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">الوصف</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.descriptionAr || product.description || 'لا يوجد وصف متاح'}
            </p>
          </div>

          {/* Product Details */}
          {(product.gender || product.size || product.concentration) && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-900 mb-3">تفاصيل المنتج</h3>
              {product.gender && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الجنس:</span>
                  <span className="font-medium text-gray-900">{product.genderAr || product.gender}</span>
                </div>
              )}
              {product.size && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الحجم:</span>
                  <span className="font-medium text-gray-900">{product.sizeAr || product.size}</span>
                </div>
              )}
              {product.concentration && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">التركيز:</span>
                  <span className="font-medium text-gray-900">{product.concentrationAr || product.concentration}</span>
                </div>
              )}
            </div>
          )}

          {/* Fragrance Notes (for perfumes) */}
          {(product.topNotes || product.middleNotes || product.baseNotes) && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-900 mb-3">مكونات الرائحة</h3>
              {product.topNotes && product.topNotes.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">الرأسية:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.topNotes.map((note, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-brand-maroon-50 text-brand-maroon-700 rounded-full text-sm"
                      >
                        {product.topNotesAr?.[i] || note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.middleNotes && product.middleNotes.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">القلبية:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.middleNotes.map((note, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-brand-gold-50 text-brand-gold-700 rounded-full text-sm"
                      >
                        {product.middleNotesAr?.[i] || note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.baseNotes && product.baseNotes.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">القاعدية:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.baseNotes.map((note, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {product.baseNotesAr?.[i] || note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-white px-4 py-6">
          <h3 className="font-bold text-gray-900 mb-4">المميزات</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Shield className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">ضمان الجودة</p>
                <p className="text-xs text-gray-500">منتج أصلي 100%</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Truck className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">توصيل سريع</p>
                <p className="text-xs text-gray-500">خلال 24 ساعة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">إرجاع مجاني</p>
                <p className="text-xs text-gray-500">خلال 14 يوم</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Award className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">أفضل الأسعار</p>
                <p className="text-xs text-gray-500">ضمان السعر</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Status */}
        <div className="bg-white px-4 py-4">
          {product.inStock ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check size={20} />
              <span className="font-medium">متوفر في المخزن</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <Package size={20} />
              <span className="font-medium">غير متوفر حالياً</span>
            </div>
          )}
        </div>

        {/* Quantity & Add to Cart */}
        {product.inStock && (
          <div className="bg-white px-4 py-6 space-y-4 sticky bottom-0 border-t border-gray-200">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">الكمية:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-transform"
                >
                  <Minus size={18} />
                </button>
                <span className="text-lg font-bold text-gray-900 w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-transform"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              <ShoppingCart size={24} />
              <span>أضف إلى السلة</span>
              <span className="text-brand-gold-300">- {formatCurrency(finalPrice * quantity, 'LYD')}</span>
            </button>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="px-4 py-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform"
                >
                  <div className="aspect-square relative">
                    <img
                      src={relatedProduct.thumbnail}
                      alt={relatedProduct.nameAr}
                      className="w-full h-full object-cover"
                    />
                    {relatedProduct.discount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{relatedProduct.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">{relatedProduct.brandAr}</p>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.nameAr}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-brand-maroon-600">
                        {formatCurrency(
                          relatedProduct.discount
                            ? relatedProduct.price - (relatedProduct.price * relatedProduct.discount / 100)
                            : relatedProduct.price,
                          'LYD'
                        )}
                      </span>
                      {relatedProduct.discount && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatCurrency(relatedProduct.price, 'LYD')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}