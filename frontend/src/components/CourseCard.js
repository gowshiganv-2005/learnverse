'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineStar, HiStar, HiOutlineUsers, HiOutlineClock, HiOutlineHeart, HiHeart } from 'react-icons/hi';
import { formatPrice, truncateText } from '@/utils/helpers';

export default function CourseCard({ course, index = 0, onWishlistToggle, isWishlisted = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={`/courses/${course._id}`} className="block">
        <div className="card group cursor-pointer h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative overflow-hidden aspect-video">
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badge */}
            {course.featured && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white text-xs font-semibold rounded-full shadow-lg">
                Featured
              </div>
            )}

            {/* Wishlist */}
            {onWishlistToggle && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWishlistToggle(course._id);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                {isWishlisted ? (
                  <HiHeart className="w-4.5 h-4.5 text-red-500" />
                ) : (
                  <HiOutlineHeart className="w-4.5 h-4.5 text-gray-600" />
                )}
              </button>
            )}

            {/* Price Tag */}
            <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur rounded-lg shadow-lg">
              <span className="text-[#6C5CE7] font-bold text-sm">
                {course.price === 0 ? 'Free' : formatPrice(course.price)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Category */}
            <span className="text-xs font-semibold text-[#6C5CE7] uppercase tracking-wider mb-2">
              {course.category}
            </span>

            {/* Title */}
            <h3 className="text-[1rem] font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#6C5CE7] transition-colors line-clamp-2">
              {course.title}
            </h3>

            {/* Instructor */}
            <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  i < Math.floor(course.rating || 0) ? (
                    <HiStar key={i} className="w-4 h-4 text-amber-400" />
                  ) : (
                    <HiOutlineStar key={i} className="w-4 h-4 text-amber-400" />
                  )
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{course.rating?.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({course.numReviews})</span>
            </div>

            {/* Footer Meta */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <HiOutlineUsers className="w-3.5 h-3.5" />
                <span>{course.enrolledStudents?.toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-1">
                <HiOutlineClock className="w-3.5 h-3.5" />
                <span>{course.totalDuration}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
