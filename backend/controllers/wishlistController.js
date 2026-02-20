const Wishlist = require('../models/Wishlist');

/**
 * @desc    Get user wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'products',
      'title price image category'
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json({ success: true, data: wishlist.products });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({ success: false, message: 'Product already in wishlist' });
      }
      wishlist.products.push(productId);
      await wishlist.save();
    }

    wishlist = await Wishlist.findById(wishlist._id).populate(
      'products',
      'title price image category'
    );

    res.json({ success: true, data: wishlist.products });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== req.params.productId
    );
    await wishlist.save();

    const updated = await Wishlist.findById(wishlist._id).populate(
      'products',
      'title price image category'
    );

    res.json({ success: true, data: updated.products });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
