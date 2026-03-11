'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlineTrash, 
  HiOutlineShieldCheck,
  HiOutlineSearch
} from 'react-icons/hi';
import API from '@/utils/api';
import { formatDate } from '@/utils/helpers';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users/admin/all');
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will permanently delete the user and their progress.')) return;
    try {
      const { data } = await API.delete(`/users/${userId}`);
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
        toast.success('User deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Monitor and manage access for all platform members.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 py-3"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Connecting to user directory..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">
                  <th className="px-8 py-5">User Profile</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Courses</th>
                  <th className="px-8 py-5">Joined</th>
                  <th className="px-8 py-5 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white text-xs font-bold shadow-md">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-gray-900">{user.name}</p>
                           <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-50 text-[#6C5CE7]' : 'bg-gray-100 text-gray-500'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-400">{user.purchasedCourses?.length || 0} enrolled</td>
                    <td className="px-8 py-6 text-xs font-medium text-gray-400">{formatDate(user.createdAt)}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                            title="Delete Account"
                          >
                             <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        )}
                        <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
                           <HiOutlineShieldCheck className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-gray-400 text-sm">No users found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
