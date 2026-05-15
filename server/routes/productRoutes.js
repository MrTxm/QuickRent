const express = require("express");
const router = express.Router();
const Product = require("../models/Product");


// 🔹 Add Product
router.post("/bulk", async (req, res) => {
  try {
    const products = await Product.insertMany(req.body);
    res.status(201).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// 🔹 Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 🔹 Get Products By Category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;