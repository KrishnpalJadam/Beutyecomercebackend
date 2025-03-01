const AsyncAwaitError = require('../middleware/AsyncAwaitError');
const User = require('../models/userModels');
const OTP = require('../models/ForgetOtpModel');
const MOBILEOTP = require('../models/optformobilemodel');
const tokenEase = require('../utils/tokenEase');
const sendMail = require('../utils/sendMail');
const Cloudinary = require('cloudinary');
const bcrypt = require('bcryptjs');
const axios =require('axios');
const mongoose = require("mongoose");

// Register A User`
exports.registerUser = AsyncAwaitError(async (req, res, next) => {
    try {
        const img = req.uploadedImageUrl
        const data = await User.create(
            {
                avtar: img,
                ...req.body
            }
        )
        tokenEase(data, 201, res);

    } catch (error) {
        res.status(404).json(error.message)
    }
})


//count total users
exports.countTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments(); // Count total users

        res.status(200).json({
            success: true,
            totalUsers,
        });
    } catch (error) {
        console.error("Error counting users:", error.message);
        res.status(500).json({
            success: false,
            message: "Error counting users",
            error: error.message,
        });
    }
};

// Register A User`
// exports.registerUser = AsyncAwaitError(async (req, res, next) => {
//     const { name, email, password } = req.body;

//     const myCloud = await Cloudinary.v2.uploader.upload(req.body.avatar, {
//         folder: "ProfileImages",
//         width: 150,
//         crop: "scale"
//     })
//     const ourUser = await User.create({
//         name, email, password,
//         profilepicture: {
//             public_id: myCloud.public_id,
//             url: myCloud.secure_url
//         }
//     });

//     // getting the secret Token
//     tokenEase(ourUser, 201, res);
// })

// Login Users
exports.loginUser = AsyncAwaitError(async (req, res, next) => {
    const { email, password } = req.body;

    // Checking if the user have the correct email and password or not
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please Enter Correct Email and Password"
        })
    }
    //else Finding the User In Database 
    const findUser = await User.findOne({ email }).select("+password");

    if (!findUser) {
        return res.status(401).json({
            success: false,
            message: "Invalid Email and Password"
        })
    }

    // Knowing the password is matched or not
    const isPasswordMatched = await findUser.comparePassword(password);

    if (!isPasswordMatched) {
        return res.status(401).json({
            success: false,
            message: "Invalid Email and Password"
        })
    }

    tokenEase(findUser, 200, res);
});


// Logout User
exports.logOut = AsyncAwaitError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "User Logged Out"
    });
})


// Forget Password

// exports.forgetPassword = AsyncAwaitError(async (req, res, next) => {
//     try {
//         // Find user by email
//         const forgetUser = await User.findOne({ email: req.body.email });

//         // If user is not found, return error
//         if (!forgetUser) {
//             return next(new Error("User Not Found", { statusCode: 404 }));
//         }

//         // Generate password reset token
//         const resetToken = forgetUser.getResetPasswordToken();

//         // Save the user document with the reset password token and expiration time
//         await forgetUser.save({ validateBeforeSave: false });

//         // Dynamically decide protocol (http or https based on environment)
//         const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
//         const resetPasswordURL = `${protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

//         // Log the full reset password URL (for debugging)
//         console.log("Reset Password URL:", resetPasswordURL);

//         // Construct the message to send in the email
//         const mailMessage =` Your Password Reset Link is: ${resetPasswordURL} \n\n If you did not request this, please ignore this email.`;

//         // Send the email with the reset password URL
//         await sendMail({
//             email: forgetUser.email,
//             subject:` E-commerce Website Password Recovery Mail`,
//             message: mailMessage,  // This message contains the reset password link
//         });

//         // Return success response
//         res.status(200).json({
//             success: true,
//             message: `Mail has been sent to ${forgetUser.email} successfully`,
//         });
//     } catch (error) {
//         // In case of error, clear the reset password token and expiration fields
//         if (forgetUser) {
//             forgetUser.resetpasswordToken = undefined;
//             forgetUser.resetpasswordExpire = undefined;
//             await forgetUser.save({ validateBeforeSave: false });
//         }

//         // Return error response
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// });
exports.forgetPassword = AsyncAwaitError(async (req, res, next) => {
    console.log("req => ", req.body);
    console.log("for pjsdtgfsdjiofgjasd[oifg[oijsdfg[ojsd[ofisd[oijg[oisjdfg[oijsdgoifjmnsdfoijgdsf[oj g");
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
        { email },
        { otp: otpCode, createdAt: Date.now() },
        { upsert: true, new: true }
    );
    await sendMail({ email, subject: "Password Reset OTP", message: `Your OTP: ${otpCode}. Valid for 5 minutes.` });
    res.status(200).json({ success: true, message: "OTP sent successfully" });
});
exports.sendotp = AsyncAwaitError(async (req, res, next) => {
    console.log(req.body);
    
    try {
        
      console.log("Request received: ", req.body);
        const { mobile } = req.body.mobile;
        if (!mobile) {  
            return res.status(400).json({ success: false, message: "Mobile number is required" });
        }

        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with expiry (5 minutes)
        await MOBILEOTP.findOneAndUpdate(
            { mobile },
            { otp: otpCode, createdAt: Date.now(), expiresAt: Date.now() + 5 * 60 * 1000 }, // Expires in 5 minutes
            { upsert: true, new: true }
        );

        // Send OTP via SMS using Fast2SMS
        const FAST2SMS_API = process.env.FAST2SMS_API_KEY;
        const smsResponse = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
            params: {
                authorization: FAST2SMS_API,
                route: "otp",
                variables_values: otpCode,
                numbers: mobile,
                flash: 0,
            },
            headers: {
                "Content-Type": "application/json",
            },
        });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            smsResponse: smsResponse.data,
        });

    } catch (error) {
        console.error("Error in sendotp:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// exports.sendotp = AsyncAwaitError(async (req, res, next) => {
//     console.log("Request Body:", req.body);

//     try {
//         const { mobile } = req.body;
        
//         // Validate mobile number
//         if (!mobile) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Mobile number is required" 
//             });
//         }

//         // Additional mobile number validation
//         const mobileRegex = /^[0-9]{10}$/;
//         if (!mobileRegex.test(mobile)) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Invalid mobile number format. Must be 10 digits" 
//             });
//         }

//         console.log("Extracted Mobile:", mobile);

//         // Generate 6-digit OTP
//         const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

//         // Update or create OTP record
//         const otpRecord = await MOBILEOTP.findOneAndUpdate(
//             { mobile },
//             { 
//                 otp: otpCode, 
//                 createdAt: Date.now(), 
//                 expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes expiration
//             },
//             { 
//                 upsert: true, 
//                 new: true 
//             }
//         );

//         const FAST2SMS_API = process.env.FAST2SMS_API_KEY;
//         if (!FAST2SMS_API) {
//             return res.status(500).json({ 
//                 success: false, 
//                 message: "SMS configuration error" 
//             });
//         }

//         // Send OTP via Fast2SMS
//         const smsResponse = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
//             params: {
//                 authorization: FAST2SMS_API,
//                 route: "otp",
//                 variables_values: otpCode,
//                 numbers: mobile,
//                 flash: 0,
//             },
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             timeout: 5000 // Add timeout to prevent hanging
//         });

//         return res.status(200).json({
//             success: true,
//             message: "OTP sent successfully",
//             data: {
//                 smsResponse: smsResponse.data,
//                 otpId: otpRecord._id
//             }
//         });

//     } catch (error) {
//         console.error("Error in sendotp:", error.message, error.stack);
        
//         // Handle specific errors
//         if (error.response) {
//             // Handle API-specific errors
//             return res.status(502).json({
//                 success: false,
//                 message: "Failed to send OTP via SMS provider",
//                 error: error.response.data
//             });
//         }

//         return res.status(500).json({ 
//             success: false, 
//             message: "Internal server error",
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });
exports.resetPassword = AsyncAwaitError(async (req, res, next) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        console.log("request", req.body);

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match." });
        }

        // Find OTP in the database
        const otpRecord = await OTP.findOne({ otp, email }); // ✅ Fix: Find single record
        console.log("otpRecord", otpRecord);

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }

        // Find the user and update the password
        const user = await User.findOne({ email });
        console.log("user", user);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });  // ✅ Fix: Skip required fields validation

        // Delete OTP after successful password reset
        await OTP.deleteOne({ email });

        res.status(200).json({ success: true, message: "Password reset successful." });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});;

// exports.resetPassword = AsyncAwaitError(async (req, res, next) => {
//     console.log("req => ",req.body);
//     console.log("pjsdtgfsdjiofgjasd[oifg[oijsdfg[ojsd[ofisd[oijg[oisjdfg[oijsdgoifjmnsdfoijgdsf[oj g");


//     try {
//         const { email, otp, newPassword, confirmPassword } = req.body;
//         console.log("request", req.body);

//         if (!email || !otp || !newPassword || !confirmPassword) {
//             return res.status(400).json({ success: false, message: "All fields are required." });
//         }

//         if (newPassword.length < 8) {
//             return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
//         }

//         if (newPassword !== confirmPassword) {
//             return res.status(400).json({ success: false, message: "Passwords do not match." });
//         }

//         // Find OTP in the database
//         const otpRecord = await OTP.find({ otp });


//         if (!otpRecord) { // OTP valid for 5 min
//             return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
//         }

//         // Find the user and update the password
//         const user = await User.findOne({ email });
//         console.log("user", user);

//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found." });
//         }

//         user.password = newPassword;
//         await user.save();  // This will now work if user is a Mongoose document

//         // Delete OTP after successful password reset
//        /* await OTP.deleteOne({ email });*/

//         res.status(200).json({ success: true, message: "Password reset successful." });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// });
// exports.resetPassword = AsyncAwaitError(async (req, res, next) => {
//     try {
//         console.log("Request Params:", req.params);  // Debug log

//         // Extract token (ensure it's named correctly)
//         const resetToken = req.params.resetToken;

//         if (!resetToken || resetToken.startsWith(":")) {
//             console.error("❌ Error: Reset token is missing or invalid.");
//             return res.status(400).json({
//                 success: false,
//                 message: "Reset token is missing in the URL.",
//             });
//         }

//         console.log("Received Reset Token:", resetToken);

//         // Hash the token to compare with the stored hash
//         const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

//         // Find the user by the hashed token
//         const user = await User.findOne({
//             resetpasswordToken: hashedToken,
//             resetpasswordExpire: { $gt: Date.now() },
//         });

//         if (!user) {
//             console.error("❌ Error: Invalid or expired token.");
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid or expired token.",
//             });
//         }

//         // Validate password
//         if (!req.body.password || req.body.password.length < 8) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Password must be at least 8 characters long.",
//             });
//         }

//         // Update password
//         user.password = req.body.password;
//         user.resetpasswordToken = undefined;
//         user.resetpasswordExpire = undefined;

//         // Save changes
//         await user.save();

//         console.log("✅ Password reset successful.");
//         res.status(200).json({
//             success: true,
//             message: "Password has been reset successfully.",
//         });
//     } catch (error) {
//         console.error("❌ Server Error:", error);
//         res.status(500).json({
//             success: false,
//             message: "An error occurred while resetting the password.",
//         });
//     }
// });
// Get User from Details for Updating Profile
exports.getUserDetails = AsyncAwaitError(async (req, res, next) => {
    const profileUser = await User.findById(req.ourUser.id)

    res.status(200).json({
        success: true,
        profileUser,
    })
});

// Update User Password for Updating Profile
exports.updatePassword = AsyncAwaitError(async (req, res, next) => {
    const user = await User.findById(req.ourUser.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return res.status(400).json({
            success: false,
            message: "Old Password is Incorrect"
        })
    }

    if (req.body.newPassword != req.body.confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Password is not Matching"
        })
    }

    user.password = req.body.newPassword;
    await user.save();

    tokenEase(user, 200, res);

});

// Update User Profile
exports.updateProfile = async (req, res) => {
    console.log("Request is", req.body)
    try {
        const userId = req.ourUser.id; // Use req.ourUser from authentication middleware

        // Fetch the user
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Extract fields to update
        const { name, mobile, address, city, state, country, pinCode } = req.body;

        // Handle avatar upload (if provided)
        // if (req.file) {
        //     user.avatar = req.file.path; // Ensure this matches your schema
        // }

        // Update user details
        if (name) user.name = name;

        if (mobile) user.mobile = mobile;

        if (address || city || state || country || pinCode) {
            user.address = {
                address: address || user.address.address,
                city: city || user.address.city,
                state: state || user.address.state,
                country: country || user.address.country,
                pinCode: pinCode || user.address.pinCode,
            };
        }



        // Save updated user details
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Below Logic is for ADMIN Only

// Get all Users --ADMIN
exports.getAllUsers = AsyncAwaitError(async (req, res, next) => {


    const getUser = await User.find();


    res.status(200).json({
        success: true,
        getUser
    });
});

// Get single Users --ADMIN
exports.getAUsers = AsyncAwaitError(async (req, res, next) => {
    const getUser = await User.findById(req.params.id);

    if (!getUser) {
        res.json({
            message: `User doesn't Exist with ID: ${req.params.id}`
        });
    }
    res.status(200).json({
        success: true,
        getUser
    });
});

// Update User Profile - ADMIN
exports.updateUser = AsyncAwaitError(async (req, res, next) => {


    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    if (!newUserData) {
        res.json({
            message: `User doesn't Exist Show Can't Update`
        });
    }



    const updatedUser = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        updatedUser
    });
});

// Deleting the User -ADMIN
exports.DeleteUsers = AsyncAwaitError(async (req, res, next) => {


    // Fetch the user by ID
    const user = await User.findById(req.params.id);


    if (!user) {
        return res.status(404).json({
            success: false,
            message: `User doesn't exist with ID: ${req.params.id}`,
        });
    }

    // Extract the Cloudinary image ID from the user's avatar URL
    const imageUrl = user.avtar.url;
    const imageId = imageUrl.split('/').pop().split('.')[0]; // Extracting image ID from URL

    // Delete the user's profile picture from Cloudinary
    await Cloudinary.v2.uploader.destroy(imageId);

    // Remove the user from the database
    await user.remove();

    // Send a success response
    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
        user, // Optionally include the deleted user's data
    });
});
