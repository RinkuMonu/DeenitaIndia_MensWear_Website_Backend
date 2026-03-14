import Brand from "../models/Brand.model.js";

export const createBrand = async (req, res) => {
  try {
    const { name, description, referenceWebsite, isActive } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : "";
    const newBrand = new Brand({ name, description, referenceWebsite, isActive, logo });
    await newBrand.save();
    res.status(201).json({ success: true, message: "Brand created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Updated Get All Brands with Pagination & Search
export const getAllBrands = async (req, res) => {
  try {
    const { referenceWebsite, search, page = 1, limit = 200 } = req.query;
    let query = {};
    if (referenceWebsite) query.referenceWebsite = referenceWebsite;
    if (search) query.name = { $regex: search, $options: "i" };

    const brands = await Brand.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Brand.countDocuments(query);

    res.status(200).json({
      brands,
      pagination: {
        totalBrands: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Agar nayi logo file upload hui hai toh path update karein
    if (req.file) {
      updateData.logo = `/uploads/${req.file.filename}`;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Brand updated", brand: updatedBrand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Brand
export const deleteBrand = async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};