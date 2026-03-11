const express = require('express');
const router = express.Router();
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');
const { protect, admin } = require('../middleware/auth');

router.get('/course/:courseId', protect, getLessons);
router.route('/').post(protect, admin, createLesson);
router.route('/:id').get(protect, getLesson).put(protect, admin, updateLesson).delete(protect, admin, deleteLesson);

module.exports = router;
