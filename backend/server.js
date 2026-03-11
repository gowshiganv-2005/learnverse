const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Load environment variables locally
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { initSheet, doc, isLoaded } = require('./config/googleSheets');
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

// Connect to Google Sheets immediately
initSheet().catch(err => console.error('Sheet Init Failed:', err.message));

// --- SPECIAL SEED ROUTE (Production Data Recovery) ---
app.get('/api/admin/system-seed', async (req, res) => {
  try {
    const document = await initSheet();
    console.log('Starting Force Seed...');
    
    const sheets = {
      Users: document.sheetsByTitle['Users'],
      Courses: document.sheetsByTitle['Courses'],
      Lessons: document.sheetsByTitle['Lessons']
    };

    if (!sheets.Courses || !sheets.Users) {
      return res.status(500).json({ success: false, message: 'Required sheets not found. Initialization needed.' });
    }

    // Check if courses already exist
    const currentCourses = await sheets.Courses.getRows();
    if (currentCourses.length > 0) {
      return res.json({ success: true, message: 'Database already contains data. Seed skipped to prevent duplicates.', count: currentCourses.length });
    }

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    
    // Seed Admin
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

    // Seed Courses
    const courseId = uuidv4();
    await sheets.Courses.addRow({
      id: courseId,
      title: 'Complete React & Next.js Masterclass 2024',
      description: 'Master modern web development with React and Next.js.',
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
      whatYouWillLearn: JSON.stringify(['React Hooks', 'Next.js App Router', 'Server Components']),
      requirements: JSON.stringify(['JavaScript Basics']),
      modules: JSON.stringify([{ title: 'Introduction', lessons: [] }]),
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'System re-seeded successfully with production starter content.' });
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

// Enhanced Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'Operational',
    timestamp: new Date(),
    database: {
      type: 'Google Sheets',
      connected: !!doc.title,
      synced: isLoaded(),
      id: process.env.GOOGLE_SHEET_ID ? 'Configured' : 'Missing'
    },
    client: {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Using relative paths (Correct for Same-Origin)',
      nodeEnv: process.env.NODE_ENV
    }
  });
});

app.get('/', (req, res) => {
  res.send('LearnVerse API is running securely.');
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 LearnVerse API Server running on port ${PORT}`);
  });
}

module.exports = app;
