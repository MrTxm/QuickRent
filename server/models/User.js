const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true,
        unique: true
    },

    contactNumber:{
        type: Number,
        required: true
    },

    nic: {
    type: String,
    required: true
    },

    password: {
    type: String,
    required: true
    },

    profileImage:{
    type:String,
    default:""
    },

    address:{
        type:String,
        default:""
    },

    city:{
        type:String,
        default:""
    },

    province:{
        type:String,
        default:""
    },
    
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    isActive: {
    type: Boolean,
    default: false
}

},{ timestamps: true});

module.exports = mongoose.model("User",userSchema);