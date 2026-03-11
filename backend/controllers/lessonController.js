const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// @desc    Get lessons for a course
// @route   GET /api/lessons/course/:courseId
exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId })
      .sort({ moduleIndex: 1, order: 1 });
    res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create lesson (Admin)
// @route   POST /api/lessons
exports.createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    
    // Add lesson to course module
    const course = await Course.findById(req.body.courseId);
    if (course && course.modules[req.body.moduleIndex]) {
      course.modules[req.body.moduleIndex].lessons.push(lesson._id);
      course.totalLessons = await Lesson.countDocuments({ courseId: course._id });
      await course.save();
    }

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lesson (Admin)
// @route   PUT /api/lessons/:id
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lesson (Admin)
// @route   DELETE /api/lessons/:id
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Remove from course module
    const course = await Course.findById(lesson.courseId);
    if (course) {
      course.modules.forEach(module => {
        module.lessons = module.lessons.filter(l => l.toString() !== lesson._id.toString());
      });
      course.totalLessons = Math.max(0, (course.totalLessons || 1) - 1);
      await course.save();
    }

    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
