import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { DBConnection } from "./src/db.js";
import cookieParser from "cookie-parser";
import path from "path";

import orderRoutes from "./src/routes/order.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import websiteRoutes from "./src/routes/website.routes.js";
import cartRoutes from "./src/routes/cart.routes.js";
import wishlistRoutes from "./src/routes/wishlist.routes.js";
import catergoriesRoutes from "./src/routes/category.routes.js";
import policyRoutes from "./src/routes/policy.routes.js";
import { getDashboardData } from "./src/routes/dashboard.routes.js";
import { fileURLToPath } from "url";
import vendorRoutes from "./src/routes/vendor.routes.js";
import { isAdmin } from "./src/middleware/isAdmin.js";
import bannerRoutes from "./src/routes/banner.rotes.js";
import review from "./src/routes/review.route.js";
import salesRouter from "./src/routes/sales.router.js";
import newsletter from "./src/routes/newsletter.Routes.js";
import coupon from "./src/routes/coupon.router.js";
import faqRoutes from "./src/routes/faq.routes.js";
import zaakpayRoutes from "./src/routes/zaakpayRoutes.js";

console.log("🔍 ENV CHECK:", {
  merchantId: process.env.ZAAKPAY_MERCHANT_ID,
  secretKey: process.env.ZAAKPAY_SECRET_KEY,
  callbackUrl: process.env.ZAAKPAY_CALLBACK_URL,
  endpoint: process.env.ZAAKPAY_ENDPOINT,
  port: process.env.PORT
});

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: [
      "https://jajamblockprints.com",
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:5175",
      "http://localhost:4002",
      "https://yourfrontenddomain.com",
      "https://jajamblockprints.com",
      "https://www.jajamblockprints.com",
      "https://admin.jajamblockprints.com",
      "https://spiral.fashion",
      "https://www.spiral.fashion",
      "https://qubitnexts.com/",
      "https://khushalkingdom.com"
    ], // allow specific frontend domains

    credentials: true, // allow cookies and headers like Authorization
  })
);

app.use("/uploads", express.static(path.join(__dirname, "./src/uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/website", websiteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/categories", catergoriesRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/sendreview", review);
app.use("/api/newsletter", newsletter);
app.get("/api/dashboard", isAdmin, getDashboardData);
app.use("/api", vendorRoutes);
app.use("/api/coupons", coupon);
app.use("/api/faqs", faqRoutes);
// app.use("/api", zaakpayRoutes);
app.use("/api/zaakpay", zaakpayRoutes);
app.use("/api/salesOverview", salesRouter);


DBConnection();

app.get("/", (req, res) => {
  res.send("server running well");
});

app.use((err, req, res, next) => {
  console.error("Error occurred: ", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});