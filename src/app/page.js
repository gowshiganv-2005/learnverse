'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiOutlineAcademicCap,
  HiOutlinePlay,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineGlobe,
  HiOutlineUserGroup,
  HiOutlineTrendingUp,
  HiOutlineArrowRight,
  HiOutlineStar,
} from 'react-icons/hi';
import API from '@/utils/api';
import CourseCard from '@/components/CourseCard';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import { categoryIcons } from '@/utils/helpers';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const stats = [
  { label: 'Active Learners', value: '50K+', icon: HiOutlineUserGroup },
  { label: 'Expert Courses', value: '500+', icon: HiOutlineAcademicCap },
  { label: 'Success Rate', value: '95%', icon: HiOutlineTrendingUp },
  { label: 'Countries', value: '120+', icon: HiOutlineGlobe },
];

const whyChooseUs = [
  {
    icon: HiOutlineLightningBolt,
    title: 'Learn at Your Pace',
    description: 'Access courses anytime, anywhere. Learn on your schedule with lifetime access to all purchased content.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Expert Instructors',
    description: 'Learn from industry professionals with years of real-world experience. Quality guaranteed.',
  },
  {
    icon: HiOutlineAcademicCap,
    title: 'Certified Learning',
    description: 'Earn certificates of completion to showcase your skills and advance your career.',
  },
  {
    icon: HiOutlinePlay,
    title: 'Hands-On Projects',
    description: 'Build real-world projects that you can add to your portfolio. Learn by doing, not just watching.',
  },
];

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFeatured();
    fetchCategories();
  }, []);

  const fetchFeatured = async () => {
    try {
      const { data } = await API.get('/courses/featured');
      if (data.success) setFeaturedCourses(data.courses);
    } catch (err) {
      console.error('Failed to fetch featured courses');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/courses/categories');
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  return (
    <div className="overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[92vh] flex items-center bg-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-50 to-purple-100/50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-50/30 to-pink-50/30 blur-3xl" />
        </div>

        <div className="container-main relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6"
              >
                <HiOutlineStar className="w-4 h-4 text-[#6C5CE7]" />
                <span className="text-sm font-medium text-[#6C5CE7]">
                  Trusted by 50,000+ learners worldwide
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6"
              >
                Unlock Your Potential with{' '}
                <span className="gradient-text">World-Class</span> Courses
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg"
              >
                Learn from industry experts and transform your career. Access hundreds of premium courses designed to take you from beginner to professional.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-10"
              >
                <Link href="/courses" className="btn-primary text-base px-8 py-3.5">
                  Explore Courses
                  <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/register" className="btn-secondary text-base px-8 py-3.5">
                  Start Free Trial
                </Link>
              </motion.div>

              {/* Mini stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-8"
              >
                <div>
                  <p className="text-2xl font-bold text-gray-900">4.9</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <HiOutlineStar key={`h-star-${i}`} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Platform Rating</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                  <p className="text-xs text-gray-400 mt-1">Premium Courses</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">50K+</p>
                  <p className="text-xs text-gray-400 mt-1">Happy Students</p>
                </div>
              </motion.div>
            </div>

            {/* Right - Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#6C5CE7]/20 to-[#A29BFE]/20 rounded-3xl blur-2xl" />
                <div className="relative bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 border border-purple-100/50 shadow-2xl shadow-purple-100/30">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                    alt="Students learning"
                    className="rounded-2xl w-full shadow-lg"
                  />
                  {/* Floating cards */}
                  <motion.div
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -left-6 top-1/4 bg-white rounded-xl p-4 shadow-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <HiOutlineTrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Course Progress</p>
                        <p className="text-sm font-bold text-gray-900">87% Complete</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [8, -8, 8] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute -right-6 bottom-1/4 bg-white rounded-xl p-4 shadow-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <HiOutlineAcademicCap className="w-5 h-5 text-[#6C5CE7]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Certificate Earned</p>
                        <p className="text-sm font-bold text-gray-900">React Expert</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...stagger}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-[#6C5CE7]" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-24 bg-white">
        <div className="container-main">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="badge badge-primary mb-4 inline-block">Categories</span>
            <h2 className="section-title mb-4">Explore Popular Categories</h2>
            <p className="section-subtitle mx-auto">
              Discover courses across the most in-demand fields and start learning today.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                {...stagger}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/courses?category=${encodeURIComponent(cat._id)}`}
                  className="block p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center hover:bg-white hover:shadow-xl hover:border-purple-100 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-3">{categoryIcons[cat._id] || '📚'}</div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#6C5CE7] transition-colors">
                    {cat._id}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{cat.count} courses</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED COURSES ===== */}
      <section className="py-24 bg-gray-50">
        <div className="container-main">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-4">
            <div>
              <span className="badge badge-primary mb-4 inline-block">Featured</span>
              <h2 className="section-title mb-3">Top-Rated Courses</h2>
              <p className="section-subtitle">
                Handpicked courses loved by thousands of students worldwide.
              </p>
            </div>
            <Link
              href="/courses"
              className="flex items-center gap-2 text-[#6C5CE7] font-semibold hover:gap-3 transition-all"
            >
              View All Courses
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredCourses.slice(0, 8).map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </div>

          {featuredCourses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400">No featured courses yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-24 bg-white">
        <div className="container-main">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="badge badge-accent mb-4 inline-block">Why LearnVerse</span>
            <h2 className="section-title mb-4">Why Learners Choose Us</h2>
            <p className="section-subtitle mx-auto">
              We provide everything you need to succeed in your learning journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ delay: i * 0.12 }}
                className="text-center p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mx-auto mb-5 group-hover:from-[#6C5CE7] group-hover:to-[#A29BFE] transition-all duration-300">
                  <item.icon className="w-7 h-7 text-[#6C5CE7] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== PRICING ===== */}
      <Pricing />

      {/* ===== CTA ===== */}
      <section className="py-24 bg-white">
        <div className="container-main">
          <motion.div
            {...fadeUp}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] p-12 md:p-20 text-center"
          >
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-purple-100 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Join thousands of learners who are already building their dream careers. Get started today with our free courses.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3.5 bg-white text-[#6C5CE7] font-semibold rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all text-base"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/courses"
                  className="px-8 py-3.5 bg-white/15 text-white font-semibold rounded-xl border border-white/25 hover:bg-white/25 transition-all text-base"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
