import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/perfume-shop';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { formatCurrency } from '../utils/helpers';
import EnhancedProductCard from '../components/EnhancedProductCard';
import { 
  ArrowRight, 
  Heart, 
  ShoppingCart, 
  Share2, 
  Minus, 
  Plus,
  ChevronLeft,
  Sparkles,
  Tag,
  Calendar,
  Clock,
  Droplets,
  Wind,
  Package,
  Award,
  Shield,
  Truck,
  RotateCcw,
  TrendingUp,
  CheckCircle2
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
      // Error fetching related products
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
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ رابط المنتج');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-brand-maroon-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">المنتج غير موجود</h2>
            <p className="text-gray-600 mb-6">عذراً، المنتج الذي تبحث عنه غير متوفر</p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-maroon-600 text-white rounded-full font-medium hover:bg-brand-maroon-700 transition-colors"
            >
              <ArrowRight size={18} />
              <span>العودة للمنتجات</span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const finalPrice = (product.discount && product.discount > 0 && product.price > 0)
    ? product.price - (product.price * product.discount / 100)
    : product.price;
  
  // Ensure price is valid before displaying
  const displayPrice = finalPrice && finalPrice > 0 ? finalPrice : null;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.thumbnail];

  return (
    <div className="min-h-screen bg-white">
      {/* Elegant Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={22} className="text-gray-700" />
          </motion.button>
          
          <h1 className="text-base font-semibold text-gray-900">تفاصيل المنتج</h1>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Share2 size={18} className="text-gray-700" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFavorite}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isFavorite 
                  ? 'bg-red-50 text-red-500' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pb-32">
        {/* Hero Image Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50"
        >
          <div className="relative aspect-square w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={images[selectedImageIndex]}
                alt={product.nameAr}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-contain p-8"
              />
            </AnimatePresence>

            {/* Product Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.featured && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <Sparkles size={12} />
                  <span>مميز</span>
                </motion.div>
              )}
              {product.isNew && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                >
                  جديد
                </motion.div>
              )}
              {product.isBestSeller && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                  className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <TrendingUp size={12} />
                  <span>الأكثر مبيعاً</span>
                </motion.div>
              )}
              {product.discount && product.discount > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                >
                  خصم {product.discount}%
                </motion.div>
              )}
            </div>

            {/* Stock Status */}
            {!product.inStock && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                غير متوفر
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="px-4 pb-4">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-brand-maroon-600 ring-2 ring-brand-maroon-200'
                        : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.nameAr} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Product Information Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-t-3xl -mt-6 relative z-10 shadow-xl"
        >
          <div className="px-5 pt-6 pb-8 space-y-6">
            {/* Brand & Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-brand-maroon-50 text-brand-maroon-700 rounded-full text-sm font-semibold">
                {product.brandAr || product.brand}
              </span>
              <span className="text-gray-300">•</span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                {product.categoryAr || product.category}
              </span>
            </div>

            {/* Product Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 leading-tight"
            >
              {product.nameAr || product.name}
            </motion.h1>

            {/* Price Section */}
            {displayPrice && displayPrice > 0 && product.price > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-baseline gap-3 pb-4 border-b border-gray-100"
              >
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(displayPrice, 'LYD')}
                </span>
                {product.discount && product.discount > 0 && product.price > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatCurrency(product.price, 'LYD')}
                    </span>
                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-bold">
                      خصم {product.discount}%
                    </span>
                  </>
                )}
              </motion.div>
            )}

            {/* Description */}
            {(product.descriptionAr || product.description) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-2"
              >
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  الوصف
                </h3>
                <p className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-line">
                  {product.descriptionAr || product.description}
                </p>
              </motion.div>
            )}

            {/* Fragrance Family */}
            {product.fragranceFamily && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-4 border-t border-gray-100"
              >
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  عائلة العطر
                </h3>
                <span className="inline-block px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                  {product.fragranceFamilyAr || product.fragranceFamily}
                </span>
              </motion.div>
            )}

            {/* Fragrance Notes */}
            {(product.topNotes || product.middleNotes || product.baseNotes) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="pt-4 border-t border-gray-100 space-y-5"
              >
                <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                  مكونات الرائحة
                </h3>
                
                {product.topNotes && product.topNotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Droplets size={16} className="text-blue-600" />
                      </div>
                      <p className="font-semibold text-gray-900">الرأسية</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.topNotes.map((note, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                        >
                          {product.topNotesAr?.[i] || note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.middleNotes && product.middleNotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Wind size={16} className="text-amber-600" />
                      </div>
                      <p className="font-semibold text-gray-900">القلبية</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.middleNotes.map((note, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200"
                        >
                          {product.middleNotesAr?.[i] || note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.baseNotes && product.baseNotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Package size={16} className="text-gray-700" />
                      </div>
                      <p className="font-semibold text-gray-900">القاعدية</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.baseNotes.map((note, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                        >
                          {product.baseNotesAr?.[i] || note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Product Details Grid */}
            {(product.gender || product.size || product.concentration || product.productType) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-4 border-t border-gray-100"
              >
                <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                  تفاصيل المنتج
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.gender && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">الجنس</p>
                      <p className="font-bold text-gray-900">{product.genderAr || product.gender}</p>
                    </div>
                  )}
                  {product.size && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">الحجم</p>
                      <p className="font-bold text-gray-900">{product.sizeAr || product.size}</p>
                    </div>
                  )}
                  {product.concentration && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">التركيز</p>
                      <p className="font-bold text-gray-900">{product.concentrationAr || product.concentration}</p>
                    </div>
                  )}
                  {product.productType && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">نوع المنتج</p>
                      <p className="font-bold text-gray-900">{product.productTypeAr || product.productType}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Season & Occasion */}
            {((product.season && product.season.length > 0) || (product.occasion && product.occasion.length > 0)) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="pt-4 border-t border-gray-100 space-y-4"
              >
                {product.season && product.season.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={18} className="text-green-600" />
                      <h3 className="font-semibold text-gray-900">الموسم المناسب</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(product.seasonAr || product.season || []).map((season, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200"
                        >
                          {product.seasonAr?.[i] || season}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.occasion && product.occasion.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={18} className="text-purple-600" />
                      <h3 className="font-semibold text-gray-900">المناسبة</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(product.occasionAr || product.occasion || []).map((occasion, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
                        >
                          {product.occasionAr?.[i] || occasion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Longevity & Sillage */}
            {(product.longevity || product.sillage) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="pt-4 border-t border-gray-100"
              >
                <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                  الأداء
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.longevity && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-gray-600" />
                        <p className="text-xs font-semibold text-gray-700 uppercase">الثبات</p>
                      </div>
                      <p className="font-bold text-gray-900">{product.longevityAr || product.longevity}</p>
                    </div>
                  )}
                  {product.sillage && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Wind size={16} className="text-gray-600" />
                        <p className="text-xs font-semibold text-gray-700 uppercase">الانتشار</p>
                      </div>
                      <p className="font-bold text-gray-900">{product.sillageAr || product.sillage}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tags */}
            {(product.tags && product.tags.length > 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="pt-4 border-t border-gray-100"
              >
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  التصنيفات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(product.tagsAr || product.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-brand-maroon-50 to-brand-maroon-100 text-brand-maroon-700 rounded-lg text-sm font-medium border border-brand-maroon-200"
                    >
                      {product.tagsAr?.[index] || tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="pt-6 border-t border-gray-100"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Shield className="mx-auto mb-2 text-brand-maroon-600" size={24} />
                  <p className="text-xs text-gray-600 font-medium">ضمان الجودة</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Truck className="mx-auto mb-2 text-brand-maroon-600" size={24} />
                  <p className="text-xs text-gray-600 font-medium">شحن سريع</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <RotateCcw className="mx-auto mb-2 text-brand-maroon-600" size={24} />
                  <p className="text-xs text-gray-600 font-medium">إرجاع سهل</p>
                </div>
              </div>
            </motion.div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="pt-6 border-t border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">منتجات مشابهة</h3>
                  <Link 
                    to="/products" 
                    className="text-brand-maroon-600 text-sm font-medium flex items-center gap-1"
                  >
                    <span>عرض الكل</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {relatedProducts.map((relatedProduct, index) => (
                    <motion.div
                      key={relatedProduct.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                    >
                      <EnhancedProductCard
                        product={relatedProduct}
                        view="grid"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Elegant Bottom Action Bar */}
      {product.inStock && displayPrice && displayPrice > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-3 max-w-md mx-auto">
              {/* Quantity Selector */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={16} />
                </motion.button>
                <span className="font-bold text-gray-900 w-8 text-center text-sm">
                  {quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                >
                  <Plus size={16} />
                </motion.button>
              </div>

              {/* Add to Cart Button */}
              {displayPrice && displayPrice > 0 && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white rounded-full py-4 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <ShoppingCart size={20} />
                  <span>أضف إلى السلة</span>
                  <span className="text-sm opacity-90">
                    {formatCurrency(displayPrice * quantity, 'LYD')}
                  </span>
                </motion.button>
              )}
            </div>
            
            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
              <CheckCircle2 size={14} className="text-green-600" />
              <p className="text-xs text-gray-600">ضمان أصالة المنتج</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
