const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// Create category
router.post("/", async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.json(category);
});

//in mogoDB there is a table call category in this section i used the POST / GET methods to create and get categories 

// Get all categories
router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

module.exports = router;