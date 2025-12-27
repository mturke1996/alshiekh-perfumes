import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Image as ImageIcon,
  Bot,
  MessageSquare,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import BrandLogo from "../BrandLogo";

// جميع التبويبات للـ sidebar
const allTabs = [
  {
    id: "dashboard",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    path: "/admin",
  },
  { id: "orders", label: "الطلبات", icon: ShoppingBag, path: "/admin/orders" },
  { id: "products", label: "العطور", icon: Package, path: "/admin/products" },
  { id: "customers", label: "العملاء", icon: Users, path: "/admin/customers" },
  {
    id: "messages",
    label: "الرسائل",
    icon: MessageSquare,
    path: "/admin/messages",
  },
  { id: "telegram", label: "Telegram", icon: Bot, path: "/admin/telegram" },
  {
    id: "settings",
    label: "الإعدادات",
    icon: Settings,
    path: "/admin/settings",
  },
];

// التبويبات التي ستظهر في الشريط السفلي فقط
const bottomNavTabs = allTabs.filter(
  (tab) =>
    tab.id === "dashboard" ||
    tab.id === "orders" ||
    tab.id === "products" ||
    tab.id === "messages"
);

export default function MobileAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const activeTab =
    allTabs.find(
      (tab) =>
        location.pathname === tab.path ||
        (tab.path === "/admin" && location.pathname === "/admin")
    )?.id || "dashboard";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/admin/login");
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Top Header - Mobile Style */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <Menu size={22} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <div>
                <h1 className="text-sm font-bold bg-gradient-to-r from-brand-maroon-600 to-brand-gold-600 bg-clip-text text-transparent">
                  ALSHIEKH PARFUMES
                </h1>
                <p className="text-xs text-gray-500">لوحة التحكم</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95">
              <Bell size={20} className="text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
                <p className="text-xs text-gray-500 mr-16">{user?.email}</p>
              </div>

              <nav className="p-4 space-y-2">
                {allTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive =
                    location.pathname === tab.path ||
                    (tab.path === "/admin" && location.pathname === "/admin");

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        navigate(tab.path);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-brand-maroon-500 to-brand-maroon-600 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={22} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}

                {/* Hero Images Management */}
                <button
                  onClick={() => {
                    navigate("/admin/banners");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === "/admin/banners"
                      ? "bg-gradient-to-r from-brand-maroon-500 to-brand-maroon-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ImageIcon size={22} />
                  <span className="font-medium">صور الهيرو</span>
                </button>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">تسجيل الخروج</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-md mx-auto">
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
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {bottomNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all relative ${
                  isActive ? "text-brand-maroon-600" : "text-gray-500"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-maroon-50 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  size={22}
                  className={`relative z-10 ${
                    isActive ? "scale-110" : ""
                  } transition-transform`}
                />
                <span
                  className={`text-xs font-medium relative z-10 ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-maroon-600 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
