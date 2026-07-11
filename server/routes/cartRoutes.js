const express=require("express");

const router=express.Router();

const{

addCart,
getCart,
increaseQty,
decreaseQty,
deleteCart

}=require("../controllers/cartController");

router.post("/",addCart);

router.get("/:userId",getCart);

router.put("/increase/:id",increaseQty);

router.put("/decrease/:id",decreaseQty);

router.delete("/:id",deleteCart);

module.exports=router;