const jwt = require('jsonwebtoken');
const { findRow } = require('../config/googleSheets');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRow = await findRow('Users', row => row.get('id') === decoded.id);
    
    if (!userRow) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const userData = userRow.toObject();
    userData._id = userData.id; // Maintain compatibility
    req.user = userData;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

// Admin only middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };
