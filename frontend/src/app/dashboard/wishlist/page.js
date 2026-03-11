'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import API from '@/utils/api';
import CourseCard from '@/components/CourseCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { HiOutlineHeart } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { checkAuth } = useAuth();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success) {
        setCourses(data.user.wishlist || []);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (courseId) => {
    try {
      const { data } = await API.post(`/users/wishlist/${courseId}`);
      if (data.success) {
        setCourses(courses.filter(c => c._id !== courseId));
        toast.success('Removed from wishlist');
        await checkAuth();
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-500 mt-1">Courses you've saved for later.</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your wishlist..." />
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <CourseCard 
              key={course._id} 
              course={course} 
              index={i} 
              onWishlistToggle={handleWishlistToggle}
              isWishlisted={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineHeart className="w-10 h-10 text-pink-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Wishlist is empty</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Explore our courses and hit the heart icon to save them here for later.
          </p>
          <Link href="/courses" className="btn-primary">
            Explore Courses
          </Link>
        </div>
      )}
    </div>
  );
}
