import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Zap,
  Package,
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Product } from '../types/perfume-shop';
import EnhancedProductCard from '../components/EnhancedProductCard';
import PerfumeCarousel from '../components/PerfumeCarousel';

export default function MobileHomePage() {
  const location = useLocation();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts();
  }, [location.pathname]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      
      if (!isFirebaseConfigured) {
        setAllProducts([]);
        setLoading(false);
        return;
      }
      
      const productsSnap = await getDocs(collection(db, 'products'));
      const productsData = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setAllProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', labelAr: 'الكل' },
    { id: 'perfume', labelAr: 'عطور' },
    { id: 'makeup', labelAr: 'مكياج' },
    { id: 'skincare', labelAr: 'العناية بالبشرة' },
    { id: 'haircare', labelAr: 'العناية بالشعر' },
    { id: 'gift-set', labelAr: 'طقم هدايا' },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-4 pb-4">
      {/* Hero Carousel */}
      <PerfumeCarousel />

      {/* Category Navigation - Horizontal Scrollable */}
      <div className="px-4 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-maroon-300'
              }`}
            >
              {category.labelAr}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <section className="px-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl aspect-[3/4] animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EnhancedProductCard product={product} view="grid" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">لا توجد منتجات في هذه الفئة</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-4 mb-6 rounded-3xl overflow-hidden"
      >
        <div className="bg-gradient-to-br from-brand-gold-500 to-brand-gold-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <Zap className="mb-3" size={32} />
            <h3 className="text-xl font-bold mb-2">عروض حصرية</h3>
            <p className="text-white/90 text-sm mb-4">
              احصل على خصومات خاصة عند التسوق الآن
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-gold-600 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              <span>تسوق الآن</span>
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Contact & Social Media Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="px-4 pb-6"
      >
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xl">
          <div className="text-center mb-6">
            <h3 className="font-bold text-2xl text-gray-900 mb-2">تواصل معنا</h3>
            <p className="text-sm text-gray-500">نحن هنا لخدمتك على مدار الساعة</p>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-3 mb-6">
            <motion.a
              href="https://maps.google.com/?q=تاج+مول+تاجوراء"
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 bg-gradient-to-r from-brand-gold-50 to-brand-gold-100 rounded-2xl p-4 border border-brand-gold-200 active:bg-brand-gold-200 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-gold-600 flex items-center justify-center shadow-md flex-shrink-0">
                <MapPin className="text-white" size={20} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500 mb-0.5">العنوان</p>
                <p className="font-bold text-gray-900 text-sm leading-snug">تاج مول - الطابق الأرضي<br />جزيرة الأندلسي - تاجوراء</p>
              </div>
              <ArrowLeft className="text-brand-gold-600" size={18} />
            </motion.a>

            <motion.a
              href="mailto:info@alshiekhparfumes.com"
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 active:bg-blue-200 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Mail className="text-white" size={20} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500 mb-0.5">البريد الإلكتروني</p>
                <p className="font-bold text-gray-900 text-sm">info@alshiekhparfumes.com</p>
              </div>
              <ArrowLeft className="text-blue-600" size={18} />
            </motion.a>
          </div>

          {/* Social Media Icons */}
          <div className="border-t border-brand-maroon-200 pt-6">
            <p className="text-center text-gray-700 font-medium mb-4">تابعنا على</p>
            <div className="flex items-center justify-center gap-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <Facebook className="text-white" size={24} />
              </motion.a>

              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <Instagram className="text-white" size={24} />
              </motion.a>

              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <Twitter className="text-white" size={24} />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
