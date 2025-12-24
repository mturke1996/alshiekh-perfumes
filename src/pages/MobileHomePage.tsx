import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Sparkles, 
  Shield, 
  Truck, 
  Tag,
  Star,
  TrendingUp,
  Zap,
  Package,
  Phone,
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Product } from '../types/perfume-shop';
import EnhancedProductCard from '../components/EnhancedProductCard';
import BrandLogo from '../components/BrandLogo';
import PerfumeCarousel from '../components/PerfumeCarousel';

// منتجات افتراضية جميلة للعرض
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Tom Ford Black Orchid',
    nameAr: 'عطر توم فورد - بلاك أوركيد',
    description: 'Luxury perfume with enchanting black orchid scent',
    descriptionAr: 'عطر فاخر برائحة الأوركيد الأسود الساحرة',
    price: 350,
    discount: 22,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=95'],
    thumbnail: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=95',
    category: 'perfume',
    categoryAr: 'عطور',
    brand: 'Tom Ford',
    brandAr: 'توم فورد',
    productType: 'perfume',
    productTypeAr: 'عطر',
    gender: 'unisex',
    genderAr: 'للجنسين',
    inStock: true,
    rating: 4.8,
    reviewCount: 125,
    featured: true,
    isNew: false,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  },
  {
    id: '2',
    name: 'Chanel No. 5',
    nameAr: 'عطر شانيل - نمر 5',
    description: 'Classic elegant perfume with French floral notes',
    descriptionAr: 'عطر كلاسيكي أنيق برائحة الزهور الفرنسية',
    price: 420,
    discount: 19,
    images: ['https://images.unsplash.com/photo-1595425970377-c97002967f21?w=600&q=95'],
    thumbnail: 'https://images.unsplash.com/photo-1595425970377-c97002967f21?w=600&q=95',
    category: 'perfume',
    categoryAr: 'عطور',
    brand: 'Chanel',
    brandAr: 'شانيل',
    productType: 'perfume',
    productTypeAr: 'عطر',
    gender: 'women',
    genderAr: 'نسائي',
    inStock: true,
    rating: 4.9,
    reviewCount: 203,
    featured: true,
    isNew: true,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  },
  {
    id: '3',
    name: 'Dior Sauvage',
    nameAr: 'عطر ديور - مسيور',
    description: 'Strong masculine perfume with wood and spice notes',
    descriptionAr: 'عطر رجالي قوي برائحة الخشب والبهارات',
    price: 380,
    discount: 21,
    images: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=95'],
    thumbnail: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=95',
    category: 'perfume',
    categoryAr: 'عطور',
    brand: 'Dior',
    brandAr: 'ديور',
    productType: 'perfume',
    productTypeAr: 'عطر',
    gender: 'men',
    genderAr: 'رجالي',
    inStock: true,
    rating: 4.7,
    reviewCount: 98,
    featured: true,
    isNew: false,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  },
  {
    id: '4',
    name: 'Versace Eros',
    nameAr: 'عطر فيرساتشي - إروس',
    description: 'Elegant perfume with citrus and rose notes',
    descriptionAr: 'عطر أنيق برائحة الحمضيات والورود',
    price: 320,
    discount: 20,
    images: ['https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=600&q=95'],
    thumbnail: 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=600&q=95',
    category: 'perfume',
    categoryAr: 'عطور',
    brand: 'Versace',
    brandAr: 'فيرساتشي',
    productType: 'perfume',
    productTypeAr: 'عطر',
    gender: 'men',
    genderAr: 'رجالي',
    inStock: true,
    rating: 4.6,
    reviewCount: 156,
    featured: false,
    isNew: true,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  },
  {
    id: '5',
    name: 'Prada Candy',
    nameAr: 'عطر برادا - كانداي',
    description: 'Sweet feminine perfume with caramel and vanilla notes',
    descriptionAr: 'عطر نسائي حلو برائحة الكراميل والفانيليا',
    price: 290,
    discount: 19,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=95'],
    thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=95',
    category: 'perfume',
    categoryAr: 'عطور',
    brand: 'Prada',
    brandAr: 'برادا',
    productType: 'perfume',
    productTypeAr: 'عطر',
    gender: 'women',
    genderAr: 'نسائي',
    inStock: true,
    rating: 4.5,
    reviewCount: 87,
    featured: false,
    isNew: true,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  },
  {
    id: '6',
    name: 'Armani Acqua di Gio',
    nameAr: 'عطر أرماني - أكوا دي جيو',
    description: 'Fresh perfume with marine and aquatic notes',
    descriptionAr: 'عطر منعش برائحة البحر والنباتات البحرية',
    price: 340,
    discount: 21,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=95'],
    thumbnail: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=95',
    category: 'perfume',
    categoryAr: 'عطور',
    brand: 'Armani',
    brandAr: 'أرماني',
    productType: 'perfume',
    productTypeAr: 'عطر',
    gender: 'men',
    genderAr: 'رجالي',
    inStock: true,
    rating: 4.7,
    reviewCount: 142,
    featured: true,
    isNew: false,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  }
];

export default function MobileHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // If Firebase is not configured, show empty state
      if (!isFirebaseConfigured) {
        console.warn('Firebase not configured');
        setFeaturedProducts([]);
        setNewProducts([]);
        setLoading(false);
        return;
      }

      // Try to fetch from Firebase
      try {
        // Featured products
        try {
          const featuredQuery = query(
            collection(db, 'products'),
            where('featured', '==', true),
            orderBy('createdAt', 'desc'),
            limit(6)
          );
          const featuredSnap = await getDocs(featuredQuery);
          const featuredData = featuredSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          
          setFeaturedProducts(featuredData);
        } catch (featuredError) {
          console.error('Error fetching featured products:', featuredError);
          // If orderBy fails (no index), try without orderBy
          try {
            const featuredQuery = query(
              collection(db, 'products'),
              where('featured', '==', true),
              limit(6)
            );
            const featuredSnap = await getDocs(featuredQuery);
            const featuredData = featuredSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Product[];
            setFeaturedProducts(featuredData);
          } catch (error2) {
            console.error('Error fetching featured products (fallback):', error2);
            setFeaturedProducts([]);
          }
        }

        // New products
        try {
          const newQuery = query(
            collection(db, 'products'),
            orderBy('createdAt', 'desc'),
            limit(6)
          );
          const newSnap = await getDocs(newQuery);
          const newData = newSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          
          setNewProducts(newData);
        } catch (newError) {
          console.error('Error fetching new products:', newError);
          // If orderBy fails (no index), try without orderBy
          try {
            const newQuery = query(
              collection(db, 'products'),
              limit(6)
            );
            const newSnap = await getDocs(newQuery);
            const newData = newSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Product[];
            setNewProducts(newData);
          } catch (error2) {
            console.error('Error fetching new products (fallback):', error2);
            setNewProducts([]);
          }
        }
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        setFeaturedProducts([]);
        setNewProducts([]);
      }

    } catch (error) {
      console.error('Error fetching products:', error);
      setFeaturedProducts([]);
      setNewProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'جودة مضمونة',
      description: 'منتجات أصلية 100%',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Truck,
      title: 'توصيل سريع',
      description: 'خلال 24 ساعة',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Tag,
      title: 'أسعار تنافسية',
      description: 'أفضل الأسعار',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* Hero Carousel - صور عالية الجودة بدون نصوص */}
      <PerfumeCarousel />

      {/* Quick Features - Mobile Optimized */}
      <div className="grid grid-cols-3 gap-2 px-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100 active:scale-95 transition-transform"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} mb-2`}>
                <Icon className="text-white" size={18} />
              </div>
              <h3 className="text-xs font-bold text-gray-900 mb-0.5 leading-tight">{feature.title}</h3>
              <p className="text-[10px] text-gray-500 leading-tight">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Featured Products */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-maroon-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900">المميزة</h2>
          </div>
          <Link
            to="/products?featured=true"
            className="text-sm text-brand-maroon-600 font-medium"
          >
            عرض الكل
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl aspect-[3/4] animate-pulse"></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnhancedProductCard product={product} view="grid" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto text-gray-300 mb-2" />
            <p>لا توجد منتجات مميزة حالياً</p>
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brand-gold-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900">وصل حديثاً</h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="text-sm text-brand-maroon-600 font-medium"
          >
            عرض الكل
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl aspect-[3/4] animate-pulse"></div>
            ))}
          </div>
        ) : newProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {newProducts.slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnhancedProductCard product={product} view="grid" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto text-gray-300 mb-2" />
            <p>لا توجد منتجات جديدة حالياً</p>
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
              href="tel:+218915080707"
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 bg-gradient-to-r from-brand-maroon-50 to-brand-maroon-100 rounded-2xl p-4 border border-brand-maroon-200 active:bg-brand-maroon-200 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-maroon-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Phone className="text-white" size={20} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500 mb-0.5">الهاتف</p>
                <p className="font-bold text-gray-900">091 508 0707</p>
              </div>
              <ArrowRight className="text-brand-maroon-600" size={18} />
            </motion.a>

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
              <ArrowRight className="text-brand-gold-600" size={18} />
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
              <ArrowRight className="text-blue-600" size={18} />
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

              <motion.a
                href="https://wa.me/218915080707"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="text-white" size={24} />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

