import React from 'react'
import { assets, camping, construction, elecrical, electronics,} from '../assets/assets.js'
import { useNavigate } from "react-router-dom";
import Location from '../components/Location.jsx'
import Footer from '../components/Footer.jsx'

const Home = ({ theme }) => {

    const navigate = useNavigate();

  return (
    <div className='mt-20' >
        <div id='Home' className='grid grid-flow-col-1 lg:grid-flow-col  max-sm:w-auto max-sm:items-center max-sm:row-span-1 mx-10'>
                <div class="text-shadow-lg/30 text-7xl lg:text-8xl py-6 dark:text-white">
                Rent Without <br /> Limits.
            </div>
            <div className='text-mediam dark:text-white'>
                Premium construction tools, advanced electronics,<br />
                and professional-grade equipment
                All in one refined platform. <br /><br />
                <button className='text-sm  flex lg:content-start bg-mainbtn  text-black  px-25 py-2.5 m-auto
                    rounded-full cursor-pointer hover:scale-103 hover:border-hvrbtn transition-all'>
                Rent
                </button>
            </div>
            <div class="flex flex-nowrap gap-5 mt-5 lg:justify-start justify-center">
                <a href="#"><img src={assets.instagram} className='hover:scale-115 w-10 l-10' alt="" /></a>
                <a href="#"><img src={assets.fb} className='hover:scale-110 w-10 l-10' alt="" /></a>
                <a href="#"><img src={assets.whatsapp} className='hover:scale-115 w-10 l-10' alt="" /></a>
            </div>

            <div class=" row-span-4">
                <img src={assets.backbaground} className='w-162.5 shadow-xl/80 backdrop-blur-xl max-sm:-rotate-10 -rotate-20 rotate-z-10 lg:hover:-rotate-9 mt-10 ' alt="" />
            </div>
        </div>

        <div id='Service'>
                <a href="#Service"><img src={theme === 'dark' ? assets.downw : assets.downb} className='size-15 m-auto animate-bounce mt-15' alt="" /></a>
                <h1 className='text-7xl text-center mt-10 dark:text-white'>Our Services</h1>
            
            <div className="bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center">
                    <div className="w-full lg:w-1/3">
                        <img src={camping.fullbg} className="w-full h-auto object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]" alt="" />
                    </div>
                    <div className="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                                <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">
                                Adventure Collection</h2>
                                <p className="text-sm sm:text-base lg:text-lg pt-4 dark:text-white">
                                Refined camping essentials crafted to elevate every outdoor experience</p>
                            <button onClick={() => navigate(`/category/6a031307b90644d5bdb7a430`)}
                            className="mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all">
                                Explore Collection
                            </button>
                    </div>
                </div>
            </div>

            <div className='bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden'>
                <div class="flex flex-col lg:flex-row items-center ">
                    <div class="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">
                            Construction Solutions
                        </h2>
                        <p className='text-sm sm:text-base lg:text-lg pt-4 dark:text-white'>
                            Engineered machinery and equipment built to support strength, precision, and reliability on every project.</p>
                        <button onClick={() => navigate(`/category/6a0346137400c67351887ad3`)}
                        className='mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all'>
                            Explore Collection
                        </button>
                    </div>
                    <div class="w-full lg:w-1/3">
                        <img src={construction.banpic} className='w-full h-80 object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]' alt="" />
                    </div>
                </div>
            </div>

            <div className="bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center">
                    <div className="w-full lg:w-1/3">
                        <img src={elecrical.bgelec} className="w-full h-auto object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]" alt="" />
                    </div>
                    <div className="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                                <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">
                                Power Tools Collection</h2>
                                <p className="text-sm sm:text-base lg:text-lg pt-4 dark:text-white">
                               High-performance tools crafted for precision and control.</p>
                            <button onClick={() => navigate(`/category/6a0346907400c67351887ad4`)}
                            className="mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all">
                                Explore Collection
                            </button>
                    </div>
                </div>
            </div>

            <div className='bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden'>
                <div class="flex flex-col lg:flex-row items-center ">
                    <div class="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">
                            Digital Essentials
                        </h2>
                        <p className='text-sm sm:text-base lg:text-lg pt-4 dark:text-white'>
                            Advanced technology designed for seamless productivity.</p>
                        <button onClick={() => navigate(`/category/6a0346c77400c67351887ad5`)}
                        className='mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all'>
                            Explore Collection
                        </button>
                    </div>
                    <div class="w-full lg:w-1/3">
                        <img src={electronics.digibg} className='w-full h-auto object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]' alt="" />
                    </div>
                </div>
            </div>
        </div>

        <div id='About' className="mt-16 px-6 lg:px-20">
            <h1 className='text-4xl text-center  lg:text-7xl lg:text-center mt-10 dark:text-white'>About</h1><br />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-10 items-start dark:text-white">
                    <div class="text-justify m-5">
                        <p className="text-base lg:text-lg text-justify">
                            At QuickRent, we redefine equipment rental with precision and excellence.
                            From robust construction solutions to refined digital essentials and adventure gear,
                            we deliver premium equipment through a seamless,
                            technology-driven platform designed for reliability and performance.
                        </p>
                        <h2 className="mt-8 text-2xl lg:text-3xl font-semibold">
                            Why Choose Us?
                        </h2>
                        <ul className="mt-4 space-y-2 text-sm lg:text-base">
                            <li>🔹 Premium Quality Equipment</li>
                            <li>🔹 Seamless Online Booking</li>
                            <li>🔹 Transparent Pricing</li>
                            <li>🔹 Timely Reminders & Support</li>
                            <li>🔹 Trusted & Professional Service</li>
                        </ul>
                    </div>
                    <div className="w-full h-[`400px`] lg:h-[`450px`] rounded-xl overflow-hidden shadow-lg">
                        <Location />
                    </div>
                </div>
        </div>
        <div id='Contact' className="mt-10  ">
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
    </div>
  )
}

export default Home