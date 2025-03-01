const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "de1s1o9xc",
    api_key: "787335565981221",
    api_secret: "NwuREaqQyJp06D4sQMiCzz7DSCM",
});

const uploadSingleImageToCloudinary = async (req, res, next) => {
    try {
        if (req.file) {
            const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(dataUrl);
            req.uploadedImageUrl = {
                url: result.secure_url,
            };
        }
        // If no file is uploaded, proceed without uploading to Cloudinary.
        next();
    } catch (error) {
        res.status(500).json({ message: "File was not uploaded in backend", error: error.message });
    }
};

module.exports = uploadSingleImageToCloudinary;
