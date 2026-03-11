import Link from 'next/link';
import { HiOutlineArrowLeft, HiOutlineAcademicCap } from 'react-icons/hi';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center shadow-xl">
             <HiOutlineAcademicCap className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h1 className="text-6xl font-extrabold text-[#6C5CE7] mb-4">404</h1>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        
        <p className="text-gray-500 mb-10">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div>
          <Link 
            href="/" 
            className="btn-primary inline-flex items-center gap-2"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
