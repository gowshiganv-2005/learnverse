import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'LearnVerse - Premium Online Learning Platform',
  description: 'Master new skills with world-class courses from industry experts. Join thousands of learners advancing their careers on LearnVerse.',
  keywords: 'online courses, learning platform, education, programming, design, business',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6C5CE7',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
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
            }}
          />
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
