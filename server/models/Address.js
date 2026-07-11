const mongoose=require("mongoose");

const addressSchema=new mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required: true
},

fullName:String,

contactNumber:String,

province:String,

city:String,

address:String,

isDefault:{
type:Boolean,
default:false
}

},{timestamps:true});

module.exports=mongoose.model("Address",addressSchema);