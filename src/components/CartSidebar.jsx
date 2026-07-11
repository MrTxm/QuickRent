import React from "react";
import Cart from "../components/Cart";
import { useNavigate } from "react-router-dom";

const CartSidebar = ({ isOpen, onClose, cartItems }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Background overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
        ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen w-50% sm:w-[420px] bg-white z-50 shadow-xl 
        transform transition-transform duration-300 flex flex-col
        ${isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"}`}
      >
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            My Cart
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto p-5">
          <Cart isOpen={isOpen} cartItems={cartItems} />
        </div>

        {/* Footer */}
        <div className="border-t p-5 bg-white">
          <button
            onClick={() => {
              navigate("/CartCheckout");
              onClose();
            }}
            className="w-full bg-mainbtn py-3 rounded-lg font-semibold"
          >
            Make Payment
          </button>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;