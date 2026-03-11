const { getAllRows, findRow, updateRow, deleteRow } = require('../config/googleSheets');

// Helper to parse user
const parseUser = async (user, includeRelations = false) => {
  if (!user) return null;
  const parsed = { ...user };
  parsed._id = user.id;
  parsed.wishlist = JSON.parse(user.wishlist || '[]');
  parsed.purchasedCourses = JSON.parse(user.purchasedCourses || '[]');
  
  if (includeRelations) {
    // Populate wishlist courses
    const allCourses = await getAllRows('Courses');
    parsed.wishlist = parsed.wishlist.map(id => {
      const c = allCourses.find(row => row.id === id);
      return c ? { _id: c.id, ...c, price: Number(c.price) } : null;
    }).filter(c => c !== null);

    // Populate purchased courses
    parsed.purchasedCourses = parsed.purchasedCourses.map(id => {
      const c = allCourses.find(row => row.id === id);
      return c ? { _id: c.id, ...c, price: Number(c.price) } : null;
    }).filter(c => c !== null);
  }
  return parsed;
};

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const userRow = await findRow('Users', row => row.get('id') === req.user.id);
    if (!userRow) return res.status(404).json({ success: false, message: 'User not found' });
    
    const user = await parseUser(userRow.toObject(), true);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const updated = await updateRow('Users', row => row.get('id') === req.user.id, { name, bio, avatar });
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, user: await parseUser(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle wishlist
// @route   POST /api/users/wishlist/:courseId
exports.toggleWishlist = async (req, res) => {
  try {
    const userRow = await findRow('Users', row => row.get('id') === req.user.id);
    const userData = userRow.toObject();
    const wishlist = JSON.parse(userData.wishlist || '[]');
    const courseId = req.params.courseId;

    const index = wishlist.indexOf(courseId);
    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(courseId);
    }

    const updated = await updateRow('Users', r => r.get('id') === req.user.id, {
      wishlist: JSON.stringify(wishlist)
    });

    const finalUser = await parseUser(updated, true);
    
    res.json({ 
      success: true, 
      wishlist: finalUser.wishlist,
      message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users/admin/all
exports.getAllUsers = async (req, res) => {
  try {
    const users = await getAllRows('Users');
    const parsedUsers = await Promise.all(users.map(u => parseUser(u)));
    res.json({ success: true, users: parsedUsers.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await deleteRow('Users', row => row.get('id') === req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
