const express = require("express");
const { countTotalUsers, registerUser,resetPassword, loginUser,sendotp, logOut, forgetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getAUsers, updateUser, DeleteUsers } = require("../controllers/userController");
const {AuthenticateTheUserss, AuthenticateTheUser, AuthorizedPerson } = require("../middleware/AuthenticateTheUser");
const router = express.Router();
const multer = require("multer"); // For handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadSingleImageToCloudinary = require("../middleware/img");


router.post("/register", upload.single('avtar'), uploadSingleImageToCloudinary, registerUser)
router.route('/login').post(loginUser);
router.route('/logout').get(logOut);
router.route('/password/forget').post(forgetPassword);
router.route('/password/reset').post(resetPassword);
router.route('/me').post(AuthenticateTheUserss, getUserDetails);
router.route('/sendotp').post( sendotp);
router.route('/password/update').put(AuthenticateTheUserss, updatePassword);
// router.route('/me/update').put(AuthenticateTheUserss, updateProfile);
router.put("/me/update", AuthenticateTheUser, upload.single("avtar"), uploadSingleImageToCloudinary, updateProfile);
router.route('/admin/user').get(AuthenticateTheUserss, AuthorizedPerson("admin"), getAllUsers);
//count toatal user
router.route('/admin/countUser').get(AuthenticateTheUserss, AuthorizedPerson("admin"), countTotalUsers);
router.route('/admin/user/:id').get(AuthenticateTheUserss, AuthorizedPerson("admin"), getAUsers).delete(AuthenticateTheUserss, AuthorizedPerson("admin"),DeleteUsers);
router.route('/admin/user/:id').put(AuthenticateTheUserss, AuthorizedPerson("admin"),updateUser);

module.exports = router;
