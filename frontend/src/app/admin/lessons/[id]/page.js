'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlinePencil,
  HiOutlineSave,
  HiOutlineVideoCamera
} from 'react-icons/hi';
import API from '@/utils/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ManageLessonsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    duration: '',
    description: '',
    moduleId: ''
  });

  useEffect(() => {
    fetchCourseAndLessons();
  }, [id]);

  const fetchCourseAndLessons = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        API.get(`/courses/${id}`),
        API.get(`/lessons/course/${id}`)
      ]);
      
      if (courseRes.data.success) setCourse(courseRes.data.course);
      if (lessonsRes.data.success) setLessons(lessonsRes.data.lessons);
    } catch (err) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        const { data } = await API.put(`/lessons/${editingLesson._id}`, formData);
        if (data.success) {
          setLessons(lessons.map(l => l._id === editingLesson._id ? data.lesson : l));
          toast.success('Lesson updated!');
        }
      } else {
        const { data } = await API.post('/lessons', { ...formData, courseId: id });
        if (data.success) {
          setLessons([...lessons, data.lesson]);
          toast.success('Lesson added!');
        }
      }
      resetForm();
    } catch (err) {
      toast.error('Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await API.delete(`/lessons/${lessonId}`);
      setLessons(lessons.filter(l => l._id !== lessonId));
      toast.success('Lesson deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setEditingLesson(null);
    setFormData({ title: '', videoUrl: '', duration: '', description: '', moduleId: '' });
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curriculum Manager</h1>
          <p className="text-gray-500">Add and organize video content for "{course?.title}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h3>
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Lesson Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input-field text-sm" 
                  placeholder="e.g. Getting Started with React"
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Video URL (YouTube/MP4)</label>
                <input 
                  type="text" 
                  value={formData.videoUrl} 
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  className="input-field text-sm" 
                  placeholder="https://youtube.com/..."
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Duration</label>
                  <input 
                    type="text" 
                    value={formData.duration} 
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="input-field text-sm" 
                    placeholder="10:00" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Module</label>
                  <select 
                    value={formData.moduleId} 
                    onChange={(e) => setFormData({...formData, moduleId: e.target.value})}
                    className="input-field text-sm"
                    required
                  >
                    <option value="">Select Module</option>
                    {course?.modules.map((m, i) => (
                      <option key={i} value={m.title}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <button type="submit" className="flex-1 btn-primary justify-center">
                  <HiOutlineSave className="w-5 h-5" />
                  {editingLesson ? 'Update' : 'Add Lesson'}
                </button>
                {editingLesson && (
                  <button type="button" onClick={resetForm} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-900">Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Lesson List */}
        <div className="lg:col-span-2 space-y-4">
          {course?.modules.map((module, mIdx) => (
            <div key={mIdx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                 <h4 className="text-sm font-bold text-gray-900 uppercase">Module {mIdx+1}: {module.title}</h4>
                 <span className="text-xs font-bold text-[#6C5CE7]">{lessons.filter(l => l.moduleId === module.title).length} Lessons</span>
               </div>
               <div className="divide-y divide-gray-50">
                 {lessons.filter(l => l.moduleId === module.title).map((lesson) => (
                   <div key={lesson._id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#6C5CE7]">
                          <HiOutlineVideoCamera className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{lesson.title}</p>
                          <p className="text-xs text-gray-400 font-medium">{lesson.duration} • {lesson.videoUrl}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setEditingLesson(lesson); setFormData(lesson); }}
                          className="p-2 text-gray-400 hover:text-[#6C5CE7] transition-colors"
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLesson(lesson._id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                   </div>
                 ))}
                 {lessons.filter(l => l.moduleId === module.title).length === 0 && (
                   <p className="p-8 text-center text-xs text-gray-400 italic">No lessons in this module yet.</p>
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
