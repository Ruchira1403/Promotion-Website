import jwt from "jsonwebtoken";
import User from "../models/User.js";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate as admin." });
  }
};

export default adminAuth;