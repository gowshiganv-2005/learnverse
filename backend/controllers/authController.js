const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { findRow, addRow } = require('../config/googleSheets');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUserRow = await findRow('Users', row => row.get('email') === email);
    if (existingUserRow) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      bio: '',
      wishlist: JSON.stringify([]),
      purchasedCourses: JSON.stringify([]),
      createdAt: new Date().toISOString()
    };

    await addRow('Users', newUser);
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const userRow = await findRow('Users', row => row.get('email') === email);
    if (!userRow) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userData = userRow.toObject();
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(userData.id);

    res.json({
      success: true,
      token,
      user: {
        _id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const userRow = await findRow('Users', row => row.get('id') === req.user.id);
    if (!userRow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const userData = userRow.toObject();
    
    // Parse JSON strings back to objects with safety
    try {
      userData.wishlist = JSON.parse(userData.wishlist || '[]');
    } catch (e) {
      userData.wishlist = [];
    }

    try {
      userData.purchasedCourses = JSON.parse(userData.purchasedCourses || '[]');
    } catch (e) {
      userData.purchasedCourses = [];
    }
    
    userData._id = userData.id;

    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
