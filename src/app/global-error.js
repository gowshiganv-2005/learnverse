'use client';

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white text-gray-900 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-3xl text-red-500">⚠️</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-8 overflow-hidden text-ellipsis whitespace-nowrap">
            {error?.message || "An unexpected error occurred."}
          </p>
          <div className="flex flex-col gap-3">
             <button
              onClick={() => reset()}
              className="px-6 py-3 bg-[#6C5CE7] text-white font-bold rounded-xl shadow-lg hover:shadow-purple-200 transition-all"
            >
              Try again
            </button>
            <a 
              href="/"
              className="px-6 py-3 text-[#6C5CE7] font-semibold border border-purple-100 rounded-xl hover:bg-purple-50 transition-all"
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
