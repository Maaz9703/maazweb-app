const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a product title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/300',
    },
    images: [{
      type: String,
    }],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    quantityDiscounts: [
      {
        minQty: {
          type: Number,
          min: 0,
        },
        discountPercent: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
