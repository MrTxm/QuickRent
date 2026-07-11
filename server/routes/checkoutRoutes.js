const express = require("express");
const router = express.Router();

const {
  checkCartAvailability,
  confirmCheckout,
} = require("../controllers/checkoutController");

router.post("/check", checkCartAvailability);
router.post("/confirm", confirmCheckout);

module.exports = router;