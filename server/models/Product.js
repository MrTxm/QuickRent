
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_id:{
    type:String
  },
  name: {
    type: String,
    required: true
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
  required: true
},
  image: {
    type: String
  },
  available: {
    type: Number,
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);