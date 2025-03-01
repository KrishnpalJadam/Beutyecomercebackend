const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/AsyncAwaitError");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const fileUploader = require("express-fileupload");
const cors = require('cors');
const dotenv = require("dotenv")
const path = require("path")


dotenv.config({ path: "backend/config/config.env" });
// uu
app.use(cors())
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(fileUploader()); 
app.get("/api/data", (req, res) => {
    res.json(Date.now())
})

// app.use(fileUploader());
// app.use(express.static(path.join(__dirname, "../frontend/build")))

// app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"))
// })

app.get("/get", (req, res) => {
    res.send("hello URL working")
})
// const corsOptions = {
//     origin: 'http://localhost:3000',
//     // 'Content-Type': 'Authorization',
//     credentials: true,
//     optionSuccessStatus: 200
// }

// app.use(cors(corsOptions));
// All Routes Imported
const product = require("./routes/productRoute");
const user = require("./routes/userRoutes");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");
const contact = require('./routes/contactUsRoute');
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
app.use('/api/v1', contact);

// Middleware for Errors

module.exports = app;
// const express = require("express");
// const app = express();
// const errorMiddleware = require("./middleware/AsyncAwaitError");
// const cookieParser = require("cookie-parser");
// const cors = require('cors');
// const dotenv = require("dotenv");
// const path = require("path");
// const fileUploader = require("express-fileupload"); // Add this for handling file uploads
// const bodyParser = require("body-parser");

// dotenv.config({ path: "backend/config/config.env" });

// app.use(cors());
// app.use(express.json());  // Use express.json() for parsing JSON bodies
// app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));  // For parsing URL-encoded data (form data)
// app.use(bodyParser.json({ limit: '50mb' })); // To support large JSON payloads
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // For large form-data
// app.use(fileUploader());  // Add this middleware for file uploads

// app.get("/api/data", (req, res) => {
//     res.json(Date.now());
// });

// app.get("/get", (req, res) => {
//     res.send("hello URL working");
// });

// // Routes
// const product = require("./routes/productRoute");
// const user = require("./routes/userRoutes");
// const order = require("./routes/orderRoute");
// const payment = require("./routes/paymentRoute");
// const contact = require('./routes/contactUsRoute');

// app.use("/api/v1", product);
// app.use("/api/v1", user);
// app.use("/api/v1", order);
// app.use("/api/v1", payment);
// app.use('/api/v1', contact);

// module.exports = app;