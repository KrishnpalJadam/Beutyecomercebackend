const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwtToken = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    default: "user",
  },
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name can't Exceed 30 Characters"],
    minLength: [3, "Name Should have more than 4 Characters"],
  },
  email: {
    type: String,
    required: [true, "Enter Your Email Address"],
    unique: true,
    validate: [validator.isEmail, "Please Enter A Valid Email Address"],
  },
  password: {
    type: String,
    required: [true, "Enter Your Password"],
    minLength: [8, "Password should be greater than 8 Characters"],
    select: false, 
  },
  avtar: {
    url: {
      type: String,
      required: true,
    },
  },
  mobile: {
    type: String,
    required: [true, "Please Enter Your Mobile Number"],
    unique: true, 
    validate: [
      {
        validator: function (value) {
          return validator.isMobilePhone(value, "any", { strictMode: false });
        },
        message: "Please Enter A Valid Mobile Number",
      },
    ],
  },
  address: {
    address: {
      type: String,
      // required: true
    },
    city: {
      type: String,
      // required: true
    },
    state: {
      type: String,
      // required: true
    },
    country: {
      type: String,
      // required: true
    },
    pinCode: {
      type: Number,
      // required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetpasswordToken: String,
  resetpasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTTOKEN = function () {
  return jwtToken.sign({ id: this._id }, "Kuch Bhi", {
    expiresIn: "100d",
  });
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetpasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetpasswordExpire = Date.now() + 15*60*1000;

  return resetToken; 
};

module.exports = mongoose.model("User", userSchema);