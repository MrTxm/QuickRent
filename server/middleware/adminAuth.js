const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    const adminUserId =
      req.headers["x-user-id"] ||
      req.headers["x-admin-id"] ||
      req.body?.adminUserId ||
      req.query?.adminUserId;

    if (!adminUserId) {
      return res.status(401).json({ message: "Admin login required" });
    }

    const admin = await User.findById(adminUserId).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin user not found" });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error.message);
    res.status(401).json({ message: "Invalid admin session" });
  }
};

module.exports = adminAuth;
