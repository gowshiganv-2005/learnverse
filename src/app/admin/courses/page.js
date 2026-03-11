'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HiOutlinePlus, 
  HiOutlinePencilAlt, 
  HiOutlineTrash, 
  HiOutlineEye,
  HiOutlineSearch,
} from 'react-icons/hi';
import API from '@/utils/api';
import { formatPrice } from '@/utils/helpers';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminCoursesPage() {
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await API.get('/courses/admin/all');
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      // Avoid toast on mount if it's SSR phase (though guards prevent this)
      if (typeof window !== 'undefined') toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      const { data } = await API.delete(`/courses/${courseId}`);
      if (data.success) {
        setCourses(courses.filter(c => c._id !== courseId));
        toast.success('Course deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  if (!mounted) {
    return <LoadingSpinner text="Preparing course directory..." />;
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500 mt-1">Manage, edit, and organize your platform courses.</p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary">
          <HiOutlinePlus className="w-5 h-5" />
          Create New Course
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 py-3"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching courses..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">
                  <th className="px-8 py-5">Course</th>
                  <th className="px-8 py-5">Instructor</th>
                  <th className="px-8 py-5">Price</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Students</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCourses.map((course, idx) => (
                  <tr key={course._id || idx} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={course.thumbnail} 
                          className="w-14 h-10 object-cover rounded-lg shadow-sm" 
                          alt="" 
                        />
                        <div>
                           <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{course.title}</p>
                           <div className="flex items-center gap-2">
                             <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${course.published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                               {course.published ? 'Published' : 'Draft'}
                             </span>
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-gray-600">{course.instructor}</td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-900">{formatPrice(course.price)}</td>
                    <td className="px-8 py-6 text-sm font-semibold text-[#6C5CE7]">{course.category}</td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-400">{course.enrolledStudents || 0}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/courses/${course._id}`}
                          className="p-2 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-900 transition-all"
                          title="View"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </Link>
                        <Link 
                          href={`/admin/courses/edit/${course._id}`}
                          className="p-2 rounded-xl bg-purple-50 border border-transparent hover:border-purple-200 text-[#6C5CE7] transition-all"
                          title="Edit"
                        >
                          <HiOutlinePencilAlt className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(course._id)}
                          className="p-2 rounded-xl bg-red-50 border border-transparent hover:border-red-200 text-red-500 transition-all"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCourses.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-gray-400 text-sm">No courses matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
