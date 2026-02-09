import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  referenceWebsite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Websitelist",
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
  },
  address: {
    type: String,
  },

  otp: {
  type: String,
  default: null,
},
otpExpiresAt: {
  type: Date,
  default: null,
},
mobileVerified: {
  type: Boolean,
  default: false,
},

password: {
  type: String,
  required: function () {
    return !this.googleId;
  },
},
  role: {
    type: String,
    default: "user",
  },
  company: {
    type: String,
    default: ""
  },
  gstInNumber: {
    type: String,
    default: ""
  },
  isRequestedForVendor: {
    type: Boolean,
    default: false
  },
  commissionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  wallet: {
    type: Number,
    default: 0,
  },
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: "" },
},
  { timestamps: true }
);

// Method to create an access token
userSchema.methods.createAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role, referenceWebsite: this.referenceWebsite },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );
};

// Method to create a refresh token
userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role, referenceWebsite: this.referenceWebsite },
    process.env.REFRESH_SECRET_KEY,
    { expiresIn: "7d" }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
