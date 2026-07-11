const express = require("express");

const router = express.Router();

const{

addWishlist,
getWishlist,
deleteWishlist

} = require("../controllers/wishlistController");


router.post("/",addWishlist);

router.get("/:userId",getWishlist);

router.delete("/:id",deleteWishlist);

module.exports = router;