'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { usePathname } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

function ClientLayoutInterior({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before hydration, use a placeholder
  if (!mounted) {
    return <main className="pt-[72px]">{children}</main>;
  }

  const isAdminRoute = pathname?.startsWith('/admin') || false;
  const isDashboardRoute = pathname?.startsWith('/dashboard') || false;
  const isPlayerRoute = pathname?.startsWith('/player') || false;
  const hideLayout = isPlayerRoute;

  return (
    <>
      {!hideLayout && <Navbar />}
      <main className={hideLayout ? '' : 'pt-[72px]'}>
        <PageTransition>{children}</PageTransition>
      </main>
      {!hideLayout && !isAdminRoute && !isDashboardRoute && !isPlayerRoute && <Footer />}
    </>
  );
}

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1A1A2E',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            padding: '14px 20px',
            fontSize: '0.9rem',
          },
          success: {
            iconTheme: { primary: '#00B894', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#E74C3C', secondary: '#fff' },
          },
        }}
      />
      <Suspense fallback={<main className="pt-[72px]">{children}</main>}>
        <ClientLayoutInterior>{children}</ClientLayoutInterior>
      </Suspense>
    </AuthProvider>
  );
}
