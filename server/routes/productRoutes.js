const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Get Products By Category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = Number(req.params.categoryId);

    const products = await Product.find({
      category_id: categoryId,
    }).sort({ product_id: 1 });

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found",
      });
    }

    res.status(200).json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// Add Multiple Products
router.post("/bulk", async (req, res) => {
  try {
    const productsToInsert = req.body.map((item) => ({
      product_id: item.product_id,
      name: item.name,
      description: item.description,
      pricePerDay: item.pricePerDay,
      category_id: item.category_id,
      image: item.image,
      available: item.available,
    }));

    const products = await Product.insertMany(productsToInsert);

    res.status(201).json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

// Update Multiple Products
router.patch("/bulk", async (req, res) => {
  try {

    for (const item of req.body) {

      await Product.updateOne(
        {
          product_id: item.product_id
        },
        {
          $set: {
            category_id: item.category_id,
            name: item.name,
            pricePerDay: item.pricePerDay,
            image: item.image,
            available: item.available
          }
        }
      );

    }

    res.json({
      message: "Products updated successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
});

// Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      category_id: 1,
      product_id: 1,
    });

    res.json(products);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// Search Products
router.get("/search/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;

    const products = await Product.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    });

    res.json(products);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// Get Single Product
router.get("/:categoryId/:productId", async (req, res) => {
  try {

    const categoryId = Number(req.params.categoryId);
    const productId = req.params.productId;

    const product = await Product.findOne({
      category_id: categoryId,
      product_id: productId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;