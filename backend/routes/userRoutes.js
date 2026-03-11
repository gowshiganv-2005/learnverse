const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  toggleWishlist,
  getAllUsers,
  deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:courseId', protect, toggleWishlist);
router.get('/admin/all', protect, admin, getAllUsers);
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
