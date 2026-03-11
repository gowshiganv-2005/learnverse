'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import API from '@/utils/api';
import CourseCard from '@/components/CourseCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { HiOutlineBookOpen, HiOutlinePlay } from 'react-icons/hi';

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success) {
        setCourses(data.user.purchasedCourses || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Learning</h1>
        <p className="text-gray-500 mt-1">Keep track of your progress and continue learning.</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your courses..." />
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                <div className="relative aspect-video">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link
                      href={`/player/${course._id}`}
                      className="w-12 h-12 rounded-full bg-white text-[#6C5CE7] flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                    >
                      <HiOutlinePlay className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs font-semibold text-[#6C5CE7] uppercase tracking-wider mb-2">
                    {course.category}
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">{course.instructor}</p>
                  
                  <div className="mt-auto">
                    <Link
                      href={`/player/${course._id}`}
                      className="block w-full text-center py-2.5 rounded-xl bg-purple-50 text-[#6C5CE7] text-sm font-semibold hover:bg-[#6C5CE7] hover:text-white transition-all shadow-sm"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineBookOpen className="w-10 h-10 text-[#6C5CE7]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            You haven't enrolled in any courses yet. Start your journey today by exploring our catalog.
          </p>
          <Link href="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}
