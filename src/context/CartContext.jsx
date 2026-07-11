import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {

    const [cartItems, setCartItems] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    const fetchCart = async () => {

        if (!user) {
            setCartItems([]);
            return;
        }

        try {

            const res = await axios.get(
                `http://localhost:5000/api/cart/${user._id}`
            );

            setCartItems(res.data);

        } catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        fetchCart();

    }, []);

    const refreshCart = () => {

        fetchCart();

    };

    return (

        <CartContext.Provider
            value={{
                cartItems,
                refreshCart
            }}
        >

            {children}

        </CartContext.Provider>

    );

};