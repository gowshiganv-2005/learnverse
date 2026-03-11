const { randomUUID: uuidv4 } = require('crypto');
const { getAllRows, findRow, addRow, deleteRow, updateRow } = require('../config/googleSheets');

// Helper to parse review
const parseReview = async (review) => {
  if (!review) return null;
  const parsed = { ...review };
  parsed._id = review.id;
  parsed.rating = Number(review.rating);
  
  const userRow = await findRow('Users', r => r.get('id') === review.userId);
  if (userRow) {
    const u = userRow.toObject();
    parsed.userId = { _id: u.id, name: u.name, avatar: u.avatar };
  }
  return parsed;
};

// @desc    Get reviews for a course
// @route   GET /api/reviews/course/:courseId
exports.getCourseReviews = async (req, res) => {
  try {
    let reviews = await getAllRows('Reviews');
    reviews = reviews.filter(r => r.courseId === req.params.courseId);
    
    const populatedReviews = await Promise.all(reviews.map(parseReview));
    res.json({ success: true, reviews: populatedReviews.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create review
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    // Check if user already reviewed
    const existing = await findRow('Reviews', r => r.get('userId') === req.user.id && r.get('courseId') === courseId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this course' });
    }

    const reviewData = {
      id: uuidv4(),
      userId: req.user.id,
      courseId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    await addRow('Reviews', reviewData);

    // Update course average rating (simple logic)
    const allCourseReviews = (await getAllRows('Reviews')).filter(r => r.courseId === courseId);
    const avgRating = allCourseReviews.reduce((sum, r) => sum + Number(r.rating), 0) / allCourseReviews.length;
    
    await updateRow('Courses', r => r.get('id') === courseId, {
      rating: avgRating.toFixed(1),
      numReviews: allCourseReviews.length
    });

    res.status(201).json({ success: true, review: await parseReview(reviewData) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const reviewRow = await findRow('Reviews', r => r.get('id') === req.params.id);
    if (!reviewRow) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const review = reviewRow.toObject();

    // Only the author or admin can delete
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await reviewRow.delete();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
