import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { DashboardStats, Order, Product } from '../../types/perfume-shop';
import { format, startOfDay, startOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function MobileDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      const productsSnap = await getDocs(collection(db, 'products'));
      const products = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      const now = new Date();
      const todayStart = startOfDay(new Date());
      const monthStart = startOfMonth(new Date());

      const todayOrders = orders.filter(o => {
        const orderDate = o.createdAt?.toDate?.() || new Date(0);
        return orderDate >= todayStart;
      });
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

      const monthlyOrders = orders.filter(o => {
        const orderDate = o.createdAt?.toDate?.() || new Date(0);
        return orderDate >= monthStart;
      });
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);

      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
      const totalCustomers = new Set(orders.map(o => o.customerPhone)).size;

      const previousMonthStart = new Date(monthStart);
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
      const previousMonthOrders = orders.filter(o => {
        const orderDate = o.createdAt?.toDate?.() || new Date(0);
        return orderDate >= previousMonthStart && orderDate < monthStart;
      });
      const previousMonthRevenue = previousMonthOrders.reduce((sum, o) => sum + o.total, 0);
      const revenueGrowth = previousMonthRevenue > 0
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

      setStats({
        totalRevenue: monthlyRevenue,
        revenueGrowth,
        monthlyRevenue,
        totalOrders: orders.length,
        ordersGrowth: 0,
        pendingOrders,
        shippedOrders: orders.filter(o => o.status === 'shipped').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        totalProducts: products.length,
        productsGrowth: 0,
        lowStockProducts: products.filter(p => p.inStock && (p.stockQuantity || 0) < 10).length,
        outOfStockProducts: products.filter(p => !p.inStock).length,
        totalCustomers,
        customersGrowth: 0,
        newCustomers: 0,
        activeCustomers: 0,
        totalReviews: 0,
        averageRating: 0,
        pendingReviews: 0,
        period: 'month',
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    trendValue,
    subtitle
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: 'up' | 'down';
    trendValue?: number;
    subtitle?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-white" size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span className="text-xs font-bold">{Math.abs(trendValue || 0).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-xs mb-1 font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4 pb-4">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-1">مرحباً بك 👋</h2>
        <p className="text-sm text-gray-500">نظرة سريعة على متجرك</p>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="إيرادات الشهر"
          value={`${(stats.monthlyRevenue / 1000).toFixed(1)}K`}
          subtitle="IQD"
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          trend={stats.revenueGrowth >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(stats.revenueGrowth)}
        />
        <StatCard
          title="الطلبات"
          value={stats.totalOrders}
          subtitle="إجمالي الطلبات"
          icon={ShoppingBag}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="المنتجات"
          value={stats.totalProducts}
          subtitle="منتج متاح"
          icon={Package}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="العملاء"
          value={stats.totalCustomers}
          subtitle="عميل نشط"
          icon={Users}
          color="bg-gradient-to-br from-pink-500 to-rose-600"
        />
      </div>

      {/* Today's Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-brand-maroon-600 to-brand-maroon-700 rounded-2xl p-5 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={20} />
            <h3 className="font-bold text-lg">نشاط اليوم</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/80 mb-1">طلبات اليوم</p>
            <p className="text-2xl font-bold">{stats.pendingOrders}</p>
          </div>
          <div>
            <p className="text-xs text-white/80 mb-1">مبيعات اليوم</p>
            <p className="text-2xl font-bold">{(stats.monthlyRevenue / 30).toFixed(0)}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">إحصائيات سريعة</h3>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingBag size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">الطلبات المعلقة</p>
                <p className="text-xs text-gray-500">تحتاج إلى معالجة</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Package size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">منتجات منخفضة المخزون</p>
                <p className="text-xs text-gray-500">تحتاج إلى إعادة تزويد</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{stats.lowStockProducts}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">الطلبات المكتملة</p>
                <p className="text-xs text-gray-500">تم التوصيل</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{stats.deliveredOrders}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

