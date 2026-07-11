const Wishlist = require("../models/Wishlist");

exports.addWishlist = async (req, res) => {
  try {
    const { userId, productId, categoryId, productName, productImage, pricePerDay } = req.body;

    if (!userId || !productId || categoryId === undefined || categoryId === null || categoryId === "") {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, productId, categoryId",
      });
    }

    const exists = await Wishlist.findOne({ userId, productId, categoryId: Number(categoryId) });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Already in wishlist",
      });
    }

    const wishlist = new Wishlist({
      userId,
      productId,
      categoryId: Number(categoryId),
      productName,
      productImage,
      pricePerDay: Number(pricePerDay),
    });

    await wishlist.save();

    res.json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  } catch (err) {
    console.error("Wishlist Error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(wishlist);
  } catch (err) {
    console.error("Get Wishlist Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.deleteWishlist = async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ message: "Removed" });
  } catch (err) {
    console.error("Delete Wishlist Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
