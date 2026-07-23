import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'


const Footer = () => {
    const navigate = useNavigate()
    const [showMore, setShowMore] = useState(false)

return (

  <div className="w-full bg-gray-100 dark:bg-gray-900 dark:text-white px-6 lg:px-20 py-12">

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-15 ">

      <div>
        <img src={assets.logo} className="w-48 mb-4" alt="" />
            <p className={`${showMore ? '' : 'line-clamp-2'} text-sm lg:text-base text-justify`}>
            At QuickRent, we provide premium construction tools, digital equipment,
            camping essentials, and professional-grade rental solutions designed for
            convenience, reliability, and modern project needs. Our platform ensures
            seamless booking, transparent pricing, and high-quality customer support
            for every rental experience.
            </p>

        <button onClick={() => setShowMore(!showMore)} className="text-mainbtn mt-2 hover:underline"> 
            {showMore ? 'Show Less' : 'Read More'}
        </button>
        <div className='flex items-center gap-5 mt-6'>
             <h2 className="mt-6 text-xl font-semibold">
          Follow us:
        </h2>

        <div className="flex gap-4 mt-3">
          <img src={assets.instagram} className="w-8 hover:scale-110 cursor-pointer" alt="" />
          <img src={assets.fb} className="w-8 hover:scale-110 cursor-pointer" alt="" />
          <img src={assets.whatsapp} className="w-8 hover:scale-110 cursor-pointer" alt="" />
        </div>

        </div>
       
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold mb-4">
          Quick Links
        </h3>

        <ul className="space-y-3 text-base">
          <li><a  onClick={() => navigate("/")} className="hover:text-mainbtn">Home</a></li>
          <li><a onClick={() => navigate("/service")} className="hover:text-mainbtn">Services</a></li>
          <li><a onClick={() => navigate("/about")} className="hover:text-mainbtn">About</a></li>
          <li><a onClick={() => navigate("/contact")} className="hover:text-mainbtn">Contact Us</a></li>
        </ul>

      </div>
      <div>

        <h3 className="text-2xl font-semibold mb-4">
          Contact
        </h3>

        <p>Email: quickrent@gmail.com</p>
        <p className="mt-2">Phone: +94 74 128 7118</p>
        <p className="mt-2">Location: Hapugasthalawa, Sri Lanka</p>

      </div>

    </div>

  </div>
  )
}

export default Footer