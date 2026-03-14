import mongoose from "mongoose";
import Banner from "../models/banner.model.js"; // Make sure this matches your actual filename
import Websitelist from "../models/Website.model.js";

// Create a single banner
export const createBanner = async (req, res) => {
  try {
    const {
      referenceWebsite,
      bannerName,
      deviceType = "both",
      description,
      position,
    } = req.body;
    const imageArray =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const banner = new Banner({
      referenceWebsite,
      bannerName,
      description,
      images: imageArray,
      position: position || "homepage-top",
      addedBy: req.user?.id?.toString(),
      deviceType,
    });

    await banner.save();

    res.status(200).json({ message: "Banner added successfully", banner });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add banner", error: error.message });
  }
};

export const getBannersByWebsiteAndPosition = async (req, res) => {
  try {
    const { referenceWebsite, position } = req.query;

    if (!referenceWebsite || !position) {
      return res.status(400).json({
        message: "Both 'referenceWebsite' and 'position' are required.",
      });
    }

    const banners = await Banner.find({
      referenceWebsite: new mongoose.Types.ObjectId(referenceWebsite),
      position,
    }).sort({ createdAt: -1 }); // Optional: latest first

    res.status(200).json({
      message: "Banners retrieved successfully",
      banners,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve banners",
      error: error.message,
    });
  }
};

// Create multiple banners
export const createMultipleBanners = async (req, res) => {
  try {
    const { banners } = req.body;

    if (!Array.isArray(banners) || banners.length === 0) {
      return res.status(400).json({ message: "Provide an array of banners." });
    }

    const formattedBanners = banners.map((banner) => ({
      referenceWebsite: banner.referenceWebsite || "6788b0054c4a217090bf6636",
      bannerName: banner.bannerName,
      description: banner.description,
      images: Array.isArray(banner.images) ? banner.images : [banner.images],
      position: banner.position || "homepage-top",
      addedBy: req.user?.id || "679c5cc89e0012636ffef9ed",
    }));

    const result = await Banner.insertMany(formattedBanners);

    res.status(200).json({
      message: `${result.length} banners added successfully`,
      banners: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add banners", error: error.message });
  }
};

// Get banners with optional filters
export const getBanners = async (req, res) => {
  try {
    const {
      referenceWebsite,
      position,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    if (!referenceWebsite) {
      return res.status(400).json({ message: "Missing referenceWebsite" });
    }

    const query = {
      referenceWebsite: new mongoose.Types.ObjectId(referenceWebsite),
    };

    if (position) query.position = position;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const banners = await Banner.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalDocuments = await Banner.countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      message: "Banners retrieved successfully",
      banners,
      pagination: {
        totalDocuments,
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
        totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve banners", error: error.message });
  }
};

// Get banner detail by ID
export const getBannerDetail = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.status(200).json({ message: "Banner retrieved successfully", banner });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve banner", error: error.message });
  }
};

// Update a banner
export const updateBanner = async (req, res) => {
  try {
    const { bannerName, description, position } = req.body;
    let imageArray = [];

    if (req.files && req.files.length > 0) {
      imageArray = req.files.map(file => `/uploads/${file.filename}`);
    } else {
      imageArray = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        bannerName,
        description,
        images: imageArray, 
        position,
      },
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ message: "Banner updated successfully", updatedBanner });
  } catch (error) {
    res.status(500).json({ message: "Failed to update banner", error: error.message });
  }
};

// Delete a banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.status(200).json({ message: "Banner deleted successfully", banner });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete banner", error: error.message });
  }
};
export const getMobileBanners = async (req, res) => {
  try {
    const { referenceWebsite, position } = req.query;

    if (!referenceWebsite) {
      return res.status(400).json({ message: "Missing referenceWebsite" });
    }

    const query = {
      referenceWebsite,
      deviceType: { $in: ["mobile", "both"] },
    };

    if (position) query.position = position;

    const banners = await Banner.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Mobile banners fetched successfully",
      banners,
    });
  } catch (error) {
    console.error("Error fetching mobile banners:", error);
    return res.status(500).json({
      message: "Failed to fetch mobile banners",
      error: error.message,
    });
  }
};
export const getDestopBanners = async (req, res) => {
  try {
    const { referenceWebsite, position } = req.query;

    if (!referenceWebsite) {
      return res.status(400).json({ message: "Missing referenceWebsite" });
    }

    const query = {
      referenceWebsite,
      deviceType: { $in: ["desktop", "both"] },
    };

    if (position) query.position = position;

    const banners = await Banner.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Mobile banners fetched successfully",
      banners,
    });
  } catch (error) {
    console.error("Error fetching mobile banners:", error);
    return res.status(500).json({
      message: "Failed to fetch mobile banners",
      error: error.message,
    });
  }
};
