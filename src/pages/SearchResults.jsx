import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { assets } from '../assets/assets'
import { FaHeart } from "react-icons/fa";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const SearchResults = () => {
    const { addToCart} = useContext(CartContext);
  const { keyword } = useParams();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/api/products/search/${keyword}`
      )
      .then((res) => {
        setProducts(res.data);
      })
      .catch(console.log);
  }, [keyword]);

  return (
    <div className="p-10">
      <h1 className="text-3xl mb-8">
        Search Results
      </h1>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id}
            className="relative bg-white shadow-lg/30 rounded-xl p-4" >
                <button className="absolute top-3 right-3 bg-primary p-2 rounded-full shadow-md hover:scale-110 transition">
                                <FaHeart className="text-black-400 hover:text-red-500 text-3xl" />
                            </button>
              <img
              src={`http://localhost:5000${product.image}`}
              alt={''}
              className="w-full h-90 object-cover rounded-lg"
            />
            
            <h2 className="mt-4 text-2xl font-semibold">
              {product.name}
            </h2>
            <p className="text-gray-600">
              Rs. {product.pricePerDay} / day
            </p>
            <div>On Stock : {product.available}</div><br />
            <div className="flex">
              <button className='text-sm  flex content-center bg-mainbtn  text-black   py-3.5 m-auto w-auto px-15
                    rounded-full cursor-pointer hover:scale-103 hover:border-hvrbtn transition-all'>
                See preview
              </button>
              <button  onClick={() => {  addToCart(product);}}
                className='text-sm  flex content-center bg-mainbtn  text-black   px-5 py-2.5 m-auto w-auto
                    rounded-full cursor-pointer hover:scale-103 hover:border-hvrbtn transition-all'>
                <img src={assets.cart} className="w-8 h-8" alt="" />
              </button>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;