const app = require('./app');
const DatabaseConnection = require('./config/database');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const uploadSingleImageToCloudinary = require('./middleware/img');
const schema = require("./models/bannerModel");

const contactRoute = require("./routes/contactUsRoute");
const multer = require("multer");

dotenv.config(); // Load the .env file from the root directory

// Database Connection
DatabaseConnection();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// Multer config for file upload (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Start the server
const mainServer = app.listen(process.env.PORT, () => {
    console.log(`SERVER IS RUNNING on http://localhost:${process.env.PORT}`);
});

// Routes
app.post("/api/v1/banner", upload.single('image1'), uploadSingleImageToCloudinary, async (req, res) => {
    try {
        const img = req.uploadedImageUrl;
        const data = await schema.create({
            image1: img.url,
            ...req.body
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error creating banner", error: error.message });
    }
});

app.get("/api/v1/banner", async (req, res) => {
    try {
        const data = await schema.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching banners", error: error.message });
    }
});

app.delete("/api/v1/banner/:id", async (req, res) => {
    try {
        const data = await schema.findByIdAndDelete(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error deleting banner", error: error.message });
    }
});

// Use Contact Us Routes
app.use("/api/v1", contactRoute);


// Unhandled Promise Rejection handling
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    mainServer.close(() => process.exit(1));
});
