const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Purchase a course
// @route   POST /api/orders
exports.purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Check if already purchased
    const existingOrder = await Order.findOne({ userId, courseId, paymentStatus: 'completed' });
    if (existingOrder) {
      return res.status(400).json({ success: false, message: 'Course already purchased' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Create order
    const order = await Order.create({
      userId,
      courseId,
      amount: course.price
    });

    // Add course to user's purchased courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { purchasedCourses: courseId }
    });

    // Increment enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: 1 }
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('courseId')
      .populate('userId', 'name email');

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('courseId')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('courseId', 'title price thumbnail')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate total revenue
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'completed')
      .reduce((sum, order) => sum + (order.amount || 0), 0);

    res.json({
      success: true,
      orders,
      totalRevenue,
      totalOrders: orders.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get revenue stats (Admin)
// @route   GET /api/orders/stats
exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ paymentStatus: 'completed' });
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentOrders = await Order.find({ paymentStatus: 'completed' })
      .populate('courseId', 'title price thumbnail')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalOrders,
        totalUsers,
        totalCourses,
        monthlyRevenue,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
