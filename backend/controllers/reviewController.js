const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * @desc    Get reviews for product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort('-createdAt');

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      data: { reviews, avgRating: Math.round(avgRating * 10) / 10 },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
  try {
    const { product, rating, comment } = req.body;

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let review = await Review.findOne({ user: req.user._id, product });
    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({ user: req.user._id, product, rating, comment });
    }

    const populated = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProductReviews, createReview, deleteReview };
