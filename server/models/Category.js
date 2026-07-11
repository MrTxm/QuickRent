const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
     category_id: {
    type: Number,
    required: true,
    unique: true
  },
    name: String,
    description: String,
    image: String
});

module.exports = mongoose.model("Category", categorySchema);