'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineBookOpen, 
  HiOutlineUsers, 
  HiOutlineChartPie,
  HiOutlinePlusCircle,
  HiOutlineLogout,
  HiOutlineHome
} from 'react-icons/hi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router, mounted]);

  if (!mounted || loading) {
    return <LoadingSpinner fullScreen text={!mounted ? "Initializing Admin..." : "Loading Admin Profile..."} />;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const menuItems = [
    { name: 'Overview', href: '/admin', icon: HiOutlineChartPie },
    { name: 'All Courses', href: '/admin/courses', icon: HiOutlineBookOpen },
    { name: 'Add Course', href: '/admin/courses/new', icon: HiOutlinePlusCircle },
    { name: 'Users', href: '/admin/users', icon: HiOutlineUsers },
    { name: 'Orders', href: '/admin/orders', icon: HiOutlineViewGrid },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-[72px] h-[calc(100vh-72px)]">
        <div className="p-8 pb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 px-4">Admin Dashboard</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  pathname === item.href
                    ? 'bg-[#6C5CE7] text-white shadow-lg shadow-purple-200 shadow-purple-900/10'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-gray-50 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all w-full"
          >
            <HiOutlineHome className="w-5 h-5" />
            Public Website
          </Link>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all w-full"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
