const Product = require('../models/productModels');
const AsyncAwaitError = require('../middleware/AsyncAwaitError');
const ApiFeatures = require('../utils/ApiFeatures');
const Cloudinary = require("cloudinary");
const mongoose = require("mongoose");
// Creating products by ADMIN
// exports.createProduct = async (req, res, next) => {
//   console.log("category",req.body);
//   try {
    
//     let { category } = req.body;

//     // If category is a string, parse it as JSON
//     if (typeof category === "string") {
//       try {
//         category = JSON.parse(category);
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid category format",
//         });
//       }
//     }

//     // Ensure category object is valid
//     if (!category || !category.name) {
//       return res.status(400).json({
//         success: false,
//         message: "Category name is required",
//       });
//     }

//     const img = req.uploadedImages || [];
//     let sizesWithPrices = [];

//     if (req.body.priceDetails && typeof req.body.priceDetails === "string") {
//       try {
//         sizesWithPrices = JSON.parse(req.body.priceDetails);
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid priceDetails format",
//         });
//       }
//     } else if (Array.isArray(req.body.priceDetails)) {
//       sizesWithPrices = req.body.priceDetails;
//     }

//     const result = await Product.create({
//       images: img,
//       ...req.body,
//       priceDetails: sizesWithPrices,
//       category, // Ensure category is included as an object
//     });

//     res.status(201).json({
//       success: true,
//       product: result,
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
exports.createProduct = async (req, res, next) => {
  console.log("Request", req.body);

  try {
    let { category,subcategories } = req.body;
    console.log("category,subcategories",category,subcategories)

    // Ensure category is an object and parse it if it's a string
    if (typeof category === "string") {
      try {
        category = JSON.parse(category);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid category format",
        });
      }
    }

    // Validate category structure
    if (!category || typeof category !== "object" || !category.name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

// Ensure subcategories is an array
if (!Array.isArray(subcategories)) {
  if (typeof subcategories === "string") {
    category.subcategories = subcategories.split(",").map(sub => sub.trim()); // Convert comma-separated string to array
  } else if (subcategories) {
    category.subcategories = [subcategories]; // Convert non-array values to an array
  } else {
   subcategories = []; // Default to an empty array if not provided
  }
}

    console.log("Final subcategories  structure:", subcategories);

    // Image processing (if any images were uploaded)
    const img = req.uploadedImages || [];

    // Parse priceDetails if it's a string
    let sizesWithPrices = [];
    if (req.body.priceDetails) {
      if (typeof req.body.priceDetails === "string") {
        try {
          sizesWithPrices = JSON.parse(req.body.priceDetails);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid priceDetails format",
          });
        }
      } else if (Array.isArray(req.body.priceDetails)) {
        sizesWithPrices = req.body.priceDetails;
      }
    }

    console.log("Formatted Category:", category);

    // Create product with the properly structured category
    const result = await Product.create({
      images: img,
      ...req.body,
      priceDetails: sizesWithPrices,
      category: category, // Use the correctly formatted category
    });

    res.status(201).json({
      success: true,
      product: result,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// exports.getUniqueCategories = async (req, res, next) => {
//   try {
//     // Query for products where category is a string (old format)
//     const oldCategories = await Product.distinct("category", { "category": { $type: "string" } });
    

//     // Query for products where category is an object with a name (new format)
//     const newCategories = await Product.distinct("category.name", { "category.name": { $exists: true } });
//     console.log("newCategories", newCategories); // Log new categories

//     // Combine both old and new categories
//     const combinedCategories = [...oldCategories, ...newCategories];

//     // Extract only the main category (before any '>' or '|')
//     const cleanedCategories = combinedCategories
//       .map(category => {
//         // Remove everything after '>' or '|' and trim spaces
//         const cleanedCategory = category.split(/[\|>]/)[0].trim();
//         return cleanedCategory;
//       })
//       .filter((category, index, self) => self.indexOf(category) === index); // Remove duplicates

//     console.log("cleanedCategories", cleanedCategories); // Log cleaned categories

//     if (cleanedCategories.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No categories found",
//       });
//     }

//     // Send the cleaned and unique categories in the response
//     res.status(200).json({
//       success: true,
//       category: cleanedCategories, // Send the cleaned unique categories
//     });
//   } catch (error) {
//     console.error("Error fetching categories:", error); // Log error for debugging
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

//Count unique products
exports.countUniqueProducts = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments(); 

    res.status(200).json({
      success: true,
      totalProducts,
    });
  } catch (error) {
    console.error("Error counting products:", error.message);
    res.status(500).json({
      success: false,
      message: "Error counting products",
      error: error.message,
    });
  }
};


exports.getUniqueCategories = async (req, res, next) => {
  try {
    // Fetch distinct category names (both formats)
    const oldCategories = await Product.distinct("category", { "category": { $type: "string" } });
    const newCategories = await Product.distinct("category.name", { "category.name": { $exists: true } });

    // Merge and normalize categories (convert to lowercase, trim spaces)
    const combinedCategories = [...oldCategories, ...newCategories].map(category =>
      typeof category === 'string' ? category.trim().toLowerCase() : category?.name?.trim().toLowerCase()
    ).filter(Boolean);

    // Remove duplicates
    const uniqueCategories = [...new Set(combinedCategories)];

    if (uniqueCategories.length === 0) {
      return res.status(404).json({ success: false, message: "No categories found" });
    }

    // Fetch products and build category map
    const products = await Product.find().select("category images");

    // Use Map to ensure uniqueness
    const categoryDataMap = new Map();

    products.forEach((product) => {
      // Normalize category name
      let categoryName = product.category?.name || product.category;
      categoryName = categoryName?.trim().toLowerCase();

      if (!categoryName) return;

      // Get subcategories in array format
      const subcategories = Array.isArray(product.category?.subcategories)
        ? product.category.subcategories
        : [product.category?.subcategory].filter(Boolean);

      const images = product.images || [];

      // Ensure category exists in Map
      if (!categoryDataMap.has(categoryName)) {
        categoryDataMap.set(categoryName, { images: new Set(), subcategories: new Set() });
      }

      const categoryEntry = categoryDataMap.get(categoryName);

      // Add images and subcategories uniquely
      images.forEach(image => categoryEntry.images.add(image));
      subcategories.forEach(subcategory => categoryEntry.subcategories.add(subcategory));
    });

    // Prepare final response format with subcategories in array format
    const categoriesWithSubcategories = Array.from(categoryDataMap.keys()).map(category => {
      const data = categoryDataMap.get(category);
      return {
        category,
        images: Array.from(data.images),
        subcategories: Array.from(data.subcategories) // No longer wrapping each subcategory in an object
      };
    });

    res.status(200).json({ success: true, categories: categoriesWithSubcategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Get Products with priceType 'bySize'
exports.getAllBySizeProducts = AsyncAwaitError(async (req, res) => {
  // Count only products where priceType is 'bySize'
  const productCount = await Product.countDocuments({ productType: 'bySize' });

  // Find all products where priceType is 'bySize'
  const products = await Product.find({ productType: 'bySize' });

  // Return the products and productCount in the response
  return res.status(200).json({
    success: true,
    products,
    productCount
  });
});



// Creating all products
exports.getAllProducts = AsyncAwaitError(async (req, res) => {
  try {
    const productCount = await Product.countDocuments();

    // Get page and limit from query params (defaults: page=1, limit=10)
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 32;
    const skip = (page - 1) * limit; // Skip previous pages

    // Fetch products with pagination
    const products = await Product.find().skip(skip).limit(limit);

    return res.status(200).json({
      success: true,
      products,
      productCount,
      currentPage: page,
      totalPages: Math.ceil(productCount / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// Getting the Single product details
// exports.getProductsDetails = AsyncAwaitError(async (req, res, next) => {
//   const getProduct = await Product.findById(req.params.id);

//   if (!getProduct) {
//     return res.status(500).json({
//       success: false,
//       message: "Product Details not found"
//     });
//   }

//   // If sizes are available, we check for prices based on the size
//   let sizesWithPrices = [];
//   if (getProduct.sizes && getProduct.sizes.length > 0) {
//     sizesWithPrices = getProduct.sizes.map(size => ({
//       size: size.name,
//       price: size.price
//     }));
//   }

//   res.status(200).json({
//     success: true,
//     getProduct,
//     sizesWithPrices
//   });
// });


exports.getProductsDetails = async (req, res, next) => {
  try {
    console.log("Received Product ID:", req.params.id, typeof req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Product ID" });
    }

    const getProduct = await Product.findById(req.params.id);

    if (!getProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, getProduct });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// Updating the products
exports.updateProducts = AsyncAwaitError(async (req, res, next) => {
  let updatedProduct = await Product.findById(req.params.id);

  if (!updatedProduct) {
    return res.status(500).json({
      success: false,
      message: "Product Not Found"
    });
  }

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else if (Array.isArray(req.body.images)) {
    images = req.body.images;
  }

  if (images === undefined) {
    for (let i = 0; i < updatedProduct.images.length; i++) {
      await Cloudinary.v2.uploader.destroy(updatedProduct.images[i].public_id);
    }
  }

  if (images && images.length > 0) {
    let imageLink = [];

    for (let i = 0; i < images.length; i++) {
      const result = await Cloudinary.v2.uploader.upload(images[i], {
        folder: "productsImages"
      });

      imageLink.push({
        result: result.public_id,
        url: result.secure_url
      });
    }

    req.body.images = imageLink;
  } else {
    req.body.images = [];
  }

  // Handle price and size updates
  const sizesWithPrices = req.body.sizes && req.body.sizes.length > 0 ? req.body.sizes.map(size => ({
    size: size.name,
    price: size.price
  })) : [];

  req.body.priceDetails = sizesWithPrices; // Update priceDetails field

  updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
    updatedProduct,
    sizesWithPrices: updatedProduct.priceDetails // Use priceDetails for the sizes and prices
  });
});

// Deleting the product
exports.deleteProduct = AsyncAwaitError(async (req, res, next) => {
  try {
    let deletedProduct = await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
      deletedProduct
    });
  } catch (error) {
    console.log(error);
  }
});

// Search Products by Keyword
exports.searchProduct = AsyncAwaitError(async (req, res, next) => {
  let result = await Product.find({
    "$or": [
      {
        name: { $regex: req.params.keyword },
      },
      {
        category: { $regex: req.params.keyword },
      },
      {
        description: { $regex: req.params.keyword },
      }
    ]
  });
  res.status(200).json({ success: true, result });
});

// Get Products by Category
// exports.getProductsByCategory = AsyncAwaitError(async (req, res, next) => {
//   const category = req.params.category;

//   const products = await Product.find({ category });

//   if (!products || products.length === 0) {
//     return res.status(404).json({
//       success: false,
//       message: `No products found in category: ${category}`
//     });
//   }

//   res.status(200).json({
//     success: true,
//     products
//   });
// });
// exports.getProductsByCategory = AsyncAwaitError(async (req, res, next) => {
//   const category = req.params.category;

//   // Use a regular expression to handle special characters and spaces in the category
//   const regex = new RegExp(category, 'i');  // 'i' makes it case-insensitive

//   try {
//     const products = await Product.find({ category: { $regex: regex } });

//     if (!products || products.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message:` No products found in category: ${category}`
//       });
//     }

//     res.status(200).json({
//       success: true,
//       products
//     });
//   } catch (error) {
//     next(error);  // Use next() to forward the error to the error-handling middleware
//   }
// });
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.getProductsByCategory = AsyncAwaitError(async (req, res, next) => {
  const category = req.params.category;
  
  if (!category) {
    return res.status(400).json({ success: false, message: 'Category parameter is required' });
  }

  // Escape the category string so special characters don't break the regex
  const escapedCategory = escapeRegExp(category);

  let regex;
  try {
    regex = new RegExp(`^${escapedCategory}$`, "i"); // exact, case-insensitive match
  } catch (error) {
    console.error("Error creating regex:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error: invalid regex' });
  }

  // Query for products that have the category stored either as a string
  // or as an object with a name field.
  const products = await Product.find({
    $or: [
      { "category.name": { $regex: regex } },
      { category: { $regex: regex } }
    ]
  });

  if (!products || products.length === 0) {
    return res.status(404).json({
      success: false,
      message:` No products found in category: ${category}`
    });
  }

  res.status(200).json({
    success: true,
    products
  });
});
exports.getAllCategories = AsyncAwaitError(async (req, res, next) => {
  const categories = await Product.distinct("category"); // Fetch unique categories from the database

  if (!categories || categories.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No categories found",
    });
  }

  res.status(200).json({
    success: true,
    categories, // Return the array of unique categories
  });
});
// REVIEWS GIVEN BY CUSTOMERS TO PARTICULAR PRODUCT
exports.createProductReview = AsyncAwaitError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const reviewData = {
    user: req.ourUser._id,
    name: req.ourUser.name,
    rating: Number(rating),
    comment,
  };

  try {
    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.ourUser._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.ourUser._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(reviewData);
      product.numOfReviews = product.reviews.length;
    }

    const ratings = product.reviews.map((rev) => rev.rating);
    const avg = ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
    product.productRatings = avg;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

// Get All Reviews in a Single Product
exports.getAllProductsReview = AsyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    res.status(404).json({
      message: "Product Not Found"
    });
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Reviews
exports.deleteReview = AsyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.query.ProductId);

  if (!product) {
    res.status(404).json({
      message: "Product Not Found to Delete"
    });
  }

  const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  const ratings = avg / reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(req.query.productId, {
    reviews, ratings, numOfReviews
  }, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
  });
});

// Get All Products (ADMIN)
exports.getAdminProducts = AsyncAwaitError(async (req, res) => {

  
  const products = await Product.find();

  res.status(201).json({
    success: true,
    products,
  });
});