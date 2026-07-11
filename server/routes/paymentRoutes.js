const express = require("express");

const router = express.Router();

const { generatePayment} = require("../controllers/paymentController");

router.post("/generate", generatePayment);

module.exports = router;