require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { initSheet } = require('./config/googleSheets');

const setup = async () => {
  try {
    const doc = await initSheet();
    
    const requiredSheets = [
      {
        title: 'Users',
        headerValues: ['id', 'name', 'email', 'password', 'role', 'avatar', 'bio', 'wishlist', 'purchasedCourses', 'createdAt']
      },
      {
        title: 'Courses',
        headerValues: ['id', 'title', 'description', 'shortDescription', 'price', 'category', 'thumbnail', 'instructor', 'level', 'language', 'featured', 'published', 'rating', 'numReviews', 'enrolledStudents', 'whatYouWillLearn', 'requirements', 'modules', 'createdAt']
      },
      {
        title: 'Lessons',
        headerValues: ['id', 'title', 'videoUrl', 'duration', 'moduleId', 'courseId', 'createdAt']
      },
      {
        title: 'Orders',
        headerValues: ['id', 'userId', 'courseId', 'amount', 'createdAt']
      },
      {
        title: 'Reviews',
        headerValues: ['id', 'userId', 'courseId', 'rating', 'comment', 'createdAt']
      },
      {
        title: 'Progress',
        headerValues: ['id', 'userId', 'courseId', 'completedLessons', 'progressPercent', 'createdAt']
      }
    ];

    for (const sheetInfo of requiredSheets) {
      const sheet = doc.sheetsByTitle[sheetInfo.title];
      if (!sheet) {
        console.log(`Creating sheet: ${sheetInfo.title}`);
        await doc.addSheet({
          title: sheetInfo.title,
          headerValues: sheetInfo.headerValues
        });
      } else {
        console.log(`Sheet exists: ${sheetInfo.title}`);
        await sheet.setHeaderRow(sheetInfo.headerValues);
      }
    }

    console.log('✅ Google Sheets Initialization Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing sheets:', error);
    process.exit(1);
  }
};

setup();
