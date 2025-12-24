import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users,
  Star,
  AlertCircle,
  Eye,
  Heart,
  ArrowRight,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { DashboardStats, Order, Product, Review } from '../../types/perfume-shop';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';
import MaterialRipple from '../../components/MaterialRipple';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function EnhancedDashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch all orders
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      // Fetch all products
      const productsSnap = await getDocs(collection(db, 'products'));
      const products = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // Fetch reviews
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      const reviews = reviewsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      // Calculate stats
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const monthStart = startOfMonth(new Date());

      // Total stats
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const totalProducts = products.length;
      const totalReviews = reviews.length;

      // Today stats
      const todayOrders = orders.filter(o => {
        const orderDate = o.createdAt?.toDate?.() || new Date(0);
        return orderDate >= todayStart;
      });
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

      // Monthly stats
      const monthlyOrders = orders.filter(o => {
        const orderDate = o.createdAt?.toDate?.() || new Date(0);
        return orderDate >= monthStart;
      });
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);

      // Pending orders
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      // Pending reviews
      const pendingReviews = reviews.filter(r => !r.approved).length;

      // Low stock products
      const lowStockProducts = products.filter(
        p => p.inStock && (p.stockQuantity || 0) < (p.lowStockThreshold || 10)
      ).length;

      // Popular products
      const popularProducts = products
        .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          nameAr: p.nameAr,
          image: p.thumbnail || p.images[0],
          sales: p.totalSales || 0,
          revenue: (p.totalSales || 0) * p.price,
          rating: p.rating
        }));

      // Recent orders
      const recentOrders = orders
        .sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        })
        .slice(0, 10);

      // Recent reviews
      const recentReviews = reviews
        .sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        })
        .slice(0, 5);

      // Calculate growth
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
      const ordersGrowth = previousMonthOrders.length > 0
        ? ((monthlyOrders.length - previousMonthOrders.length) / previousMonthOrders.length) * 100
        : 0;

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalCustomers: new Set(orders.map(o => o.customerPhone)).size,
        totalReviews,
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingOrders,
        pendingReviews,
        lowStockProducts,
        monthlyRevenue,
        monthlyOrders: monthlyOrders.length,
        revenueGrowth,
        ordersGrowth,
        popularProducts,
        recentOrders,
        recentReviews
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
    trendValue 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    trend?: 'up' | 'down';
    trendValue?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-sm font-bold">{trendValue?.toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Chart data
  const salesChartData = {
    labels: Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), 6 - i), 'd MMM', { locale: ar })
    ),
    datasets: [
      {
        label: 'المبيعات',
        data: Array.from({ length: 7 }, () => Math.random() * 10000),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const categoryChartData = {
    labels: ['عطور', 'مكياج', 'العناية بالبشرة', 'العناية بالشعر', 'أخرى'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">نظرة عامة</h2>
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
          {[
            { value: 'today', label: 'اليوم' },
            { value: 'week', label: 'أسبوع' },
            { value: 'month', label: 'شهر' },
            { value: 'year', label: 'سنة' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الإيرادات"
          value={`${stats.monthlyRevenue.toFixed(0)} IQD`}
          icon={DollarSign}
          color="from-green-500 to-emerald-600"
          trend={stats.revenueGrowth >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(stats.revenueGrowth)}
        />
        <StatCard
          title="إجمالي الطلبات"
          value={stats.monthlyOrders}
          icon={ShoppingBag}
          color="from-blue-500 to-blue-600"
          trend={stats.ordersGrowth >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(stats.ordersGrowth)}
        />
        <StatCard
          title="إجمالي المنتجات"
          value={stats.totalProducts}
          icon={Package}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="إجمالي العملاء"
          value={stats.totalCustomers}
          icon={Users}
          color="from-pink-500 to-rose-600"
        />
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="مبيعات اليوم"
          value={`${stats.todayRevenue.toFixed(0)} IQD`}
          icon={Activity}
          color="from-cyan-500 to-blue-500"
        />
        <StatCard
          title="طلبات اليوم"
          value={stats.todayOrders}
          icon={ShoppingBag}
          color="from-blue-500 to-indigo-500"
        />
        <StatCard
          title="الطلبات المعلقة"
          value={stats.pendingOrders}
          icon={AlertCircle}
          color="from-orange-500 to-red-500"
        />
        <StatCard
          title="منتجات منخفضة المخزون"
          value={stats.lowStockProducts}
          icon={Package}
          color="from-red-500 to-rose-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">المبيعات</h3>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <Line 
            data={salesChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  cornerRadius: 8
                }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
            height={300}
          />
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">توزيع الفئات</h3>
            <PieChartIcon className="text-gray-400" size={20} />
          </div>
          <Doughnut 
            data={categoryChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { padding: 15, font: { size: 11 } }
                }
              }
            }}
            height={300}
          />
        </div>
      </div>

      {/* Popular Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Products */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">المنتجات الأكثر مبيعاً</h3>
            <TrendingUp className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {stats.popularProducts?.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white font-bold text-sm">
                  {index + 1}
                </div>
                <img 
                  src={product.image} 
                  alt={product.nameAr}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {product.nameAr}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {product.sales} مبيعة
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">
                    {product.revenue.toFixed(0)} IQD
                  </p>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">أحدث الطلبات</h3>
            <ShoppingBag className="text-gray-400" size={20} />
          </div>
          <div className="space-y-3">
            {stats.recentOrders?.slice(0, 5).map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {order.customerName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">
                    {order.total.toFixed(0)} IQD
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'delivered' 
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status === 'pending' && 'معلق'}
                    {order.status === 'confirmed' && 'مؤكد'}
                    {order.status === 'processing' && 'قيد المعالجة'}
                    {order.status === 'delivered' && 'تم التوصيل'}
                    {order.status === 'cancelled' && 'ملغى'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      {stats.recentReviews && stats.recentReviews.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">أحدث التقييمات</h3>
            <Star className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {stats.recentReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    review.approved 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {review.approved ? 'معتمد' : 'قيد المراجعة'}
                  </span>
                </div>
                <p className="text-gray-700 text-sm line-clamp-2">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

