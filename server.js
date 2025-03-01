const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const axios = require("axios"); // To fetch the image from URL
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dp312afar',
  api_key: '377952276627195',
  api_secret: 'xT2w13WCt2OTY7qbytNEOAo1Zr4',
});

// Middleware to parse JSON
app.use(express.json());

// Helper function to upload image from URL to Cloudinary
const uploadImageFromUrl = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // Upload the image to Cloudinary
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(response.data);
    });
  } catch (error) {
    console.error("Error uploading image from URL:", error);
    throw new Error("Failed to upload image from URL");
  }
};

// API to handle product creation with image URL
app.post("/upload-product-image", async (req, res) => {
  try {
    const { imageUrl } = req.body; // Extract image URL from request body

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required!" });
    }

    // Upload the image to Cloudinary
    const uploadResult = await uploadImageFromUrl(imageUrl);

    res.status(200).json({
      message: "Image uploaded successfully",
      fileUrl: uploadResult.secure_url, // Cloudinary image URL
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
