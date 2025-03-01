const AsyncAwaitError = require("./AsyncAwaitError");
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const { log } = require("node:console");

// exports.AuthenticateTheUser = AsyncAwaitError(async (req, res, next) => {
    
//     // const authHeader = req.headers.authorization;
//     const authHeader = req.headers;

//     if (!authHeader) {
//         return next(res.json({
//             success: false,
//             message: "Please Login/Register to Shop Your Favorite Products 👻",
//         }));
//     }

//     const token = authHeader.split(' ')[1];
//     try {
//         const decodedData = jwt.verify(token, "Kuch Bhi");

//         req.ourUser = await User.findById(decodedData.id);
//         next();
//     } catch (error) {
//         return next(res.json({
//             success: false,
//             message: "Invalid token or token has expired."
//         }));
//     }
// });

exports.AuthenticateTheUser = AsyncAwaitError(async (req, res, next) => {
    const authHeader = req.headers.authorization;
console.log("authHeader",authHeader);

    if (!authHeader) {
        return next(res.json({
            success: false,
            message: "Please Login/Register to Shop Your Favorite Products 👻",
        }));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedData = jwt.verify(token, "Kuch Bhi");

        req.ourUser = await User.findById(decodedData.id);
        next();
    } catch (error) {
        return next(res.json({
            success: false,
            message: "Invalid token or token has expired."
        }));
    }
});
exports.AuthenticateTheUserss = AsyncAwaitError(async (req, res, next) => {
    const authHeader = req.headers.token;


console.log("authHeader",authHeader);

    if (!authHeader) {
        return next(res.json({
            success: false,
            message: "Please Login/Register to Shop Your Favorite Products 👻",
        }));
    }

    
    const token = authHeader.split(' ')[1];


    try {
        const decodedData = jwt.verify(authHeader, "Kuch Bhi");



        req.ourUser = await User.findById(decodedData.id);

        
        next();
    } catch (error) {
        console.log("error",error);
        
        return next(res.json({
            success: false,
            message: "Invalid token or token has expired."
        }));
    }
});


exports.AuthorizedPerson = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.ourUser.role)) {
            return next(res.status(403).json({
                success: false,
                message: `Role: ${req.ourUser.role} isn't allowed to access this resource`
            }))
        }
        next();
    };
};
