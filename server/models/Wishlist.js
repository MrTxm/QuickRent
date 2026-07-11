const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    productId:{
        type:String,
        required:true
    },

    categoryId:{
        type:Number,
        required:true
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
    }

},{timestamps:true});

module.exports=mongoose.model("Wishlist",wishlistSchema);