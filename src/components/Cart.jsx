import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Cart = ({ isOpen }) => {
  const [cart, setCart] = useState([]);
  const [stockWarning, setStockWarning] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (isOpen && user?._id) {
      loadCart();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleCartUpdate = () => {
      if (user?._id) {
        loadCart();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const getAvailableStock = (item) => {
    return (
      item.availableStock ??
      item.available ??
      item.stock ??
      item.availableQuantity ??
      0
    );
  };

  const loadCart = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/cart/${user._id}`
      );

      console.log("CART DATA:", res.data);
      setCart(res.data);
    } catch (error) {
      console.error("LOAD CART ERROR:", error);
      toast.error("Failed to load cart");
    }
  };

  const increase = async (item) => {
    const availableStock = getAvailableStock(item);

    if (item.quantity >= availableStock) {
      const message = `Only ${availableStock} available in stock`;

      toast.error(message);

      setStockWarning((prev) => ({
        ...prev,
        [item._id]: message,
      }));

      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/cart/increase/${item._id}`
      );

      setStockWarning((prev) => ({
        ...prev,
        [item._id]: "",
      }));

      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      const message =
        error.response?.data?.message || "Cannot increase quantity";

      toast.error(message);

      setStockWarning((prev) => ({
        ...prev,
        [item._id]: message,
      }));
    }
  };

  const decrease = async (id) => {
    try {
      await axios.put(
        `${API_URL}/api/cart/decrease/${id}`
      );

      setStockWarning((prev) => ({
        ...prev,
        [id]: "",
      }));

      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("DECREASE ERROR:", error);
      toast.error("Cannot decrease quantity");
    }
  };

  const remove = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/api/cart/${id}`
      );

      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("REMOVE ERROR:", error);
      toast.error("Cannot remove item");
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.pricePerDay * item.quantity,
    0
  );

  if (!user?._id) {
    return (
      <p className="text-gray-500">
        Please login to view your cart
      </p>
    );
  }

  return (
    <div>

      {cart.length === 0 ? (
        <p className="text-gray-500">
          Your cart is empty
        </p>
      ) : (
        cart.map((item) => {
          const availableStock = getAvailableStock(item);

          return (
            <div
              key={item._id}
              className="flex gap-3 bg-white border rounded-xl p-3 mb-4"
            >
              <img
                src={`${API_URL}${item.productImage}`}
                alt={item.productName}
                className="w-32 h-32 rounded-xl object-cover"
              />

              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {item.productName}
                </h2>

                <p className="text-gray-500">
                  Rs. {item.pricePerDay} / day
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Available stock: {availableStock}
                </p>

                {stockWarning[item._id] && (
                  <p className="text-sm text-red-500 mt-1">
                    {stockWarning[item._id]}
                  </p>
                )}

                <div className="flex gap-3 mt-3 items-center">
                  <button
                    onClick={() => decrease(item._id)}
                    className="bg-gray-200 px-4 rounded"
                  >
                    -
                  </button>

                  <h2>{item.quantity}</h2>

                  <button
                    onClick={() => increase(item)}
                    className="bg-gray-200 px-4 rounded"
                  >
                    +
                  </button>
                </div>

                <p className="font-bold mt-4">
                  Rs. {item.pricePerDay * item.quantity}
                </p>

                <button
                  onClick={() => remove(item._id)}
                  className="w-full bg-red-500 text-white rounded-lg py-2 mt-3"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })
      )}

      <div className="text-right text-3xl font-bold mt-8">
        Total : Rs. {total}
      </div>
    </div>
  );
};

export default Cart;