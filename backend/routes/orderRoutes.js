const express = require('express');
const router = express.Router();
const { purchaseCourse, getMyOrders, getAllOrders, getStats } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, purchaseCourse);
router.get('/my', protect, getMyOrders);
router.get('/stats', protect, admin, getStats);
router.get('/', protect, admin, getAllOrders);

module.exports = router;
