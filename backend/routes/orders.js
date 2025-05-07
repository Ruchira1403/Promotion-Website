import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Create a new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, shippingDetails, paymentMethod } = req.body;

    // Validate required fields
    if (!items || !totalAmount || !shippingDetails || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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
      status: "pending" // This sets all orders to pending initially
    });

    await order.save();

    // Clear user's cart
    const user = await User.findById(req.userId);
    user.cart = [];
    await user.save();

    // Send email notification to admin
    try {
      // Get user details for the email
      const userData = await User.findById(req.userId);

      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Format order items for email
      const itemsList = items.map(item =>
        `<tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.productName || "Product"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Rs.${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Rs.${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
      ).join("");

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Use admin email if available
        subject: `New Order #${order._id.toString().substring(0, 8)} Received`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f7942;">New Order Received</h2>
            <p>A new order has been placed by ${userData.username} (${userData.email}).</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> #${order._id.toString().substring(0, 8)}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Total Amount:</strong> Rs.${totalAmount.toFixed(2)}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3>Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Quantity</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Unit Price</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0;">Shipping Information</h3>
              <p><strong>Name:</strong> ${shippingDetails.name}</p>
              <p><strong>Email:</strong> ${shippingDetails.email}</p>
              <p><strong>Phone:</strong> ${shippingDetails.phone}</p>
              <p><strong>Address:</strong> ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.postalCode}, Sri Lanka</p>
            </div>
            
            <p style="margin-top: 20px;">Please log in to the admin dashboard to manage this order.</p>
          </div>
        `
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log(`Order notification email sent to admin for order #${order._id.toString().substring(0, 8)}`);
    } catch (emailError) {
      // Log the error but don't fail the order creation
      console.error("Failed to send order notification email:", emailError);
    }

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

// Get single order by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate("items.product");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
});

export default router;