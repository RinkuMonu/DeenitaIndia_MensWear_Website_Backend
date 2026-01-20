import ReviewModel from "../models/Review.model.js";
import Order from "../models/Order.model.js";

export const createReview = async (req, res) => {
  const { rating, comment, images } = req.body; // Frontend se image URLs aayenge
  const { referenceWebsite } = req.query;
  const productId = req.params.productId;

  try {
    // 1. Check purchase (Aapka existing logic sahi hai)
    const hasPurchased = await Order.findOne({
      customer: req.user.id,
      "products.product": productId,
      paymentStatus: "completed",
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "You can only review a product you have purchased" });
    }

    // 2. Check if already reviewed
    const alreadyReviewed = await ReviewModel.findOne({ product: productId, user: req.user.id });
    if (alreadyReviewed) return res.status(400).json({ message: "Already reviewed" });

    // 3. Create review with images
    const review = await ReviewModel.create({
      product: productId,
      user: req.user.id,
      rating: Number(rating),
      comment,
      images: images || [], // Images array
      referenceWebsite,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

export const getReview = async (req, res) => {
  try {
    const reviews = await ReviewModel.find({
      product: req.params.productId,
    }).populate("user", "firstName lastName email");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};
