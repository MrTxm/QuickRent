import React from "react";

const CartSidebar = ({ isOpen, onClose, cartItems }) => {
    console.log("Cart Items:", cartItems);
    
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-xl transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-5 h-full flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">My Cart</h2>

            <button
              onClick={onClose}
              className="text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Products */}
          <div className="flex-1 overflow-y-auto mt-5">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 border-b py-3"
              >
                <img
                  src={`http://localhost:5000${item.image}`}
                  className="w-20 h-20 object-cover rounded"
                  alt=""
                />

                <div className="flex-1">
                  <h3>{item.name}</h3>
                  <p>Rs. {item.pricePerDay}</p>

                  <select className="border mt-2 p-1">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t pt-4">
            <button className="w-full bg-mainbtn py-3 rounded-lg font-semibold">
              Make Payment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;