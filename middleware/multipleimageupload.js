const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "dfporfl8y",
    api_key: "244749221557343",
    api_secret: "jDkVlzvkhHjb81EvaLjYgtNtKsY",
});

const uploadCloudinary = async (req, res, next) => {
    try {
        // Check if files exist
        if (!req.files || req.files.length === 0) {
            return res.status(400).json('No files were uploaded');
        }

        const uploadedImages = [];

        // Iterate over files and upload them to Cloudinary
        for (const file of req.files) {
            // Create a base64 string (you can also use file.path if you're saving files locally)
            const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(dataUrl);
            uploadedImages.push(result.secure_url);  // Store the image URL
        }

        // Add uploaded images to the request object for the next middleware/controller
        req.uploadedImages = uploadedImages;

        // Continue to the next middleware/controller
        next();
    } catch (error) {
        // Catch and return any errors
        res.status(500).json({ message: "File upload failed", error: error.message });
    }
};

module.exports = uploadCloudinary;
