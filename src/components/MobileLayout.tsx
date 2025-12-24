import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ShoppingCart
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import BrandLogo from './BrandLogo';

const tabs = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/' },
  { id: 'products', label: 'العطور', icon: ShoppingBag, path: '/products' },
  { id: 'search', label: 'بحث', icon: Search, path: '/search' },
  { id: 'favorites', label: 'المفضلة', icon: Heart, path: '/favorites' },
  { id: 'profile', label: 'الحساب', icon: User, path: '/profile' },
];

export default function MobileLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const cartItemsCount = useCartStore((state) => state.getItemsCount());
  const favoritesCount = useFavoritesStore((state) => state.items.length);
  const { user } = useAuthStore();

  const activeTab = tabs.find(tab => {
    if (tab.path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(tab.path);
  })?.id || 'home';

  const handleTabClick = (path: string) => {
    if (path === '/search') {
      // Handle search action
      return;
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Header - Mobile Style */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <Menu size={22} className="text-gray-700" />
            </button>
            <Link to="/" className="flex items-center gap-2 flex-1 min-w-0">
              <BrandLogo size="sm" className="flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm font-bold bg-gradient-to-r from-brand-maroon-600 to-brand-gold-600 bg-clip-text text-transparent truncate">
                  ALSHIEKH PARFUMES
                </h1>
                <p className="text-xs text-gray-500 truncate">الشيخ للعطور</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              to="/favorites"
              className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <Heart 
                size={20} 
                className={location.pathname === '/favorites' ? 'text-red-500 fill-red-500' : 'text-gray-700'} 
              />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {favoritesCount}
                </span>
              )}
            </Link>
            
            <Link 
              to="/cart"
              className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <ShoppingCart size={20} className="text-gray-700" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-maroon-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <BrandLogo size="md" showText={true} variant="full" />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <nav className="p-4 space-y-2">
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Home size={22} />
                  <span className="font-medium">الرئيسية</span>
                </Link>
                <Link
                  to="/products"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingBag size={22} />
                  <span className="font-medium">جميع العطور</span>
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Heart size={22} />
                  <span className="font-medium">المفضلة</span>
                  {favoritesCount > 0 && (
                    <span className="mr-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingCart size={22} />
                  <span className="font-medium">السلة</span>
                  {cartItemsCount > 0 && (
                    <span className="mr-auto bg-brand-maroon-100 text-brand-maroon-600 text-xs px-2 py-1 rounded-full font-bold">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User size={22} />
                  <span className="font-medium">اتصل بنا</span>
                </Link>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                {user ? (
                  <Link
                    to="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-maroon-500 to-brand-maroon-600 text-white font-medium"
                  >
                    <User size={20} />
                    <span>لوحة التحكم</span>
                  </Link>
                ) : (
                  <Link
                    to="/admin/login"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-maroon-500 to-brand-maroon-600 text-white font-medium"
                  >
                    <User size={20} />
                    <span>تسجيل الدخول</span>
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-140px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Mobile App Style */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            if (tab.id === 'search') {
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.path)}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all relative"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-maroon-600 to-brand-gold-600 flex items-center justify-center shadow-lg">
                    <Icon size={22} className="text-white" />
                  </div>
                </button>
              );
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-brand-maroon-600'
                    : 'text-gray-500'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-maroon-50 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  size={22}
                  className={`relative z-10 ${isActive ? 'scale-110' : ''} transition-transform ${
                    tab.id === 'favorites' && isActive ? 'fill-brand-maroon-600' : ''
                  }`}
                />
                <span className={`text-xs font-medium relative z-10 ${isActive ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-maroon-600 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}

