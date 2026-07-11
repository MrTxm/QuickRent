const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema(
  {
    productId: String,
    productName: String,
    quantity: { type: Number, default: 0 },
    goodQty: { type: Number, default: 0 },
    damagedQty: { type: Number, default: 0 },
    damageReason: { type: String, default: "" },
    damageCost: { type: Number, default: 0 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    categoryId: {
      type: Number,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productImage: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    gmail: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    nic: {
      type: String,
      required: true,
    },

    province: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    days: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["On Site", "Advance"],
      required: true,
    },

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    bookingStatus: {
      type: String,
      default: "Pending",
    },

    advancePaid: {
      type: Number,
      default: 0,
    },

    balancePaid: {
      type: Boolean,
      default: false,
    },

    balancePaidAt: {
      type: Date,
      default: null,
    },

    transactionId: {
      type: String,
      default: "",
    },

    bookingReference: {
      type: String,
      default: "",
    },

    reviewed: {
      type: Boolean,
      default: false,
    },

    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    returnedAt: {
      type: Date,
      default: null,
    },

    returnItems: {
      type: [returnItemSchema],
      default: [],
    },

    damageCharge: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
