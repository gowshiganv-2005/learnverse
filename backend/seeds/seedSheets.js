const bcrypt = require('bcryptjs');
const { randomUUID: uuidv4 } = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { initSheet } = require('../config/googleSheets');

const coursesData = [
  {
    title: 'Complete React & Next.js Masterclass 2024',
    description: 'Master React.js and Next.js from absolute beginner to advanced level. Build real-world projects including a full-stack e-commerce platform, social media app, and SaaS dashboard. Learn hooks, context API, server-side rendering, static site generation, API routes, authentication, and deployment.',
    shortDescription: 'Master modern React and Next.js with hands-on projects.',
    price: 89.99,
    category: 'Web Development',
    instructor: 'Sarah Mitchell',
    level: 'Beginner',
    language: 'English',
    rating: 4.8,
    numReviews: 342,
    enrolledStudents: 2450,
    featured: true,
    published: true,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    whatYouWillLearn: [
      'Build production-ready React applications',
      'Master Next.js 14 with App Router',
      'Server-side rendering and static generation',
      'Authentication with NextAuth.js',
      'Database integration with Prisma',
      'Deploy to Vercel and AWS'
    ],
    requirements: ['Basic HTML, CSS, JavaScript knowledge', 'A computer with internet access'],
    modules: [
      { title: 'Getting Started with React', lessons: [] },
      { title: 'React Hooks Deep Dive', lessons: [] },
      { title: 'Next.js Fundamentals', lessons: [] },
      { title: 'Building Real Projects', lessons: [] }
    ]
  },
  {
    title: 'Python for Data Science & Machine Learning',
    description: 'Comprehensive Python course covering data analysis, visualization, machine learning, and deep learning. Work with NumPy, Pandas, Matplotlib, Scikit-Learn, TensorFlow, and more. Build ML models for real-world datasets and learn deployment strategies.',
    shortDescription: 'From Python basics to ML deployment.',
    price: 94.99,
    category: 'Data Science',
    instructor: 'Dr. James Park',
    level: 'Intermediate',
    language: 'English',
    rating: 4.9,
    numReviews: 567,
    enrolledStudents: 4120,
    featured: true,
    published: true,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    whatYouWillLearn: [
      'Python programming fundamentals',
      'Data analysis with Pandas',
      'Machine learning with Scikit-Learn',
      'Deep learning with TensorFlow',
      'Data visualization with Matplotlib & Seaborn',
      'Model deployment strategies'
    ],
    requirements: ['Basic math knowledge', 'No programming experience needed'],
    modules: [
      { title: 'Python Fundamentals', lessons: [] },
      { title: 'Data Analysis & Visualization', lessons: [] },
      { title: 'Machine Learning Basics', lessons: [] },
      { title: 'Deep Learning & Neural Networks', lessons: [] }
    ]
  },
  {
    title: 'UI/UX Design Masterclass',
    description: 'Learn professional UI/UX design from scratch. Master Figma, design systems, user research, wireframing, prototyping, and design thinking. Create stunning interfaces that users love and build a portfolio that gets you hired.',
    shortDescription: 'Design beautiful interfaces with Figma.',
    price: 79.99,
    category: 'Design',
    instructor: 'Emily Rodriguez',
    level: 'Beginner',
    language: 'English',
    rating: 4.7,
    numReviews: 289,
    enrolledStudents: 1870,
    featured: true,
    published: true,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    whatYouWillLearn: [
      'UI/UX design fundamentals',
      'Figma from beginner to advanced',
      'Design systems and components',
      'User research methods',
      'Wireframing and prototyping',
      'Portfolio building'
    ],
    requirements: ['No design experience needed', 'Figma account (free)'],
    modules: [
      { title: 'Design Fundamentals', lessons: [] },
      { title: 'Mastering Figma', lessons: [] },
      { title: 'UX Research & Strategy', lessons: [] },
      { title: 'Building Your Portfolio', lessons: [] }
    ]
  }
];

const seed = async () => {
  try {
    const doc = await initSheet();
    console.log('Connected to Google Sheets for seeding...');

    const sheets = {
      Users: doc.sheetsByTitle['Users'],
      Courses: doc.sheetsByTitle['Courses'],
      Lessons: doc.sheetsByTitle['Lessons'],
      Reviews: doc.sheetsByTitle['Reviews'],
      Orders: doc.sheetsByTitle['Orders']
    };

    // Check if sheets exist
    for (const [name, sheet] of Object.entries(sheets)) {
      if (!sheet) throw new Error(`Sheet "${name}" not found. Run initSheets.js first.`);
    }

    // Clear existing data (but keep headers)
    console.log('Clearing existing data...');
    for (const sheet of Object.values(sheets)) {
      const rows = await sheet.getRows();
      for (const row of rows) {
        await row.delete();
      }
    }

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    // Create Admin
    const adminId = uuidv4();
    await sheets.Users.addRow({
      id: adminId,
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

    // Create Test User
    const testerId = uuidv4();
    await sheets.Users.addRow({
      id: testerId,
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'user',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
      bio: 'Lifelong learner and software enthusiast.',
      wishlist: '[]',
      purchasedCourses: '[]',
      createdAt: new Date().toISOString()
    });

    console.log('Added Users.');

    // Create Courses & Lessons
    const sampleVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    for (const courseInfo of coursesData) {
      const courseId = uuidv4();
      
      // Add lessons for each module
      const modulesWithLessons = courseInfo.modules.map((mod, modIdx) => {
        const lessonIds = [];
        // Add 2 lessons per module for seed
        for (let i = 1; i <= 2; i++) {
          const lessonId = uuidv4();
          lessonIds.push(lessonId);
          sheets.Lessons.addRow({
            id: lessonId,
            title: `${mod.title} - Lesson ${i}`,
            videoUrl: sampleVideoUrl,
            duration: '10:00',
            moduleId: modIdx,
            courseId: courseId,
            createdAt: new Date().toISOString()
          });
        }
        return { ...mod, lessons: lessonIds };
      });

      await sheets.Courses.addRow({
        id: courseId,
        title: courseInfo.title,
        description: courseInfo.description,
        shortDescription: courseInfo.shortDescription,
        price: courseInfo.price,
        category: courseInfo.category,
        thumbnail: courseInfo.thumbnail,
        instructor: courseInfo.instructor,
        level: courseInfo.level,
        language: courseInfo.language,
        featured: courseInfo.featured ? 'TRUE' : 'FALSE',
        published: courseInfo.published ? 'TRUE' : 'FALSE',
        rating: courseInfo.rating,
        numReviews: courseInfo.numReviews,
        enrolledStudents: courseInfo.enrolledStudents,
        whatYouWillLearn: JSON.stringify(courseInfo.whatYouWillLearn),
        requirements: JSON.stringify(courseInfo.requirements),
        modules: JSON.stringify(modulesWithLessons),
        createdAt: new Date().toISOString()
      });
    }

    console.log('Added Courses and Lessons.');
    console.log('✅ Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seed();
