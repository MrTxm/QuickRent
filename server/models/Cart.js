const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    productId:{
        type:String,
        required:true
    },

    categoryId: {
    type: Number,
        required: true
    },

    productName:{
        type:String,
        required:true
    },

    productImage:{
        type:String,
        required:true
    },

    pricePerDay:{
        type:Number,
        required:true
    },

    quantity:{
        type:Number,
        default:1
    }

},{timestamps:true});

module.exports = mongoose.model("Cart",cartSchema);