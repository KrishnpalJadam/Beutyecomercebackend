const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    name: {
      type: String, // Main category name
      required: true, // Category name is required
    },
    subcategories: [
      {
        type: String, // Array of subcategories
        required: false, // Subcategories are optional
      },
    ],
  },
  tax: {
    type: String,
    required: false,
  },
  taxstatus: {
    type: String,
    required: false,
  },
  stock: {
    type: Number,
    maxLength: [100, "Stock Limit Full"],
    default: 1,
  },
  images: {
    type: Array,
    default: [],
  },
  price: {
    type: Number,
    required: false,
  },
  priceDetails: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  productType: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  productRatings: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      rating: {
        type: Number,
        required: false,
      },
      comment: {
        type: String,
        required: false,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);