import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Create a new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, shippingDetails, paymentMethod } = req.body;
    
    // Verify cart is not empty
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    
    // Check stock availability and update product stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock available for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Create order
    const order = new Order({
      user: req.userId,
      items,
      totalAmount,
      shippingAddress: {
        street: shippingDetails.address,
        city: shippingDetails.city,
        postalCode: shippingDetails.postalCode,
        country: "Sri Lanka" // Default country
      },
      paymentMethod,
      status: paymentMethod === "card" ? "processing" : "pending"
    });
    
    await order.save();
    
    // Clear user's cart
    const user = await User.findById(req.userId);
    user.cart = [];
    await user.save();
    
    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});

// Get user's orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("items.product");
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

export default router;