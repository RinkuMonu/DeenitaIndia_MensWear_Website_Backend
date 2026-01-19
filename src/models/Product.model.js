import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    referenceWebsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Websitelist",
      // required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    color: {
      type: [String],
      required: true,
    },
    occasion: {
      type: String,
      enum: ["Formal", "Casual", "Party", "Sports", "Ethnic"],
      trim: true,
    },
    fit: {
      type: String, 
      enum: ["Slim Fit", "Regular Fit", "Loose Fit", "Skinny"],
      trim: true,
    },
    season: {
      type: String,
      enum: ["Summer", "Winter", "All Season"],
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String], 
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive value"],
    },
    actualPrice: {
      type: Number,
      min: [0, "Price must be a positive value"],
      default: 0,
    },
    material: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    size: [
      {
        sizes: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          min: [0, "Price must be a positive value"],
        },
        colors: { type: [String], default: [] }
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    dealOfTheDay: {
      type: Boolean,
      default: false,
    },
    dealActivatedAt: {
      type: Date,
      default: null,
    },
    dealExpiresAt: {
      type: Date,
      default: null,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);
productSchema.index({
  productName: "text",
  description: "text",
});

const Product = mongoose.model("Product", productSchema);

export default Product;
