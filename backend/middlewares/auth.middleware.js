import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by an admin",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalid",
    });
  }
};

// Role based authentication
export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("========== AUTH CHECK ==========");
    console.log("USER ID:", req.user?._id);
    console.log("USER ROLE:", req.user?.role);
    console.log("ALLOWED ROLES:", roles);
    console.log("================================");
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied. You don't have permission.",
      });
    }

    next();
  };
};
