import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "react-hot-toast";

// Pages (you'll need to create these)
import HomePage from "./pages/HomePage";
import MobileHomePage from "./pages/MobileHomePage";
import EnhancedProductsPage from "./pages/EnhancedProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FavoritesPage from "./pages/FavoritesPage";
import ContactPage from "./pages/ContactPage";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EnhancedDashboardHome from "./pages/admin/EnhancedDashboardHome";
import BannersManagement from "./pages/admin/BannersManagement";
import MobileAdminLayout from "./components/admin/MobileAdminLayout";
import MobileDashboard from "./pages/admin/MobileDashboard";
import MobileOrders from "./pages/admin/MobileOrders";
import MobileProducts from "./pages/admin/MobileProducts";
import MobileCustomers from "./pages/admin/MobileCustomers";
import TelegramManagement from "./pages/admin/TelegramManagement";
import MobileSettings from "./pages/admin/MobileSettings";
import MobileContactMessages from "./pages/admin/MobileContactMessages";
import ProductForm from "./pages/admin/ProductForm";
import { useTelegramNotification } from "./hooks/useTelegramNotification";

// Components
import MobileLayout from "./components/MobileLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const { setUser, setIsAdmin, setLoading, loading: authLoading } = useAuthStore();
  
  // Enable Telegram notifications for new orders
  useTelegramNotification();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Check if user is admin
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          setIsAdmin(adminDoc.exists());
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setIsAdmin, setLoading]);

  // Loading screen to prevent white screen on initial load
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-maroon-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{
          top: '20px',
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#1f2937",
            borderRadius: "12px",
            padding: "16px",
            fontFamily: "Cairo, sans-serif",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          },
        }}
      />

      <ScrollToTop />

      <Routes>
        {/* Public Routes - Mobile First */}
        <Route
          path="/*"
          element={
            <MobileLayout />
          }
        >
          <Route index element={<MobileHomePage />} />
          <Route path="products" element={<EnhancedProductsPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="profile" element={<ContactPage />} />
          <Route path="search" element={<EnhancedProductsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <MobileAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MobileDashboard />} />
          <Route path="orders" element={<MobileOrders />} />
          <Route path="products" element={<MobileProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="customers" element={<MobileCustomers />} />
          <Route path="messages" element={<MobileContactMessages />} />
          <Route path="telegram" element={<TelegramManagement />} />
          <Route path="settings" element={<MobileSettings />} />
          {/* Legacy routes for backward compatibility */}
          <Route path="dashboard" element={<EnhancedDashboardHome />} />
          <Route path="banners" element={<BannersManagement />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

