'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import API from '@/utils/api';
import CourseCard from '@/components/CourseCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { categories as categoryList } from '@/utils/helpers';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineX } from 'react-icons/hi';

function CoursesContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [filters.category, filters.sort, filters.page, filters.rating]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.rating) params.append('rating', filters.rating);
      params.append('page', filters.page);
      params.append('limit', '12');

      const { data } = await API.get(`/courses?${params.toString()}`);
      if (data.success) {
        setCourses(data.courses);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-main py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Explore Courses
            </h1>
            <p className="text-gray-500 text-lg">
              Discover {pagination.total || 0} courses to advance your skills
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#6C5CE7] transition-all"
              />
            </form>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
              className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#6C5CE7] min-w-[180px]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                showFilters
                  ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <HiOutlineFilter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#6C5CE7]"
                >
                  <option value="all">All Categories</option>
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value, page: 1 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#6C5CE7]"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5 & above</option>
                  <option value="4">4.0 & above</option>
                  <option value="3.5">3.5 & above</option>
                  <option value="3">3.0 & above</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#6C5CE7]"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#6C5CE7]"
                  />
                  <button
                    onClick={fetchCourses}
                    className="px-4 py-2.5 bg-[#6C5CE7] text-white rounded-xl text-sm font-medium hover:bg-[#5A4BD1] transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Active Filters */}
        {(filters.category !== 'all' || filters.search || filters.rating) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-[#6C5CE7] text-xs font-medium">
                {filters.category}
                <button onClick={() => setFilters({ ...filters, category: 'all' })}>
                  <HiOutlineX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-[#6C5CE7] text-xs font-medium">
                "{filters.search}"
                <button onClick={() => { setFilters({ ...filters, search: '' }); setTimeout(fetchCourses, 0); }}>
                  <HiOutlineX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.rating && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-[#6C5CE7] text-xs font-medium">
                Rating ≥ {filters.rating}
                <button onClick={() => setFilters({ ...filters, rating: '' })}>
                  <HiOutlineX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Course Grid */}
        {loading ? (
          <LoadingSpinner text="Loading courses..." />
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course, i) => (
                <CourseCard key={course._id} course={course} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters({ ...filters, page: i + 1 })}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      pagination.page === i + 1
                        ? 'bg-[#6C5CE7] text-white shadow-md shadow-purple-200'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen text="Loading courses..." />}>
      <CoursesContent />
    </Suspense>
  );
}
