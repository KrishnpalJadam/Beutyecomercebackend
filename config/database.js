const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const DatabaseConnection = () => {
  mongoose
    .connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 sec
      socketTimeoutMS: 45000, // Increase socket timeout
    })
    .then((data) => {
      console.log(`MongoDB Connected with ${data.connection.host}`);
    });
};
module.exports = DatabaseConnection;
