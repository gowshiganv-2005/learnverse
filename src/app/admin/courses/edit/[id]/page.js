'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { 
  HiOutlineArrowLeft, 
  HiOutlineSave,
  HiOutlineCloudUpload,
  HiOutlinePlus,
  HiOutlineTrash
} from 'react-icons/hi';
import API from '@/utils/api';
import { categories as categoryList } from '@/utils/helpers';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function EditCoursePage({ params }) {
  const [mounted, setMounted] = useState(false);
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    category: 'Web Development',
    thumbnail: '',
    instructor: '',
    level: 'Beginner',
    language: 'English',
    featured: false,
    published: true,
    whatYouWillLearn: [''],
    requirements: [''],
    modules: [{ title: '', lessons: [] }]
  });

  useEffect(() => {
    setMounted(true);
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const { data } = await API.get(`/courses/${id}`);
      if (data.success) {
        setFormData(data.course);
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        toast.error('Failed to load course details');
        router.push('/admin/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleArrayChange = (index, value, type) => {
    const newArr = [...formData[type]];
    newArr[index] = value;
    setFormData({ ...formData, [type]: newArr });
  };

  const addArrayItem = (type) => {
    setFormData({ ...formData, [type]: [...formData[type], ''] });
  };

  const removeArrayItem = (index, type) => {
    const newArr = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: newArr });
  };

  const handleModuleChange = (index, value) => {
    const newModules = [...formData.modules];
    newModules[index].title = value;
    setFormData({ ...formData, modules: newModules });
  };

  const addModule = () => {
    setFormData({ ...formData, modules: [...formData.modules, { title: '', lessons: [] }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
       await API.put(`/courses/${id}`, formData);
       toast.success('Course updated successfully!');
       router.push('/admin/courses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading) {
    return <LoadingSpinner fullScreen text={!mounted ? "Loading Editor..." : "Fetching Course Details..."} />;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-500 mt-1">Update the curriculum and details for "{formData.title}"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">General Information</h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Course Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="input-field" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Short Description</label>
              <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="input-field min-h-[200px]" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Instructor Name</label>
                <input type="text" name="instructor" value={formData.instructor} onChange={handleInputChange} className="input-field" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="input-field">
                  {categoryList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-6">
               <h3 className="text-lg font-bold text-gray-900">Course Content Structure</h3>
               <button type="button" onClick={addModule} className="text-sm font-bold text-[#6C5CE7] flex items-center gap-1"><HiOutlinePlus /> Add Module</button>
             </div>
             <div className="space-y-4">
               {formData.modules.map((module, idx) => (
                 <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-[#6C5CE7]">{idx + 1}</span>
                    <input type="text" value={module.title} onChange={(e) => handleModuleChange(idx, e.target.value)} className="bg-transparent border-none focus:ring-0 text-sm font-bold flex-1" />
                    <button type="button" onClick={() => { setFormData({ ...formData, modules: formData.modules.filter((_, i) => i !== idx) }); }} className="text-red-400"><HiOutlineTrash /></button>
                 </div>
               ))}
             </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">What you'll learn</h3>
                 <button type="button" onClick={() => addArrayItem('whatYouWillLearn')} className="text-[#6C5CE7]"><HiOutlinePlus /></button>
               </div>
               {formData.whatYouWillLearn.map((item, idx) => (
                 <div key={idx} className="flex gap-2 mb-2">
                   <input type="text" value={item} onChange={(e) => handleArrayChange(idx, e.target.value, 'whatYouWillLearn')} className="input-field text-xs py-2" />
                   <button type="button" onClick={() => removeArrayItem(idx, 'whatYouWillLearn')} className="text-red-400"><HiOutlineTrash /></button>
                 </div>
               ))}
             </div>
             <div>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Requirements</h3>
                 <button type="button" onClick={() => addArrayItem('requirements')} className="text-[#6C5CE7]"><HiOutlinePlus /></button>
               </div>
               {formData.requirements.map((item, idx) => (
                 <div key={idx} className="flex gap-2 mb-2">
                   <input type="text" value={item} onChange={(e) => handleArrayChange(idx, e.target.value, 'requirements')} className="input-field text-xs py-2" />
                   <button type="button" onClick={() => removeArrayItem(idx, 'requirements')} className="text-red-400"><HiOutlineTrash /></button>
                 </div>
               ))}
             </div>
          </section>
        </div>

        <div className="space-y-8">
           <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">Settings</h3>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Course Price ($)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="input-field" step="0.01" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Thumbnail URL</label>
                <input type="text" name="thumbnail" value={formData.thumbnail} onChange={handleInputChange} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Level</label>
                  <select name="level" value={formData.level} onChange={handleInputChange} className="input-field text-sm">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="published" checked={formData.published} onChange={handleInputChange} className="w-5 h-5 rounded-lg text-[#6C5CE7] focus:ring-[#6C5CE7]" />
                  <span className="text-sm font-bold text-gray-900">Published</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="w-5 h-5 rounded-lg text-[#6C5CE7] focus:ring-[#6C5CE7]" />
                  <span className="text-sm font-bold text-gray-900">Featured</span>
                </label>
              </div>
              <button type="submit" disabled={saving} className="w-full btn-primary justify-center py-4 text-base">
                {saving ? 'Saving...' : 'Update Course'}
              </button>
           </section>
        </div>
      </form>
    </div>
  );
}
