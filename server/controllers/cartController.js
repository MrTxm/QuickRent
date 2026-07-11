const Cart = require("../models/Cart");
const Product = require("../models/Product");

const findProduct = async ({ productId, categoryId, productName, productImage }) => {
  const query = {
    $or: [
      { product_id: productId },
      { productId },
      { id: productId },
      { code: productId },
      { name: productName },
      { productName },
      { image: productImage },
      { productImage },
    ],
  };

  if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
    query.category_id = Number(categoryId);
  }

  return await Product.findOne(query);
};

const getAvailableStock = (product) => {
  return Number(
    product?.availableStock ??
      product?.available ??
      product?.stock ??
      product?.availableQuantity ??
      0
  );
};

exports.addCart = async (req, res) => {
  try {
    const { userId, productId, categoryId, productName, productImage, pricePerDay } = req.body;

    console.log("ADD CART BODY:", req.body);

    if (!userId || !productId || categoryId === undefined || categoryId === null || categoryId === "") {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, productId, categoryId",
      });
    }

    const product = await findProduct({ productId, categoryId, productName, productImage });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found for ID: ${productId}`,
      });
    }

    const availableStock = getAvailableStock(product);

    if (availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: "This product is out of stock",
        availableStock,
      });
    }

    const exists = await Cart.findOne({ userId, productId, categoryId: Number(categoryId) });

    if (exists) {
      if (exists.quantity >= availableStock) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableStock} available in stock`,
          availableStock,
        });
      }

      exists.quantity += 1;
      await exists.save();

      return res.json({
        success: true,
        message: "Quantity updated",
        cartItem: { ...exists._doc, availableStock },
      });
    }

    const cartItem = new Cart({
      userId,
      productId,
      categoryId: Number(categoryId),
      productName: productName || product.name,
      productImage: productImage || product.image,
      pricePerDay: Number(pricePerDay || product.pricePerDay),
      quantity: 1,
    });

    await cartItem.save();

    res.json({
      success: true,
      message: "Added to cart",
      cartItem: { ...cartItem._doc, availableStock },
    });
  } catch (err) {
    console.error("Add Cart Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while adding to cart",
      error: err.message,
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.params.userId }).lean();

    const cartWithStock = await Promise.all(
      cart.map(async (item) => {
        const product = await findProduct({
          productId: item.productId,
          categoryId: item.categoryId,
          productName: item.productName,
          productImage: item.productImage,
        });

        return {
          ...item,
          availableStock: getAvailableStock(product),
        };
      })
    );

    res.json(cartWithStock);
  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.increaseQty = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      return res.status(404).json({ message: "Item not found" });
    }

    const product = await findProduct({
      productId: cart.productId,
      categoryId: cart.categoryId,
      productName: cart.productName,
      productImage: cart.productImage,
    });

    if (!product) {
      return res.status(404).json({ message: `Product not found for ID: ${cart.productId}` });
    }

    const availableStock = getAvailableStock(product);

    if (cart.quantity >= availableStock) {
      return res.status(400).json({
        message: `Only ${availableStock} available in stock`,
        availableStock,
      });
    }

    cart.quantity += 1;
    await cart.save();

    res.json({ ...cart._doc, availableStock });
  } catch (err) {
    console.error("Increase Qty Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.decreaseQty = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (cart.quantity > 1) {
      cart.quantity -= 1;
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    console.error("Decrease Qty Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Removed" });
  } catch (err) {
    console.error("Delete Cart Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
