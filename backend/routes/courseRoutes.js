const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getFeaturedCourses,
  getCategories,
  getAdminCourses
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/auth');

router.get('/featured', getFeaturedCourses);
router.get('/categories', getCategories);
router.get('/admin/all', protect, admin, getAdminCourses);
router.route('/').get(getCourses).post(protect, admin, createCourse);
router.route('/:id').get(getCourse).put(protect, admin, updateCourse).delete(protect, admin, deleteCourse);

module.exports = router;
