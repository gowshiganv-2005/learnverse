const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Progress = require('../models/Progress');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    await Progress.deleteMany({});

    console.log('Cleared existing data.');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@learnverse.com',
      password: 'admin123',
      role: 'admin',
      bio: 'Platform administrator'
    });

    // Create regular users
    const users = await User.create([
      { name: 'John Doe', email: 'john@example.com', password: 'user123', bio: 'Full stack developer' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'user123', bio: 'UI/UX Designer' },
      { name: 'Mike Wilson', email: 'mike@example.com', password: 'user123', bio: 'Data Scientist' },
      { name: 'Sarah Johnson', email: 'sarah@example.com', password: 'user123', bio: 'Marketing Expert' },
      { name: 'Alex Chen', email: 'alex@example.com', password: 'user123', bio: 'Mobile Developer' }
    ]);

    console.log('Created users.');

    // Create courses
    const coursesData = [
      {
        title: 'Complete React & Next.js Masterclass 2024',
        description: 'Master React.js and Next.js from absolute beginner to advanced level. Build real-world projects including a full-stack e-commerce platform, social media app, and SaaS dashboard. Learn hooks, context API, server-side rendering, static site generation, API routes, authentication, and deployment.',
        shortDescription: 'Master modern React and Next.js with hands-on projects.',
        price: 89.99,
        category: 'Web Development',
        instructor: 'Sarah Mitchell',
        level: 'Beginner',
        totalDuration: '42h 30m',
        rating: 4.8,
        numReviews: 342,
        enrolledStudents: 2450,
        featured: true,
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
        totalDuration: '56h 15m',
        rating: 4.9,
        numReviews: 567,
        enrolledStudents: 4120,
        featured: true,
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
        totalDuration: '38h 45m',
        rating: 4.7,
        numReviews: 289,
        enrolledStudents: 1870,
        featured: true,
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
      },
      {
        title: 'Node.js & Express Backend Development',
        description: 'Build scalable backend applications with Node.js and Express. Learn REST APIs, GraphQL, authentication, database design, caching, testing, and microservices architecture. Deploy production applications to cloud platforms.',
        shortDescription: 'Build production-ready backend APIs.',
        price: 84.99,
        category: 'Web Development',
        instructor: 'David Kumar',
        level: 'Intermediate',
        totalDuration: '44h 20m',
        rating: 4.6,
        numReviews: 198,
        enrolledStudents: 1560,
        featured: true,
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
        whatYouWillLearn: [
          'Node.js core concepts',
          'Express.js REST APIs',
          'MongoDB & Mongoose',
          'Authentication with JWT',
          'Testing with Jest',
          'Docker & Deployment'
        ],
        requirements: ['JavaScript fundamentals', 'Basic understanding of HTTP'],
        modules: [
          { title: 'Node.js Core', lessons: [] },
          { title: 'Express & REST APIs', lessons: [] },
          { title: 'Database & Authentication', lessons: [] },
          { title: 'Testing & Deployment', lessons: [] }
        ]
      },
      {
        title: 'Flutter & Dart - Complete Mobile Development',
        description: 'Build beautiful cross-platform mobile apps with Flutter and Dart. Create iOS and Android apps from a single codebase. Master state management, animations, Firebase integration, and app store deployment.',
        shortDescription: 'Cross-platform mobile apps with Flutter.',
        price: 89.99,
        category: 'Mobile Development',
        instructor: 'Lisa Wang',
        level: 'Beginner',
        totalDuration: '48h 10m',
        rating: 4.8,
        numReviews: 421,
        enrolledStudents: 3200,
        featured: true,
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        whatYouWillLearn: [
          'Dart programming language',
          'Flutter widgets and layouts',
          'State management (Provider, Riverpod)',
          'Firebase backend integration',
          'Beautiful UI animations',
          'App store deployment'
        ],
        requirements: ['Basic programming knowledge', 'Computer capable of running Android Studio/Xcode'],
        modules: [
          { title: 'Dart Language Basics', lessons: [] },
          { title: 'Flutter UI Development', lessons: [] },
          { title: 'State Management', lessons: [] },
          { title: 'Firebase & Deployment', lessons: [] }
        ]
      },
      {
        title: 'Digital Marketing & Growth Hacking',
        description: 'Master digital marketing strategies for 2024. Learn SEO, social media marketing, content marketing, email marketing, paid advertising, analytics, and growth hacking techniques to scale any business.',
        shortDescription: 'Scale your business with digital marketing.',
        price: 69.99,
        category: 'Marketing',
        instructor: 'Michael Brown',
        level: 'Beginner',
        totalDuration: '32h 40m',
        rating: 4.5,
        numReviews: 156,
        enrolledStudents: 980,
        featured: false,
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        whatYouWillLearn: [
          'SEO optimization',
          'Social media strategy',
          'Content marketing',
          'Email marketing automation',
          'Google & Facebook Ads',
          'Analytics & data-driven decisions'
        ],
        requirements: ['No prior marketing experience needed'],
        modules: [
          { title: 'Marketing Fundamentals', lessons: [] },
          { title: 'SEO & Content', lessons: [] },
          { title: 'Paid Advertising', lessons: [] },
          { title: 'Growth Strategies', lessons: [] }
        ]
      },
      {
        title: 'AWS Cloud Solutions Architect',
        description: 'Prepare for AWS Solutions Architect certification. Learn EC2, S3, RDS, Lambda, CloudFormation, VPC, and more. Build highly available, fault-tolerant, and scalable systems on AWS.',
        shortDescription: 'Master AWS cloud architecture.',
        price: 99.99,
        category: 'Other',
        instructor: 'Robert Chen',
        level: 'Advanced',
        totalDuration: '52h 30m',
        rating: 4.7,
        numReviews: 234,
        enrolledStudents: 1420,
        featured: true,
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        whatYouWillLearn: [
          'AWS core services (EC2, S3, RDS)',
          'Serverless with Lambda',
          'Infrastructure as Code',
          'VPC and networking',
          'Security best practices',
          'Certification preparation'
        ],
        requirements: ['Basic IT knowledge', 'AWS free tier account'],
        modules: [
          { title: 'AWS Core Services', lessons: [] },
          { title: 'Networking & Security', lessons: [] },
          { title: 'Serverless & DevOps', lessons: [] },
          { title: 'Exam Preparation', lessons: [] }
        ]
      },
      {
        title: 'Business Strategy & Entrepreneurship',
        description: 'Learn how to build, launch, and scale a successful business. Covers business model canvas, lean startup methodology, fundraising, financial modeling, and leadership skills for modern entrepreneurs.',
        shortDescription: 'Build and scale your startup.',
        price: 74.99,
        category: 'Business',
        instructor: 'Amanda Foster',
        level: 'Beginner',
        totalDuration: '28h 15m',
        rating: 4.4,
        numReviews: 132,
        enrolledStudents: 760,
        featured: false,
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        whatYouWillLearn: [
          'Business model design',
          'Lean startup methodology',
          'Financial modeling',
          'Fundraising strategies',
          'Leadership & team building',
          'Scaling operations'
        ],
        requirements: ['Entrepreneurial mindset', 'No business experience needed'],
        modules: [
          { title: 'Business Foundations', lessons: [] },
          { title: 'Product & Market Fit', lessons: [] },
          { title: 'Fundraising', lessons: [] },
          { title: 'Scaling Your Business', lessons: [] }
        ]
      },
      {
        title: 'Advanced Machine Learning & AI',
        description: 'Deep dive into advanced ML algorithms, reinforcement learning, GANs, transformers, and natural language processing. Build AI-powered applications using PyTorch and deploy models to production.',
        shortDescription: 'Advanced AI and deep learning techniques.',
        price: 109.99,
        category: 'Machine Learning',
        instructor: 'Dr. Priya Patel',
        level: 'Advanced',
        totalDuration: '62h 45m',
        rating: 4.9,
        numReviews: 389,
        enrolledStudents: 2180,
        featured: true,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        whatYouWillLearn: [
          'Advanced neural network architectures',
          'Natural Language Processing',
          'Computer Vision',
          'Reinforcement Learning',
          'GANs and Transformers',
          'Production ML deployment'
        ],
        requirements: ['Python proficiency', 'Basic ML knowledge', 'Linear algebra fundamentals'],
        modules: [
          { title: 'Advanced Neural Networks', lessons: [] },
          { title: 'NLP & Transformers', lessons: [] },
          { title: 'Computer Vision', lessons: [] },
          { title: 'Production ML Systems', lessons: [] }
        ]
      }
    ];

    const courses = await Course.create(coursesData);
    console.log(`Created ${courses.length} courses.`);

    // Create lessons for each course
    const sampleVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    const lessonTitles = [
      ['Introduction & Setup', 'Core Concepts', 'Building Blocks', 'Hands-On Practice', 'Advanced Patterns', 'Project Setup'],
      ['State Management', 'Component Patterns', 'API Integration', 'Error Handling', 'Performance Tips', 'Code Review'],
      ['Architecture Design', 'Implementation', 'Testing Strategies', 'Security Best Practices', 'Optimization', 'Deployment'],
      ['Final Project Part 1', 'Final Project Part 2', 'Final Project Part 3', 'Code Review', 'Best Practices', 'Course Summary']
    ];

    for (const course of courses) {
      for (let moduleIdx = 0; moduleIdx < course.modules.length; moduleIdx++) {
        const lessonsForModule = [];
        for (let lessonIdx = 0; lessonIdx < lessonTitles[moduleIdx].length; lessonIdx++) {
          const lesson = await Lesson.create({
            title: lessonTitles[moduleIdx][lessonIdx],
            videoUrl: sampleVideoUrl,
            duration: `${Math.floor(Math.random() * 20 + 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            courseId: course._id,
            moduleIndex: moduleIdx,
            order: lessonIdx,
            isFree: moduleIdx === 0 && lessonIdx === 0
          });
          lessonsForModule.push(lesson._id);
        }
        course.modules[moduleIdx].lessons = lessonsForModule;
      }
      course.totalLessons = lessonTitles.flat().length;
      await course.save();
    }
    console.log('Created lessons for all courses.');

    // Create some reviews
    const reviewTexts = [
      'Absolutely fantastic course! The instructor explains everything clearly.',
      'Great content and well-structured modules. Highly recommend!',
      'Best course I have taken on this topic. Worth every penny.',
      'Very comprehensive and practical. Learned a lot!',
      'Excellent teaching style. Projects are really helpful.'
    ];

    for (let i = 0; i < Math.min(5, courses.length); i++) {
      for (let j = 0; j < Math.min(3, users.length); j++) {
        await Review.create({
          userId: users[j]._id,
          courseId: courses[i]._id,
          rating: Math.floor(Math.random() * 2) + 4,
          comment: reviewTexts[(i + j) % reviewTexts.length]
        });
      }
    }
    console.log('Created reviews.');

    // Create some orders
    for (let i = 0; i < users.length; i++) {
      const numPurchases = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numPurchases && j < courses.length; j++) {
        await Order.create({
          userId: users[i]._id,
          courseId: courses[j]._id,
          amount: courses[j].price,
          paymentStatus: 'completed'
        });
        users[i].purchasedCourses.push(courses[j]._id);
      }
      await users[i].save();
    }
    console.log('Created orders.');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📧 Admin Login: admin@learnverse.com / admin123');
    console.log('📧 User Login: john@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
