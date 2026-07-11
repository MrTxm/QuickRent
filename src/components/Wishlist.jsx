import React,{useEffect,useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const Wishlist=()=>{

const[wishlist,setWishlist]=useState([]);

const user=JSON.parse(localStorage.getItem("user"));

useEffect(()=>{loadWishlist();},[]);

    const loadWishlist=async()=>{
        const res=await axios.get(

        `http://localhost:5000/api/wishlist/${user._id}`
        );
        setWishlist(res.data);
        };

        const removeItem=async(id)=>{
        await axios.delete(
        `http://localhost:5000/api/wishlist/${id}`
        );
        loadWishlist();
    };
    const navigate = useNavigate();
    const placeOrder=(item)=>{
        navigate(`/payment/${item.categoryId}/${item.productId}`);
    };


    return(
        <div>
            <h1 className="text-3xl font-bold mb-5">
            My Wishlist
            </h1>
            <div className="grid grid-cols-3 gap-5">
                {
                wishlist.map(item=>(
                    <div
                        key={item._id}
                        className="shadow-lg rounded-xl p-4">
                        <img
                        src={`http://localhost:5000${item.productImage}`}
                        className="w-full h-52 object-cover rounded-xl"
                        />
                        <h2 className="text-xl font-bold mt-3">
                        {item.productName}
                        </h2>
                        <p>
                        Rs.{item.pricePerDay}/day
                        </p>
                        <div className="flex flex-col gap-2 mt-4">
                            <button
                            onClick={()=>placeOrder(item)}
                            className="bg-green-600 text-white rounded-lg py-2"
                            >
                            Place Order
                            </button>
                            <button
                            onClick={()=>removeItem(item._id)}
                            className="bg-red-500 text-white rounded-lg py-2"
                            >
                            Remove
                            </button>
                        </div>
                    </div>
                    ))
                }
            </div>
        </div>
    );
};

export default Wishlist;