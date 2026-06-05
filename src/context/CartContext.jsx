import { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

const addToCart = (product) => {
  console.log("Adding:", product);

  setCartItems((prev) => {
    const updated = [...prev, product];
    console.log("Updated Cart:", updated);
    return updated;
  });
};

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};