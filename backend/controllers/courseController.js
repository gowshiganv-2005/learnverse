const { v4: uuidv4 } = require('uuid');
const { getAllRows, findRow, addRow, updateRow, deleteRow } = require('../config/googleSheets');

// Helper to parse course data
const parseCourse = (course) => {
  if (!course) return null;
  const parsed = { ...course };
  parsed._id = course.id;
  parsed.price = Number(course.price || 0);
  parsed.rating = Number(course.rating || 0);
  parsed.numReviews = Number(course.numReviews || 0);
  parsed.enrolledStudents = Number(course.enrolledStudents || 0);

  // Case-insensitive & Type-agnostic boolean check
  const isTrue = (val) => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const s = val.trim().toUpperCase();
      return s === 'TRUE' || s === '1' || s === 'YES';
    }
    if (typeof val === 'number') return val === 1;
    return !!val;
  };

  parsed.featured = isTrue(course.featured);
  parsed.published = isTrue(course.published);

  try {
    parsed.whatYouWillLearn = typeof course.whatYouWillLearn === 'string' ? JSON.parse(course.whatYouWillLearn || '[]') : (course.whatYouWillLearn || []);
  } catch (e) {
    parsed.whatYouWillLearn = [];
  }

  try {
    parsed.requirements = typeof course.requirements === 'string' ? JSON.parse(course.requirements || '[]') : (course.requirements || []);
  } catch (e) {
    parsed.requirements = [];
  }

  try {
    parsed.modules = typeof course.modules === 'string' ? JSON.parse(course.modules || '[]') : (course.modules || []);
  } catch (e) {
    parsed.modules = [];
  }
  
  return parsed;
};

// @desc    Get all courses
// @route   GET /api/courses
exports.getCourses = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, rating, search, sort, page = 1, limit = 12 } = req.query;
    
    let courses = await getAllRows('Courses');
    courses = courses.map(parseCourse).filter(c => c.published);

    // Filters
    if (category && category !== 'all') {
      courses = courses.filter(c => c.category === category);
    }
    if (minPrice) {
      courses = courses.filter(c => c.price >= Number(minPrice));
    }
    if (maxPrice) {
      courses = courses.filter(c => c.price <= Number(maxPrice));
    }
    if (rating) {
      courses = courses.filter(c => c.rating >= Number(rating));
    }
    if (search) {
      const s = search.toLowerCase();
      courses = courses.filter(c => 
        c.title.toLowerCase().includes(s) || 
        c.description.toLowerCase().includes(s) || 
        c.instructor.toLowerCase().includes(s)
      );
    }

    // Sort
    if (sort === 'price-low') courses.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') courses.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') courses.sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') courses.sort((a, b) => b.enrolledStudents - a.enrolledStudents);
    else courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = courses.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedCourses = courses.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      courses: paginatedCourses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured courses
// @route   GET /api/courses/featured
exports.getFeaturedCourses = async (req, res) => {
  try {
    let courses = await getAllRows('Courses');
    courses = courses
      .map(parseCourse)
      .filter(c => c.featured && c.published)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get course categories with counts
// @route   GET /api/courses/categories
exports.getCategories = async (req, res) => {
  try {
    let courses = await getAllRows('Courses');
    courses = courses.map(parseCourse).filter(c => c.published);
    
    const categoryCounts = courses.reduce((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + 1;
      return acc;
    }, {});

    const categories = Object.keys(categoryCounts).map(cat => ({
      _id: cat,
      count: categoryCounts[cat]
    })).sort((a, b) => b.count - a.count);

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
exports.getCourse = async (req, res) => {
  try {
    const courseRow = await findRow('Courses', row => row.get('id') === req.params.id);
    if (!courseRow) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const course = parseCourse(courseRow.toObject());
    
    // In a real app, you might want to fetch lessons related to this course
    // and attach them to modules. For now, we'll return the course as is.
    // The modules field already contains some structure.

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create course (Admin)
// @route   POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      id: uuidv4(),
      rating: 0,
      numReviews: 0,
      enrolledStudents: 0,
      whatYouWillLearn: JSON.stringify(req.body.whatYouWillLearn || []),
      requirements: JSON.stringify(req.body.requirements || []),
      modules: JSON.stringify(req.body.modules || []),
      createdAt: new Date().toISOString()
    };

    await addRow('Courses', courseData);
    res.status(201).json({ success: true, course: parseCourse(courseData) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course (Admin)
// @route   PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.whatYouWillLearn) updateData.whatYouWillLearn = JSON.stringify(updateData.whatYouWillLearn);
    if (updateData.requirements) updateData.requirements = JSON.stringify(updateData.requirements);
    if (updateData.modules) updateData.modules = JSON.stringify(updateData.modules);

    const updated = await updateRow('Courses', row => row.get('id') === req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course: parseCourse(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete course (Admin)
// @route   DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await deleteRow('Courses', row => row.get('id') === req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Optional: Delete related lessons
    const lessons = await getAllRows('Lessons');
    for (const lesson of lessons) {
      if (lesson.courseId === req.params.id) {
        await deleteRow('Lessons', r => r.get('id') === lesson.id);
      }
    }

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all courses for admin (including unpublished)
// @route   GET /api/courses/admin/all
exports.getAdminCourses = async (req, res) => {
  try {
    let courses = await getAllRows('Courses');
    courses = courses.map(parseCourse).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
