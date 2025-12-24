import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  SlidersHorizontal,
  X,
  ChevronDown,
  Loader2,
  Package
} from 'lucide-react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Product, ProductFilters } from '../types/perfume-shop';
import EnhancedProductCard from '../components/EnhancedProductCard';
import AdvancedFilters from '../components/AdvancedFilters';
import MaterialRipple from '../components/MaterialRipple';
import toast from 'react-hot-toast';

// منتجات افتراضية للعرض التوضيحي
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

export default function EnhancedProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // If Firebase is not configured, show empty state
      if (!isFirebaseConfigured) {
        console.warn('Firebase not configured');
        setProducts([]);
        setCategories([]);
        setBrands([]);
        setLoading(false);
        return;
      }

      // Fetch Products from Firebase
      try {
        let productsData: Product[] = [];
        try {
          const productsSnap = await getDocs(
            query(collection(db, 'products'), orderBy('createdAt', 'desc'))
          );
          productsData = productsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
        } catch (orderError) {
          console.error('Error with orderBy, trying without:', orderError);
          // If orderBy fails (no index), try without orderBy
          const productsSnap = await getDocs(collection(db, 'products'));
          productsData = productsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
        }
        
        setProducts(productsData);

        // Fetch Categories
        try {
          let categoriesData: any[] = [];
          try {
            const categoriesSnap = await getDocs(
              query(collection(db, 'categories'), orderBy('order', 'asc'))
            );
            categoriesData = categoriesSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          } catch (catOrderError) {
            console.error('Error with category orderBy, trying without:', catOrderError);
            const categoriesSnap = await getDocs(collection(db, 'categories'));
            categoriesData = categoriesSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
          setCategories(categoriesData);
        } catch (catError) {
          console.error('Error fetching categories:', catError);
          setCategories([]);
        }

        // Extract unique brands from products
        const uniqueBrands = Array.from(
          new Set(productsData.map(p => p.brand))
        ).map((brand, idx) => ({
          id: brand,
          name: brand,
          nameAr: productsData.find(p => p.brand === brand)?.brandAr || brand
        }));
        setBrands(uniqueBrands);

      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        setProducts([]);
        setCategories([]);
        setBrands([]);
        toast.error('حدث خطأ في تحميل البيانات من قاعدة البيانات');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setProducts([]);
      setCategories([]);
      setBrands([]);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.nameAr.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.descriptionAr?.toLowerCase().includes(query) ||
        p.brandAr?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    // Brand filter
    if (filters.brand) {
      result = result.filter(p => p.brand === filters.brand);
    }

    // Product type filter
    if (filters.productType) {
      result = result.filter(p => p.productType === filters.productType);
    }

    // Gender filter
    if (filters.gender) {
      result = result.filter(p => p.gender === filters.gender);
    }

    // Price range filter
    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) {
        result = result.filter(p => p.price >= filters.priceRange!.min!);
      }
      if (filters.priceRange.max !== undefined) {
        result = result.filter(p => p.price <= filters.priceRange!.max!);
      }
    }

    // Rating filter
    if (filters.rating) {
      result = result.filter(p => (p.rating || 0) >= filters.rating!);
    }

    // Availability filters
    if (filters.inStock) {
      result = result.filter(p => p.inStock);
    }

    if (filters.onSale) {
      result = result.filter(p => p.discount && p.discount > 0);
    }

    if (filters.isNew) {
      result = result.filter(p => p.isNew);
    }

    if (filters.isBestSeller) {
      result = result.filter(p => p.isBestSeller);
    }

    // Sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'bestseller':
        result.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });
    }

    return result;
  }, [products, searchQuery, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const activeFiltersCount = Object.keys(filters).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Mobile-First Header */}
      <div className="px-4 pt-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-1">جميع العطور</h1>
          <p className="text-sm text-gray-500">
            {filteredProducts.length} منتج متاح
          </p>
        </motion.div>

        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ابحث عن عطر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-2">
            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl font-medium text-sm hover:bg-gray-50 active:scale-95 transition-transform relative"
            >
              <Filter size={18} />
              <span>تصفية</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-brand-maroon-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 cursor-pointer"
              >
                <option value="newest">الأحدث</option>
                <option value="name">الاسم</option>
                <option value="price-asc">السعر: منخفض</option>
                <option value="price-desc">السعر: عالي</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Active Filters Pills */}
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-2 mb-4 pt-4 border-t border-gray-200"
          >
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <SlidersHorizontal size={16} />
              الفلاتر النشطة:
            </span>
            {Object.entries(filters).map(([key, value]) => (
              value && (
                <motion.div
                  key={key}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  <span>
                    {key === 'category' && categories.find(c => c.id === value)?.nameAr}
                    {key === 'brand' && brands.find(b => b.id === value)?.nameAr}
                    {key === 'priceRange' && `${value.min || 0} - ${value.max || '∞'}`}
                    {key === 'rating' && `${value}+ نجوم`}
                    {key === 'inStock' && 'متوفر'}
                    {key === 'onSale' && 'مخفض'}
                    {key === 'isNew' && 'جديد'}
                    {key === 'isBestSeller' && 'الأكثر مبيعاً'}
                  </span>
                  <button
                    onClick={() => setFilters(prev => {
                      const newFilters = { ...prev };
                      delete newFilters[key as keyof ProductFilters];
                      return newFilters;
                    })}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )
            ))}
            <button
              onClick={() => setFilters({})}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              مسح الكل
            </button>
          </motion.div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <AdvancedFilters
                filters={filters}
                onFilterChange={setFilters}
                categories={categories}
                brands={brands}
              />
            </div>
          </aside>

          {/* Mobile Filters Overlay */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 overflow-y-auto lg:hidden"
                >
                  <AdvancedFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    categories={categories}
                    brands={brands}
                    onClose={() => setShowFilters(false)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid/List */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-bold text-gray-900">{filteredProducts.length}</span>
                {' '}منتج
              </p>
            </div>

            {/* Products - Mobile Grid */}
            {paginatedProducts.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-2 gap-3"
                >
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map(product => (
                      <EnhancedProductCard
                        key={product.id}
                        product={product}
                        view="grid"
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Mobile Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-6 mb-6">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
                    >
                      السابق
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      صفحة {page} من {totalPages}
                    </span>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  لا توجد منتجات
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  لم نجد أي منتجات تطابق معايير البحث
                </p>
                <button
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-brand-maroon-600 text-white rounded-xl font-medium active:scale-95 transition-transform"
                >
                  مسح الفلاتر
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

