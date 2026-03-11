'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineShoppingCart, 
  HiOutlineCash, 
  HiOutlineUser, 
  HiOutlineBookOpen,
  HiOutlineSearch,
  HiOutlineExternalLink
} from 'react-icons/hi';
import API from '@/utils/api';
import { formatPrice, formatDate } from '@/utils/helpers';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/admin/all');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Revenue & Orders</h1>
        <p className="text-gray-500 mt-1">Full transaction history and sales analytics.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student, course or Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 py-3"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching financial records..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Student</th>
                  <th className="px-8 py-5">Course</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-gray-400 font-mono">#{order._id.substring(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                         <HiOutlineUser className="w-4 h-4 text-gray-400" />
                         <p className="text-sm font-bold text-gray-900">{order.userId?.name || 'Deleted User'}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-gray-700 truncate">{order.courseId?.title || 'Unknown Course'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-[#6C5CE7]">{formatPrice(order.amount)}</td>
                    <td className="px-8 py-6 text-xs font-medium text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-green-50 text-green-600">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-gray-400 text-sm">No transactions found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
