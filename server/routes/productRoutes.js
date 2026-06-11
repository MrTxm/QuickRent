const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const mongoose = require("mongoose");
const Category = require("../models/Category");

// 🔹 Get Products By Category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = Number(req.params.categoryId);

    const category = await Category.findOne({
      category_id: categoryId
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    const products = await Product.find({
      category: category._id
    })
      .populate("category")
      .sort({ product_id: 1 });

    res.status(200).json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
});

// 🔹 Add Multiple Products
router.post("/bulk", async (req, res) => {
  try {
    const productsToInsert = [];

    for (const item of req.body) {

      const category = await Category.findOne({
        category_id: item.category_id
      });

      if (!category) {
        return res.status(404).json({
          message: `Category ${item.category_id} not found`
        });
      }

      productsToInsert.push({
        product_id: item.product_id,
        name: item.name,
        pricePerDay: item.pricePerDay,
        category: category._id, // <-- conversion happens here
        image: item.image,
        available: item.available
      });
    }

    const products = await Product.insertMany(productsToInsert);

    res.status(201).json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
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

//🔹 Get Search  Products using search bar
router.get("/search/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;

    const products = await Product.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    }).populate("category");

    res.json(products);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;