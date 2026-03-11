'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineChevronLeft, 
  HiOutlineMenuAlt2, 
  HiOutlineCheckCircle, 
  HiOutlinePlay,
  HiChevronRight,
  HiCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineArrowLeft
} from 'react-icons/hi';
import API from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

// Dynamic import for ReactPlayer to avoid hydration issues
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

export default function CoursePlayerPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && id) {
      fetchCourseData();
    }
  }, [user, id]);

  const fetchCourseData = async () => {
    try {
      // Check if user has access
      const isPurchased = user.purchasedCourses?.some(c => (c._id || c) === id);
      if (!isPurchased && user.role !== 'admin') {
        toast.error('You do not have access to this course');
        router.push(`/courses/${id}`);
        return;
      }

      const [courseRes, progressRes] = await Promise.all([
        API.get(`/courses/${id}`),
        API.get(`/progress/${id}`)
      ]);

      if (courseRes.data.success) {
        setCourse(courseRes.data.course);
        setProgress(progressRes.data.progress);
        
        // Set initial lesson
        const allLessons = courseRes.data.course.modules?.flatMap(m => m.lessons) || [];
        const savedCurrent = progressRes.data.progress?.currentLesson;
        const initialLesson = allLessons.find(l => l._id === savedCurrent) || allLessons[0];
        setCurrentLesson(initialLesson);
      }
    } catch (err) {
      toast.error('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleLessonComplete = async (lessonId) => {
    try {
      const { data } = await API.post(`/progress/${id}/complete/${lessonId}`);
      if (data.success) {
        setProgress(data.progress);
        
        // Find next lesson
        const allLessons = course.modules.flatMap(m => m.lessons);
        const currentIndex = allLessons.findIndex(l => l._id === lessonId);
        if (currentIndex < allLessons.length - 1) {
          toast.success('Lesson completed! Loading next...', { duration: 2000 });
          setTimeout(() => handleLessonSelect(allLessons[currentIndex + 1]), 1000);
        } else {
          toast.success('Congratulations! You finished the course!');
        }
      }
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  if (loading || authLoading) return <LoadingSpinner fullScreen text="Entering classroom..." />;
  if (!course) return null;

  const isCompleted = (lessonId) => progress?.completedLessons?.includes(lessonId);

  return (
    <div className="h-screen bg-[#1A1A1A] flex flex-col">
      {/* Player Header */}
      <header className="h-[64px] bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-6 relative z-50">
        <div className="flex items-center gap-4">
          <Link 
            href={`/courses/${id}`}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all border border-white/10"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-white text-sm md:text-base font-bold hidden md:block line-clamp-1">{course.title}</h1>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-24 md:w-32 bg-white/10 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-[#6C5CE7] transition-all duration-500"
                   style={{ width: `${progress?.progressPercent || 0}%` }}
                 />
               </div>
               <span className="text-[10px] md:text-xs text-gray-400 font-medium">{progress?.progressPercent || 0}% Complete</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10">
            <HiOutlineViewGrid className="w-4 h-4" />
            My Learning
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-lg shadow-purple-900/20"
          >
            <HiOutlineMenuAlt2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div className="flex-1 relative group">
            <ReactPlayer
              url={currentLesson?.videoUrl}
              width="100%"
              height="100%"
              controls
              playing
              onEnded={() => handleLessonComplete(currentLesson._id)}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload'
                  }
                }
              }}
            />
          </div>

          {/* Lesson Footnote */}
          <div className="p-6 md:p-10 bg-[#1A1A1A] max-h-[300px] overflow-y-auto">
             <div className="max-w-4xl mx-auto">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div>
                   <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{currentLesson?.title}</h2>
                   <p className="text-gray-400 text-sm">Course Module: {course.modules?.find(m => m.lessons.some(l => l._id === currentLesson?._id))?.title}</p>
                 </div>
                 <button 
                   onClick={() => handleLessonComplete(currentLesson._id)}
                   disabled={isCompleted(currentLesson?._id)}
                   className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                     isCompleted(currentLesson?._id)
                     ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                     : 'bg-[#6C5CE7] text-white hover:bg-[#5A4BD1] shadow-lg shadow-purple-900/20'
                   }`}
                 >
                   {isCompleted(currentLesson?._id) ? (
                     <HiCheckCircle className="w-5 h-5" />
                   ) : (
                     <HiOutlineCheckCircle className="w-5 h-5" />
                   )}
                   {isCompleted(currentLesson?._id) ? 'Completed' : 'Mark as Complete'}
                 </button>
               </div>
               <div className="w-full h-px bg-white/5 mb-8" />
               <div className="prose prose-invert max-w-none text-gray-400 text-sm md:text-base">
                 {currentLesson?.description || 'Learn and master the skills presented in this lesson.'}
               </div>
             </div>
          </div>
        </div>

        {/* Sidebar Lesson List */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute lg:relative top-0 right-0 w-full md:w-[350px] lg:w-[400px] h-full bg-[#1F1F1F] border-l border-white/5 z-40 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 bg-[#1A1A1A]">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <HiOutlineAcademicCap className="w-5 h-5 text-[#6C5CE7]" />
                  Course Content
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {course.modules?.map((module, mIdx) => (
                  <div key={mIdx} className="border-b border-white/5">
                    <div className="px-6 py-4 bg-[#252525]/50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Module {mIdx + 1}</span>
                      <span className="text-[10px] text-gray-500">{module.lessons?.length} Lessons</span>
                    </div>
                    <div className="p-2">
                      <h4 className="px-4 py-2 text-xs font-bold text-[#6C5CE7] uppercase">{module.title}</h4>
                      <div className="space-y-1">
                        {module.lessons?.map((lesson, lIdx) => (
                          <button
                            key={lesson._id}
                            onClick={() => handleLessonSelect(lesson)}
                            className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all group ${
                              currentLesson?._id === lesson._id
                              ? 'bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 shadow-lg'
                              : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="mt-1">
                              {isCompleted(lesson._id) ? (
                                <HiCheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                                  currentLesson?._id === lesson._id ? 'border-[#6C5CE7] text-[#6C5CE7]' : 'border-gray-700 text-gray-600 group-hover:border-gray-500'
                                }`}>
                                  {lIdx + 1}
                                </div>
                              )}
                            </div>
                            <div className="text-left flex-1">
                              <p className={`text-sm font-semibold transition-all ${
                                currentLesson?._id === lesson._id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                              }`}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-[10px] text-gray-500 uppercase font-bold">
                                  <HiOutlinePlay className="w-3 h-3" />
                                  Video • {lesson.duration || '5:00'}
                                </span>
                              </div>
                            </div>
                            {currentLesson?._id === lesson._id && <HiChevronRight className="w-5 h-5 text-[#6C5CE7] mt-1" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
