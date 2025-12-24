import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Phone,
  Mail,
  ShoppingBag,
  DollarSign,
  User,
  Calendar
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types/perfume-shop';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Customer {
  phone: string;
  name: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  orders: Order[];
}

export default function MobileCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      // Group orders by customer
      const customersMap = new Map<string, Customer>();
      
      orders.forEach(order => {
        const phone = order.customerPhone;
        if (!customersMap.has(phone)) {
          customersMap.set(phone, {
            phone,
            name: order.customerName,
            email: order.customerEmail,
            totalOrders: 0,
            totalSpent: 0,
            orders: []
          });
        }
        
        const customer = customersMap.get(phone)!;
        customer.totalOrders += 1;
        customer.totalSpent += order.total;
        customer.orders.push(order);
        
        const orderDate = order.createdAt?.toDate();
        if (orderDate && (!customer.lastOrderDate || orderDate > customer.lastOrderDate)) {
          customer.lastOrderDate = orderDate;
        }
      });

      const customersList = Array.from(customersMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);
      
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CustomerCard = ({ customer }: { customer: Customer }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-maroon-500 to-brand-gold-500 flex items-center justify-center flex-shrink-0">
            <User size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1">{customer.name}</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone size={14} />
                {customer.phone}
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={14} />
                  {customer.email}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">الطلبات</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{customer.totalOrders}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">إجمالي الإنفاق</span>
            </div>
            <p className="text-lg font-bold text-brand-maroon-600">
              {customer.totalSpent.toFixed(0)} IQD
            </p>
          </div>
        </div>

        {customer.lastOrderDate && (
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
            <Calendar size={14} />
            آخر طلب: {format(customer.lastOrderDate, 'd MMM yyyy', { locale: ar })}
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">جاري تحميل العملاء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-1">العملاء</h2>
        <p className="text-sm text-gray-500">{filteredCustomers.length} عميل</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="ابحث عن عميل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-3 bg-white rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-brand-maroon-600 to-brand-maroon-700 rounded-2xl p-4 text-white">
          <p className="text-xs text-white/80 mb-1">إجمالي العملاء</p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="bg-gradient-to-br from-brand-gold-500 to-brand-gold-600 rounded-2xl p-4 text-white">
          <p className="text-xs text-white/80 mb-1">إجمالي المبيعات</p>
          <p className="text-2xl font-bold">
            {(customers.reduce((sum, c) => sum + c.totalSpent, 0) / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا يوجد عملاء</p>
          </motion.div>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard key={customer.phone} customer={customer} />
          ))
        )}
      </div>
    </div>
  );
}

