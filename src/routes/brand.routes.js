import express from "express";
import multer from "multer";
import path from "path";
import { 
  createBrand, 
  getAllBrands, 
  updateBrand, 
  deleteBrand 
} from "../controller/Brand.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `brand-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// --- Routes ---

// Get all brands
router.get("/", getAllBrands);

// Create brand (with logo upload)
router.post("/", upload.single("logo"), createBrand);

// Update brand
router.put("/:id", upload.single("logo"), updateBrand);

// Delete brand
router.delete("/:id", deleteBrand);

export default router;