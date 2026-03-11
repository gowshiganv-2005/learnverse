'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineCurrencyDollar, 
  HiOutlineUsers, 
  HiOutlineBookOpen, 
  HiOutlineShoppingCart,
  HiOutlineTrendingUp,
  HiOutlineClock
} from 'react-icons/hi';
import API from '@/utils/api';
import { formatPrice, formatDate } from '@/utils/helpers';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/orders/stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Crunching numbers..." />;

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: HiOutlineCurrencyDollar, color: 'bg-green-50 text-green-600' },
    { label: 'Total Sales', value: stats?.totalOrders || 0, icon: HiOutlineShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: HiOutlineUsers, color: 'bg-purple-50 text-[#6C5CE7]' },
    { label: 'Total Courses', value: stats?.totalCourses || 0, icon: HiOutlineBookOpen, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Real-time statistics and summary of your platform performance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mb-6`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Sales</h3>
            <span className="text-xs font-bold text-[#6C5CE7] bg-purple-50 px-3 py-1 rounded-full uppercase tracking-tighter">Live Updates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Course</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats?.recentOrders || []).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white text-[10px] font-bold shadow-md shadow-purple-900/10">
                          {order.userId?.name?.charAt(0)}
                        </div>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{order.userId?.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-semibold text-gray-700 line-clamp-1">{order.courseId?.title}</td>
                    <td className="px-8 py-5 text-sm font-bold text-[#6C5CE7]">{formatPrice(order.amount)}</td>
                    <td className="px-8 py-5 text-xs font-medium text-gray-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
                {(stats?.recentOrders || []).length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400 text-sm">No recent transactions.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Month Mini Chart representation */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Monthly Growth</h3>
          <div className="flex-1 flex flex-col justify-end gap-6">
            {(stats?.monthlyRevenue || []).slice(-6).map((month, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-gray-400">Month {month._id}</span>
                  <span className="text-[#6C5CE7]">{formatPrice(month.revenue)}</span>
                </div>
                <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((month.revenue / (stats.totalRevenue || 1)) * 100 * 5, 100)}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-full"
                  />
                </div>
              </div>
            ))}
            {(stats?.monthlyRevenue || []).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-20">Growth data will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
