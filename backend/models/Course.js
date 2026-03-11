const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters'],
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Please provide a course price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide a course category'],
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'Design', 'Business', 'Marketing', 'Photography', 'Music', 'Other']
  },
  thumbnail: {
    type: String,
    default: '/uploads/default-course.jpg'
  },
  instructor: {
    type: String,
    required: [true, 'Please provide an instructor name']
  },
  instructorAvatar: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  language: {
    type: String,
    default: 'English'
  },
  totalDuration: {
    type: String,
    default: '0h 0m'
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  enrolledStudents: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: true
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    lessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }]
  }],
  whatYouWillLearn: [{
    type: String
  }],
  requirements: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for search
courseSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Course', courseSchema);
