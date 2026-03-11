const { randomUUID: uuidv4 } = require('crypto');
const { getAllRows, findRow, addRow, updateRow } = require('../config/googleSheets');

// Helper to parse order
const parseOrder = async (order, includeRelations = false) => {
  if (!order) return null;
  const parsed = { ...order };
  parsed._id = order.id;
  parsed.amount = Number(order.amount);
  
  if (includeRelations) {
    const courseRow = await findRow('Courses', r => r.get('id') === order.courseId);
    if (courseRow) {
      const c = courseRow.toObject();
      parsed.courseId = { _id: c.id, title: c.title, price: Number(c.price), thumbnail: c.thumbnail };
    }
    
    const userRow = await findRow('Users', r => r.get('id') === order.userId);
    if (userRow) {
      const u = userRow.toObject();
      parsed.userId = { _id: u.id, name: u.name, email: u.email };
    }
  }
  return parsed;
};

// @desc    Purchase a course
// @route   POST /api/orders
exports.purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if already purchased
    const existingOrderRow = await findRow('Orders', row => 
      row.get('userId') === userId && row.get('courseId') === courseId
    );
    if (existingOrderRow) {
      return res.status(400).json({ success: false, message: 'Course already purchased' });
    }

    const courseRow = await findRow('Courses', row => row.get('id') === courseId);
    if (!courseRow) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const courseData = courseRow.toObject();

    // Create order
    const orderData = {
      id: uuidv4(),
      userId,
      courseId,
      amount: courseData.price,
      createdAt: new Date().toISOString()
    };
    await addRow('Orders', orderData);

    // Add course to user's purchased courses
    const userRow = await findRow('Users', row => row.get('id') === userId);
    if (userRow) {
      const userData = userRow.toObject();
      const purchased = JSON.parse(userData.purchasedCourses || '[]');
      if (!purchased.includes(courseId)) {
        purchased.push(courseId);
        await updateRow('Users', r => r.get('id') === userId, {
          purchasedCourses: JSON.stringify(purchased)
        });
      }
    }

    // Increment enrolled students
    await updateRow('Courses', r => r.get('id') === courseId, {
      enrolledStudents: Number(courseData.enrolledStudents || 0) + 1
    });

    res.status(201).json({ success: true, order: await parseOrder(orderData, true) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    let orders = await getAllRows('Orders');
    orders = orders.filter(o => o.userId === req.user.id);
    
    const populatedOrders = await Promise.all(
      orders.map(o => parseOrder(o, true))
    );

    res.json({ success: true, orders: populatedOrders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await getAllRows('Orders');
    const populatedOrders = await Promise.all(
      orders.map(o => parseOrder(o, true))
    );

    const totalRevenue = populatedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    res.json({
      success: true,
      orders: populatedOrders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalRevenue,
      totalOrders: populatedOrders.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get revenue stats (Admin)
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const orders = await getAllRows('Orders');
    const users = await getAllRows('Users');
    const courses = await getAllRows('Courses');

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    
    // Group monthly revenue
    const monthlyRevenue = orders.reduce((acc, o) => {
      const month = new Date(o.createdAt).getMonth() + 1;
      const existing = acc.find(m => m._id === month);
      if (existing) {
        existing.revenue += Number(o.amount || 0);
        existing.orders += 1;
      } else {
        acc.push({ _id: month, revenue: Number(o.amount || 0), orders: 1 });
      }
      return acc;
    }, []).sort((a, b) => a._id - b._id);

    const recentOrdersRaw = orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const recentOrders = await Promise.all(recentOrdersRaw.map(o => parseOrder(o, true)));

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalCourses: courses.length,
        monthlyRevenue,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
