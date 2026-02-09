import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js"; // Importing Product model to get product details
import Cart from "../models/Cart.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";

// Create a new order
// export const createOrder = async (req, res) => {
//   try {
//     const { products, shippingAddress, type = null } = req.body;
//     const customer = req.user?.id;
//     const referenceWebsite = req.user?.referenceWebsite;
//     if (!products || products.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "At least one product is required" });
//     }
//     let totalAmount = 0;
//     let updatedProducts = products;
//     for (let productItem of products) {
//       const product = await Product.findById(productItem.product);
//       if (!product) {
//         return res
//           .status(400)
//           .json({
//             message: `Product not found for ID: ${productItem.product}`,
//           });
//       }

//       await User.findByIdAndUpdate(
//         product.addedBy,
//         [
//           {
//             $set: {
//               wallet: {
//                 $add: [
//                   "$wallet",
//                   {
//                     $subtract: [
//                       product.actualPrice,
//                       {
//                         $divide: [
//                           {
//                             $multiply: [product.actualPrice, "$commissionRate"],
//                           },
//                           100,
//                         ],
//                       },
//                     ],
//                   },
//                 ],
//               },
//             },
//           },
//         ],
//         { new: true }
//       );

//       const index = updatedProducts.findIndex(
//         (x) => x.product === product._id.toString()
//       );
//       updatedProducts[index].owner = product.addedBy;

//       totalAmount += product.actualPrice * productItem.quantity;
//     }
//     const newOrder = new Order({
//       referenceWebsite,
//       customer,
//       products: updatedProducts,
//       totalAmount,
//       shippingAddress,
//     });
//     await newOrder.save();
//     const identifier = `${customer}-${referenceWebsite}`;

//     if (type === "cart") {
//       const cart = await Cart.findOne({ identifier });
//       if (cart) {
//         cart.items = [];
//         cart.totalAmount = 0;
//         cart.isCheckedOut = true;
//         cart.lastUpdated = Date.now();
//         await cart.save();
//       }
//     }
//     res
//       .status(201)
//       .json({ message: "Order created successfully", order: newOrder });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Failed to create order", error: error.message });
//   }
// };

export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, type = null } = req.body;
    const customer = req.user?.id;
    const referenceWebsite = req.user?.referenceWebsite;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "At least one product is required" });
    }

    let totalAmount = 0;
    let updatedProducts = products;

    for (let productItem of products) {
      const product = await Product.findById(productItem.product);
      if (!product) {
        return res.status(400).json({
          message: `Product not found for ID: ${productItem.product}`,
        });
      }

      // Attach owner for commission split later
      const index = updatedProducts.findIndex(
        (x) => x.product === product._id.toString()
      );
      updatedProducts[index].owner = product.addedBy;

      totalAmount += product.actualPrice * productItem.quantity;
    }

    // Create order with pending payment
    const newOrder = new Order({
      referenceWebsite,
      customer,
      products: updatedProducts,
      totalAmount,
      shippingAddress,
      paymentStatus: "pending", // Always start with pending
    });

    await newOrder.save();

    // Clear cart if checkout from cart
    const identifier = `${customer}-${referenceWebsite}`;
    if (type === "cart") {
      const cart = await Cart.findOne({ identifier });
      if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        cart.isCheckedOut = true;
        cart.lastUpdated = Date.now();
        await cart.save();
      }
    }

    // Send back orderId & totalAmount for payment initiation
    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
      paymentData: {
        orderId: newOrder._id,
        amount: totalAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

export const getOrdersByReferenceWebsite = async (req, res) => {
  try {
    const {
      referenceWebsite,
      customerName,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = "createdAt", // Default to sorting by creation date
      sortOrder = "desc", // Default to descending order
    } = req.query;
    const filter = {};
    if (referenceWebsite) {
      filter.referenceWebsite = referenceWebsite;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // If minPrice or maxPrice is provided, add price filters
    if (minPrice || maxPrice) {
      filter.totalAmount = filter.totalAmount || {};
      if (minPrice) filter.totalAmount.$gte = parseFloat(minPrice);
      if (maxPrice) filter.totalAmount.$lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    let orders = await Order.find(filter)
      .populate("products.product", "productName price")
      .populate("customer", "firstName lastName email")
      .populate("referenceWebsite", "websiteName")
      .sort(sortOptions) // Apply sorting
      .skip(skip)
      .limit(parseInt(limit));

    if (customerName) {
      orders = orders.filter((order) => {
        const fullName =
          `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase();
        return fullName.includes(customerName.toLowerCase());
      });
    }

    const totalOrders = await Order.countDocuments(filter);

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found matching the criteria." });
    }

    res.status(200).json({
      orders,
      totalOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch orders.", error: error.message });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 1. Database se orders nikalna
    const orders = await Order.find({ customer: userId })
      .populate("products.product", "productName price images")
      .populate("customer", "firstName lastName email mobile")
      .sort({ createdAt: -1 }); // Naye orders pehle dikhenge

    if (!orders || orders.length === 0) {
      return res.status(404).json({ 
        message: "No orders found for this user",
        orders: [],
        uniqueAddresses: [] 
      });
    }

    // 2. UNIQUE ADDRESSES LOGIC
    const uniqueAddressesMap = new Map();

    orders.forEach(order => {
      // YAHAN CHECK KAREIN: Agar aapke schema mein 'address' ki jagah 
      // 'shippingAddress' ya kuch aur hai, toh niche 'order.address' ko change karein.
      if (order.shippingAddress) {
        // Address object ko string banate hain comparison ke liye
        const addressKey = JSON.stringify(order.shippingAddress).toLowerCase().trim();
        
        if (!uniqueAddressesMap.has(addressKey)) {
          uniqueAddressesMap.set(addressKey, order.shippingAddress);
        }
      }
    });

    const uniqueAddresses = Array.from(uniqueAddressesMap.values());

    // 3. Final Response
    // Dhyan dein: uniqueAddresses ko response mein bhej rahe hain
    return res.status(200).json({ 
      message: "Orders retrieved successfully", 
      count: orders.length,
      orders, 
      uniqueAddresses 
    });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ 
      message: "Failed to fetch orders", 
      error: error.message 
    });
  }
};
// Get a specific order by ID
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id })
      .populate("customer", "firstName lastName email mobile")
      .populate("products.product", "productName price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order retrieved successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve order", error: error.message });
  }
};

// Update order status (for example, when an order is shipped or delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Validate status values
    if (
      status &&
      !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (
      paymentStatus &&
      !["pending", "completed", "failed"].includes(paymentStatus)
    ) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    // Find and update order
    const order = await Order.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res
      .status(200)
      .json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    return res
      .status(500)
      .json({ message: "Failed to update order", error: error.message });
  }
};

// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete order", error: error.message });
  }
};
