const { v4: uuidv4 } = require('uuid');
const { getAllRows, findRow, addRow, updateRow } = require('../config/googleSheets');

// Helper to parse progress
const parseProgress = (progress) => {
  if (!progress) return null;
  const parsed = { ...progress };
  parsed._id = progress.id;
  parsed.completedLessons = JSON.parse(progress.completedLessons || '[]');
  parsed.progressPercent = Number(progress.progressPercent || 0);
  return parsed;
};

// @desc    Get progress for a course
// @route   GET /api/progress/:courseId
exports.getProgress = async (req, res) => {
  try {
    let progressRow = await findRow('Progress', row => 
      row.get('userId') === req.user.id && row.get('courseId') === req.params.courseId
    );

    if (!progressRow) {
      // Create initial progress
      const progressData = {
        id: uuidv4(),
        userId: req.user.id,
        courseId: req.params.courseId,
        completedLessons: JSON.stringify([]),
        progressPercent: 0,
        createdAt: new Date().toISOString()
      };
      await addRow('Progress', progressData);
      return res.json({ success: true, progress: parseProgress(progressData) });
    }

    res.json({ success: true, progress: parseProgress(progressRow.toObject()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/progress/:courseId/complete/:lessonId
exports.markLessonCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    let progressRow = await findRow('Progress', row => 
      row.get('userId') === req.user.id && row.get('courseId') === courseId
    );

    let progressData;
    if (!progressRow) {
      progressData = {
        id: uuidv4(),
        userId: req.user.id,
        courseId,
        completedLessons: JSON.stringify([lessonId]),
        progressPercent: 0,
        createdAt: new Date().toISOString()
      };
      await addRow('Progress', progressData);
    } else {
      progressData = progressRow.toObject();
      const completed = JSON.parse(progressData.completedLessons || '[]');
      if (!completed.includes(lessonId)) {
        completed.push(lessonId);
      }
      
      // Calculate progress percentage
      const allLessons = await getAllRows('Lessons');
      const courseLessons = allLessons.filter(l => l.courseId === courseId);
      const percent = courseLessons.length > 0
        ? Math.round((completed.length / courseLessons.length) * 100)
        : 0;

      const updated = await updateRow('Progress', r => r.get('id') === progressData.id, {
        completedLessons: JSON.stringify(completed),
        progressPercent: percent
      });
      progressData = updated;
    }

    res.json({ success: true, progress: parseProgress(progressData) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all user progress
// @route   GET /api/progress
exports.getAllProgress = async (req, res) => {
  try {
    let allProgress = await getAllRows('Progress');
    allProgress = allProgress.filter(p => p.userId === req.user.id);
    
    // Populate course details
    const courses = await getAllRows('Courses');
    
    const populated = allProgress.map(p => {
      const parsed = parseProgress(p);
      const course = courses.find(c => c.id === p.courseId);
      if (course) {
        parsed.courseId = { _id: course.id, title: course.title, thumbnail: course.thumbnail };
      }
      return parsed;
    });

    res.json({ success: true, progress: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
