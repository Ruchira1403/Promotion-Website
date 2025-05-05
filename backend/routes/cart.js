import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get user's cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.product");
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
});

// Add product to cart
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Check if enough stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }
    
    const user = await User.findById(req.userId);
    
    // Check if product already in cart
    const existingProductIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingProductIndex > -1) {
      // Update quantity if product already in cart
      user.cart[existingProductIndex].quantity += quantity;
    } else {
      // Add new product to cart
      user.cart.push({ product: productId, quantity });
    }
    
    await user.save();
    
    res.json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
});

// Update cart item quantity
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    
    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }
    
    const user = await User.findById(req.userId);
    
    const existingProductIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingProductIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }
    
    user.cart[existingProductIndex].quantity = quantity;
    await user.save();
    
    res.json({ message: "Cart updated", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error: error.message });
  }
});

// Remove product from cart
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.userId);
    
    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );
    
    await user.save();
    
    res.json({ message: "Product removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart", error: error.message });
  }
});

export default router;