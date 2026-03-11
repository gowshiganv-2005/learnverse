const { randomUUID: uuidv4 } = require('crypto');
const { getAllRows, findRow, addRow, updateRow, deleteRow } = require('../config/googleSheets');

// Helper to parse lesson data
const parseLesson = (lesson) => {
  if (!lesson) return null;
  const parsed = { ...lesson };
  parsed._id = lesson.id;
  return parsed;
};

// @desc    Get lessons for a course
// @route   GET /api/lessons/course/:courseId
exports.getLessons = async (req, res) => {
  try {
    let lessons = await getAllRows('Lessons');
    lessons = lessons
      .filter(l => l.courseId === req.params.courseId)
      .map(parseLesson);
    res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
exports.getLesson = async (req, res) => {
  try {
    const lessonRow = await findRow('Lessons', row => row.get('id') === req.params.id);
    if (!lessonRow) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.json({ success: true, lesson: parseLesson(lessonRow.toObject()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create lesson (Admin)
// @route   POST /api/lessons
exports.createLesson = async (req, res) => {
  try {
    const lessonData = {
      ...req.body,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };

    await addRow('Lessons', lessonData);
    
    // In Google Sheets version, we maintain course structure in the courseRow itself.
    // The previous logic updated the Course model's nested lessons array.
    // We can update the course's modules field if necessary.
    
    const courseRow = await findRow('Courses', row => row.get('id') === req.body.courseId);
    if (courseRow) {
      const course = courseRow.toObject();
      const modules = JSON.parse(course.modules || '[]');
      // Update specific module if index is provided (or match by title/id)
      // For now, we'll just keep it simple as the player fetches lessons separately anyway.
    }

    res.status(201).json({ success: true, lesson: parseLesson(lessonData) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lesson (Admin)
// @route   PUT /api/lessons/:id
exports.updateLesson = async (req, res) => {
  try {
    const updated = await updateRow('Lessons', row => row.get('id') === req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.json({ success: true, lesson: parseLesson(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lesson (Admin)
// @route   DELETE /api/lessons/:id
exports.deleteLesson = async (req, res) => {
  try {
    const deleted = await deleteRow('Lessons', row => row.get('id') === req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
