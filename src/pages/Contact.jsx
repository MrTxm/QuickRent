import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Contact = () => {
    const navigate= useNavigate();
    
  return (
    <div>
    <h1 className='text-4xl text-center  lg:text-7xl lg:text-center dark:text-white'>Contact Us</h1><br />
                <div className='grid grid-cols-1 lg:grid-cols-2'>
                    <div>
                        <img src={assets.contact} className='aspect-ratio[4/5] -mt-15' alt="" />
                    </div>
                    <div >
                    <div className="mx-4 lg:mx-6 my-10 rounded-xl h-35 flex items-center justify-center bg-cover bg-center relative overflow-hidden"
                        style={{ backgroundImage: `url(${assets.gmailbg})` }}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-none"></div>
                            <h1 className="relative text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-white"><a href="mailto:fassyahxmed@gmail.com">G-mail</a></h1>
                        </div>
                        <div className="mx-4 lg:mx-6 my-10 rounded-xl h-35 flex items-center justify-center bg-cover bg-center relative overflow-hidden"
                            style={{ backgroundImage: `url(${assets.wbg})` }}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-none"></div>
                            <h1 className="relative text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-white">
                                <a href="https://wa.me/94741287118?text=Hello%20QuickRent,%20I%20would%20like%20to%20rent%20equipment." target="_blank">
                                    WhatsApp Us
                                </a>
                            </h1>
                        </div>
                        <div className="mx-4 lg:mx-6 my-10 rounded-xl h-35 flex items-center justify-center bg-cover bg-center relative overflow-hidden"
                                style={{ backgroundImage: `url(${assets.call})` }}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-none"></div>
                                <h1 className="relative text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-white">
                                    <a href="tel:+94741287118">Call Us</a>
                                </h1>
                        </div>
                    </div>
                </div>
    </div>
  )
}

export default Contact
