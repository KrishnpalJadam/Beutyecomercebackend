const mongoose = require("mongoose");

const mobileotpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    //expires: 3000, // OTP expires in 5 minutes
  },
});

module.exports = mongoose.model("MOBILEOTP", mobileotpSchema);