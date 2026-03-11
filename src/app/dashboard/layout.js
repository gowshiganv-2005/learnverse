'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineBookOpen, 
  HiOutlineHeart, 
  HiOutlineUser, 
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineChartBar
} from 'react-icons/hi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return null;

  const menuItems = [
    { name: 'My Courses', href: '/dashboard', icon: HiOutlineBookOpen },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: HiOutlineHeart },
    { name: 'Profile', href: '/dashboard/profile', icon: HiOutlineUser },
    { name: 'Settings', href: '/dashboard/settings', icon: HiOutlineCog },
  ];

  if (user.role === 'admin') {
    menuItems.push({ name: 'Admin Panel', href: '/admin', icon: HiOutlineChartBar, special: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-[72px] h-[calc(100vh-72px)]">
        <div className="p-6 flex-1">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-purple-50 text-[#6C5CE7]'
                    : item.special 
                      ? 'text-purple-600 hover:bg-purple-50' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-[#6C5CE7]' : ''}`} />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all w-full"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
