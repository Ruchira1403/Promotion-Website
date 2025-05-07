import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads/products');
    // Ensure directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get dashboard summary
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'username');
    
    // Calculate total sales
    const allOrders = await Order.find({ status: 'completed' });
    const totalSales = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    res.json({
      productCount,
      recentOrders,
      totalSales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product CRUD operations
// 1. Create new product
router.post('/products', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : '';
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      imageUrl
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. Get all products (admin view)
router.get('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Get single product
router.get('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Update product
router.put('/products/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product fields
    product.name = name;
    product.description = description;
    product.price = parseFloat(price);
    product.category = category;
    product.stock = parseInt(stock);
    
    // If new image is uploaded, update imageUrl
    if (req.file) {
      // Delete old image if it exists
      if (product.imageUrl) {
        const oldImagePath = path.join(process.cwd(), product.imageUrl.substring(1));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      product.imageUrl = `/uploads/products/${req.file.filename}`;
    }
    
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. Delete product
router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete product image if it exists
    if (product.imageUrl) {
      const imagePath = path.join(process.cwd(), product.imageUrl.substring(1));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username email')
      .populate('items.product');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email')
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get completed orders
router.get('/orders/completed', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .populate('user', 'username email')
      .populate('items.product');
    
    res.json(completedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales data for charts
router.get('/sales', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const period = req.query.period || 'week'; // Default to week if not specified
    
    // Get the current date for filtering
    const now = new Date();
    
    // Set the start date based on the requested period
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear(), 0, 1); // First day of current year
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
    }
    
    // Calculate total sales from completed orders
    const completedOrders = await Order.find({ 
      status: 'completed',
      createdAt: { $gte: startDate }
    });
    const totalSales = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Count orders in the period
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    // Get pending orders count
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Get sales data for chart by day
    let dateFormat = "%Y-%m-%d"; // Default daily format
    
    if (period === 'year') {
      dateFormat = "%Y-%m"; // Monthly format for year view
    }
    
    const dailySales = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get sales by product category
    const salesByCategory = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          sales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { sales: -1 } }
    ]);
    
    res.json({
      totalSales,
      monthlyOrders,
      pendingOrders,
      dailySales,
      salesByCategory,
      period
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const previousStatus = order.status;
    order.status = status;
    await order.save();
    
    // If status was changed to completed, update total sales statistics
    if (status === 'completed' && previousStatus !== 'completed') {
      console.log(`Order ${order._id} marked as completed and added to total sales.`);
    }
    
    // If status was changed from completed to something else, update sales statistics again
    if (previousStatus === 'completed' && status !== 'completed') {
      console.log(`Order ${order._id} unmarked as completed and removed from total sales.`);
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;