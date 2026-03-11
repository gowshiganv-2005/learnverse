const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');

// @desc    Get progress for a course
// @route   GET /api/progress/:courseId
exports.getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });

    if (!progress) {
      // Create initial progress
      const firstLesson = await Lesson.findOne({ courseId: req.params.courseId })
        .sort({ moduleIndex: 1, order: 1 });

      progress = await Progress.create({
        userId: req.user._id,
        courseId: req.params.courseId,
        currentLesson: firstLesson?._id,
        completedLessons: [],
        progressPercent: 0
      });
    }

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/progress/:courseId/complete/:lessonId
exports.markLessonCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId
    });

    if (!progress) {
      progress = await Progress.create({
        userId: req.user._id,
        courseId,
        completedLessons: [lessonId],
        currentLesson: lessonId
      });
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
      progress.currentLesson = lessonId;
      progress.lastAccessedAt = new Date();
    }

    // Calculate progress percentage
    const totalLessons = await Lesson.countDocuments({ courseId });
    progress.progressPercent = totalLessons > 0
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;

    await progress.save();
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all user progress
// @route   GET /api/progress
exports.getAllProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id })
      .populate('courseId')
      .populate('currentLesson')
      .sort({ lastAccessedAt: -1 });
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
