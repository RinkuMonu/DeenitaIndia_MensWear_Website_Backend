import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    referenceWebsite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Websitelist",
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, 
    },
    logo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;