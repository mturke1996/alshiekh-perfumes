import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/perfume-shop';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { formatPrice, formatCurrency } from '../utils/helpers';
import EnhancedProductCard from '../components/EnhancedProductCard';
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
  Sparkles,
  Tag,
  Calendar,
  Clock,
  Droplets,
  Wind,
  Info
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
    if (!product || !product.inStock) {
      toast.error('المنتج غير متوفر حالياً');
      return;
    }
    
    addItem({
      product: product,
      quantity: quantity
    });
    
    toast.success('✅ تمت الإضافة إلى السلة بنجاح', {
      icon: '🛒',
      duration: 2000,
    });
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    
    if (isFavorite) {
      removeFavorite(product.id);
      toast.success('تمت الإزالة من المفضلة');
    } else {
      addFavorite(product);
      toast.success('تمت الإضافة إلى المفضلة', { icon: '❤️' });
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

      <div className="space-y-4">
        {/* Image Gallery */}
        <div className="bg-white">
          <div className="relative aspect-square w-full bg-gradient-to-br from-gray-50 to-gray-100">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={images[selectedImageIndex]}
                alt={product.nameAr}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
                  className="bg-gradient-to-r from-brand-gold-500 to-brand-gold-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
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
                  className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                >
                  جديد
                </motion.div>
              )}
              {product.isBestSeller && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                >
                  الأكثر مبيعاً
                </motion.div>
              )}
              {product.discount && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                >
                  خصم {product.discount}%
                </motion.div>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide bg-gray-50">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-brand-maroon-600 ring-2 ring-brand-maroon-200 scale-105'
                      : 'border-gray-200 opacity-60 hover:opacity-100'
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
        <div className="bg-white px-4 py-6 space-y-6">
          {/* Brand & Category */}
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-brand-maroon-100 text-brand-maroon-700 rounded-full font-medium">
              {product.brandAr || product.brand}
            </span>
            <span className="text-gray-400">•</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              {product.categoryAr || product.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {product.nameAr || product.name}
          </h1>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-base font-bold text-gray-900">
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
          <div className="flex items-center gap-4 py-3 border-y border-gray-200">
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

          {/* Quick Add to Cart - Mobile Friendly */}
          {product.inStock && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-brand-maroon-50 to-brand-maroon-100 p-4 rounded-2xl border border-brand-maroon-200">
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full bg-white border-2 border-brand-maroon-300 flex items-center justify-center hover:bg-brand-maroon-50 active:scale-95 transition-all shadow-sm"
                >
                  <Minus size={18} className="text-brand-maroon-600" />
                </button>
                <span className="text-xl font-bold text-gray-900 w-10 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-full bg-white border-2 border-brand-maroon-300 flex items-center justify-center hover:bg-brand-maroon-50 active:scale-95 transition-all shadow-sm"
                >
                  <Plus size={18} className="text-brand-maroon-600" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                <ShoppingCart size={22} />
                <span>أضف للسلة</span>
              </button>
            </div>
          )}


          {/* Description */}
          {(product.descriptionAr || product.description) && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Info size={18} className="text-brand-maroon-600" />
                الوصف
              </h3>
              <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                {product.descriptionAr || product.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {(product.tags && product.tags.length > 0) && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Tag size={18} className="text-brand-maroon-600" />
                التصنيفات
              </h3>
              <div className="flex flex-wrap gap-2">
                {(product.tagsAr || product.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-brand-maroon-50 to-brand-maroon-100 text-brand-maroon-700 rounded-full text-sm font-medium border border-brand-maroon-200"
                  >
                    {product.tagsAr?.[index] || tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="font-bold text-gray-900 mb-4">تفاصيل المنتج</h3>
            <div className="grid grid-cols-2 gap-3">
              {product.gender && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">الجنس</p>
                  <p className="font-bold text-gray-900">{product.genderAr || product.gender}</p>
                </div>
              )}
              {product.size && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">الحجم</p>
                  <p className="font-bold text-gray-900">{product.sizeAr || product.size}</p>
                </div>
              )}
              {product.concentration && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">التركيز</p>
                  <p className="font-bold text-gray-900">{product.concentrationAr || product.concentration}</p>
                </div>
              )}
              {product.productType && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">نوع المنتج</p>
                  <p className="font-bold text-gray-900">{product.productTypeAr || product.productType}</p>
                </div>
              )}
            </div>
          </div>

          {/* Fragrance Family */}
          {product.fragranceFamily && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">عائلة العطر</h3>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium inline-block">
                {product.fragranceFamilyAr || product.fragranceFamily}
              </span>
            </div>
          )}

          {/* Fragrance Notes */}
          {(product.topNotes || product.middleNotes || product.baseNotes) && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-900 mb-4">مكونات الرائحة</h3>
              {product.topNotes && product.topNotes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Droplets size={16} className="text-blue-500" />
                    الرأسية (Top Notes)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.topNotes.map((note, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                      >
                        {product.topNotesAr?.[i] || note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.middleNotes && product.middleNotes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Wind size={16} className="text-brand-gold-600" />
                    القلبية (Middle Notes)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.middleNotes.map((note, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-brand-gold-50 text-brand-gold-700 rounded-full text-sm font-medium border border-brand-gold-200"
                      >
                        {product.middleNotesAr?.[i] || note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.baseNotes && product.baseNotes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Package size={16} className="text-gray-600" />
                    القاعدية (Base Notes)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.baseNotes.map((note, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200"
                      >
                        {product.baseNotesAr?.[i] || note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Season & Occasion */}
          {((product.season && product.season.length > 0) || (product.occasion && product.occasion.length > 0)) && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              {product.season && product.season.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-brand-maroon-600" />
                    الموسم المناسب
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(product.seasonAr || product.season || []).map((season, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                      >
                        {product.seasonAr?.[i] || season}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.occasion && product.occasion.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-brand-maroon-600" />
                    المناسبة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(product.occasionAr || product.occasion || []).map((occasion, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                      >
                        {product.occasionAr?.[i] || occasion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Longevity & Sillage */}
          {(product.longevity || product.sillage) && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-900 mb-3">الأداء</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.longevity && (
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Clock size={14} />
                      الثبات
                    </p>
                    <p className="font-bold text-gray-900">{product.longevityAr || product.longevity}</p>
                  </div>
                )}
                {product.sillage && (
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Wind size={14} />
                      الانتشار
                    </p>
                    <p className="font-bold text-gray-900">{product.sillageAr || product.sillage}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="px-4 py-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.map((relatedProduct) => (
                <EnhancedProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  view="grid"
                />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
