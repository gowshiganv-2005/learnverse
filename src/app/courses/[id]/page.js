'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiOutlineStar, HiStar, HiOutlineUsers, HiOutlineClock, HiOutlinePlay,
  HiOutlineAcademicCap, HiOutlineCheck, HiOutlineChevronDown, HiOutlineChevronUp,
  HiOutlineHeart, HiHeart, HiOutlineGlobe, HiOutlineBookOpen,
} from 'react-icons/hi';
import API from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate } from '@/utils/helpers';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CourseDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState([0]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (user && course) {
      setIsPurchased(user.purchasedCourses?.some(c => (c._id || c) === course._id));
      setIsWishlisted(user.wishlist?.some(c => (c._id || c) === course._id));
    }
  }, [user, course]);

  const fetchCourse = async () => {
    try {
      const { data } = await API.get(`/courses/${id}`);
      if (data.success) setCourse(data.course);
    } catch (err) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await API.get(`/reviews/course/${id}`);
      if (data.success) setReviews(data.reviews);
    } catch (err) {}
  };

  const handlePurchase = async () => {
    if (!user) { router.push('/login'); return; }
    setPurchasing(true);
    try {
      const { data } = await API.post('/orders', { courseId: course._id });
      if (data.success) {
        toast.success('Course purchased successfully!');
        await checkAuth();
        setIsPurchased(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      const { data } = await API.post(`/users/wishlist/${course._id}`);
      if (data.success) {
        setIsWishlisted(!isWishlisted);
        toast.success(data.message);
        await checkAuth();
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/reviews', { courseId: course._id, ...reviewForm });
      if (data.success) {
        toast.success('Review submitted!');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: '' });
        fetchReviews();
        fetchCourse();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const toggleModule = (index) => {
    setExpandedModules(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (loading) return <LoadingSpinner text="Loading course..." />;
  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-500">Course not found</div>;

  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-main py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="badge badge-primary">{course.category}</span>
                  <span className="badge badge-accent">{course.level}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  {course.title}
                </h1>

                <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                  {course.shortDescription || course.description?.substring(0, 200)}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        i < Math.floor(course.rating) ? (
                          <HiStar key={i} className="w-4 h-4 text-amber-400" />
                        ) : (
                          <HiOutlineStar key={i} className="w-4 h-4 text-amber-400" />
                        )
                      ))}
                    </div>
                    <span className="font-semibold text-gray-700">{course.rating?.toFixed(1)}</span>
                    <span>({course.numReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HiOutlineUsers className="w-4 h-4" />
                    {course.enrolledStudents?.toLocaleString()} students
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HiOutlineGlobe className="w-4 h-4" />
                    {course.language}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white font-bold text-sm">
                    {course.instructor?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{course.instructor}</p>
                    <p className="text-xs text-gray-400">Instructor</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right - Purchase Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden sticky top-24">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                  alt={course.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {course.price === 0 ? 'Free' : formatPrice(course.price)}
                    </span>
                  </div>

                  {isPurchased ? (
                    <button
                      onClick={() => router.push(`/player/${course._id}`)}
                      className="w-full btn-primary justify-center py-3.5 text-base mb-3"
                    >
                      <HiOutlinePlay className="w-5 h-5" />
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full btn-primary justify-center py-3.5 text-base mb-3 disabled:opacity-60"
                    >
                      {purchasing ? 'Processing...' : 'Enroll Now'}
                    </button>
                  )}

                  <button
                    onClick={handleWishlist}
                    className="w-full btn-secondary justify-center py-3 mb-5"
                  >
                    {isWishlisted ? <HiHeart className="w-5 h-5 text-red-500" /> : <HiOutlineHeart className="w-5 h-5" />}
                    {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <HiOutlineClock className="w-4 h-4 text-gray-400" />
                      <span>{course.totalDuration} total length</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HiOutlineBookOpen className="w-4 h-4 text-gray-400" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HiOutlineAcademicCap className="w-4 h-4 text-gray-400" />
                      <span>{course.level} level</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HiOutlineCheck className="w-4 h-4 text-gray-400" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-main py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn */}
            {course.whatYouWillLearn?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-gray-200 p-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <HiOutlineCheck className="w-5 h-5 text-[#00B894] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Course</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>

            {/* Modules */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-8 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {course.modules?.length} modules • {totalLessons} lessons • {course.totalDuration}
                </p>
              </div>
              <div className="border-t border-gray-100">
                {course.modules?.map((module, idx) => (
                  <div key={idx} className="border-b border-gray-100 last:border-0">
                    <button
                      onClick={() => toggleModule(idx)}
                      className="w-full flex items-center justify-between px-8 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedModules.includes(idx) ? (
                          <HiOutlineChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <HiOutlineChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                        <h3 className="text-sm font-semibold text-gray-900">{module.title}</h3>
                      </div>
                      <span className="text-xs text-gray-400">{module.lessons?.length} lessons</span>
                    </button>
                    {expandedModules.includes(idx) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gray-50"
                      >
                        {module.lessons?.map((lesson, li) => (
                          <div
                            key={lesson._id || li}
                            className="flex items-center gap-3 px-8 py-3 border-t border-gray-100 text-sm"
                          >
                            <HiOutlinePlay className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 flex-1">
                              {lesson.title || `Lesson ${li + 1}`}
                            </span>
                            <span className="text-xs text-gray-400">{lesson.duration || '--:--'}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Reviews ({reviews.length})
                </h2>
                {user && isPurchased && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-sm font-medium text-[#6C5CE7] hover:underline"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        >
                          {star <= reviewForm.rating ? (
                            <HiStar className="w-7 h-7 text-amber-400" />
                          ) : (
                            <HiOutlineStar className="w-7 h-7 text-amber-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={3}
                      className="input-field resize-none"
                      placeholder="Share your experience..."
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary py-2.5 px-6 text-sm">
                    Submit Review
                  </button>
                </form>
              )}

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white text-xs font-bold">
                        {review.userId?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.userId?.name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              i < review.rating ? (
                                <HiStar key={i} className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <HiOutlineStar key={i} className="w-3.5 h-3.5 text-amber-400" />
                              )
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          {/* Requirements Sidebar */}
          <div className="lg:col-span-1">
            {course.requirements?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Requirements</h3>
                <ul className="space-y-3">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] mt-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
