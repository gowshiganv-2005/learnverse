const express = require('express');
const router = express.Router();
const { getProgress, markLessonCompleted, getAllProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllProgress);
router.get('/:courseId', protect, getProgress);
router.post('/:courseId/complete/:lessonId', protect, markLessonCompleted);

module.exports = router;
