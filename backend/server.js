const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Node.js environment variables are handled automatically on Vercel
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { initSheet, isLoaded, getDoc } = require('./config/googleSheets');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const progressRoutes = require('./routes/progressRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Proactive Connection (Non-Blocking)
initSheet().catch(err => {
  console.log('⚠️ Deferred sheet connection:', err.message);
});

// --- SPECIAL SEED ROUTE (Production Data Recovery) ---
app.get('/api/admin/system-seed', async (req, res) => {
  try {
    const document = await initSheet();
    console.log('Force Seeding Started...');
    
    const sheets = {
      Users: document.sheetsByTitle['Users'],
      Courses: document.sheetsByTitle['Courses'],
      Lessons: document.sheetsByTitle['Lessons']
    };

    if (!sheets.Courses || !sheets.Users) {
      return res.status(500).json({ success: false, message: 'Google Spreadsheet is missing required tabs (Users/Courses).' });
    }

    const currentRows = await sheets.Courses.getRows();
    if (currentRows.length > 0) {
      return res.json({ success: true, message: 'Data already exists in spreadsheet.', count: currentRows.length });
    }

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    
    await sheets.Users.addRow({
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@learnverse.com',
      password: adminPassword,
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
      bio: 'Platform administrator',
      wishlist: '[]',
      purchasedCourses: '[]',
      createdAt: new Date().toISOString()
    });

    const courseId = uuidv4();
    await sheets.Courses.addRow({
      id: courseId,
      title: 'Complete React & Next.js Masterclass 2024',
      description: 'Master modern React/Next development.',
      shortDescription: 'The ultimate guide to modern web apps.',
      price: 89.99,
      category: 'Web Development',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      instructor: 'Sarah Mitchell',
      level: 'Beginner',
      language: 'English',
      featured: 'TRUE',
      published: 'TRUE',
      rating: 4.8,
      numReviews: 342,
      enrolledStudents: 2450,
      whatYouWillLearn: JSON.stringify(['React Hooks', 'Next.js App Router']),
      requirements: JSON.stringify(['JavaScript']),
      modules: JSON.stringify([{ title: 'Intro', lessons: [] }]),
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Spreadsheet seeded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/progress', progressRoutes);

// Health check with Environment Debug
app.get('/api/health', (req, res) => {
  let sheetInfo = "Not Init";
  try {
     const d = getDoc();
     sheetInfo = d ? "Config Present" : "Doc Missing";
  } catch (e) {
     sheetInfo = e.message;
  }

  res.json({
    success: true,
    status: 'Server Active',
    timestamp: new Date(),
    sheets: {
      status: sheetInfo,
      synced: isLoaded()
    },
    env: {
      has_sheet_id: !!process.env.GOOGLE_SHEET_ID,
      has_service_email: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      has_private_key: !!process.env.GOOGLE_PRIVATE_KEY,
      node_env: process.env.NODE_ENV
    }
  });
});

app.get('/', (req, res) => {
  res.send('LearnVerse API is running securely.');
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 LearnVerse API running on port ${PORT}`);
  });
}

module.exports = app;
