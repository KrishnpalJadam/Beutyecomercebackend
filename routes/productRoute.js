const express = require('express');
const multer = require("multer"); // For handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {countUniqueProducts, getAllProducts,getUniqueCategories, getAllBySizeProducts,getProductsByCategory,createProduct, updateProducts, deleteProduct, getProductsDetails, createProductReview, getAllProductsReview, deleteReview, searchProduct, getAdminProducts } = require('../controllers/productController');
const { AuthenticateTheUser,AuthenticateTheUserss, AuthorizedPerson } = require('../middleware/AuthenticateTheUser');

// const { getAllProducts, getProductsByCategory,createProduct, updateProducts, deleteProduct, getProductsDetails, createProductReview, getAllProductsReview, deleteReview, searchProduct, getAdminProducts } = require('../controllers/productController');
// const { AuthenticateTheUser, AuthorizedPerson } = require('../middleware/AuthenticateTheUser');

const uploadCloudinary = require('../middleware/multipleimageupload');

const router = express.Router();

// For Getting the Products
router.route("/products").get(getAllProducts);

router.route("/product/:id").get(getProductsDetails);
router.route("/products/bySize").get(getAllBySizeProducts);
router.route("/allcategory").get(getUniqueCategories);
router.route("/category/:category").get(getProductsByCategory);
// router.route("/category").get(getAllCategories);

router.route("/product/new").post(upload.array("images", 20), uploadCloudinary, createProduct);
// Get All Products by ADMIN
router.route("/category/:category").get(getProductsByCategory);
router.route("/productsbysize").get(getAllBySizeProducts);
router.route("/admin/all-products").get(AuthenticateTheUserss, AuthorizedPerson("admin"), getAdminProducts);

router.route("/admin/countProduct").get(AuthenticateTheUserss, AuthorizedPerson("admin"), countUniqueProducts);

// Update ,Delete and getting the products details by ADMIN
router.route("/admin/product/:id").put(AuthenticateTheUserss, AuthorizedPerson("admin"), updateProducts).delete(AuthenticateTheUserss, deleteProduct);

// For Creating the Reviews and Updating Existed Reviews by ADMIN
router.route("/review").post(AuthenticateTheUserss, createProductReview);

router.route("/admin/reviews/:id").get(AuthenticateTheUserss, AuthorizedPerson("admin"), getAllProductsReview).delete(AuthenticateTheUserss, AuthorizedPerson("admin"), deleteReview);
// Search the products
router.route("/product/search/:keyword").get(searchProduct);

module.exports = router;