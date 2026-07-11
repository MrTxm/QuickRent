import React from 'react'
import { assets, camping, construction, elecrical, electronics,} from '../assets/assets.js'
import { useNavigate } from "react-router-dom";

const Service = ({theme}) => {
    const navigate = useNavigate();
  return (
    <div>
                    <a href="#Service"><img src={theme === 'dark' ? assets.downw : assets.downb} className='size-15 m-auto animate-bounce mt-15' alt="" /></a>
                    <h1 className='text-7xl text-center mt-10 dark:text-white'>Our Services</h1>

                <div className='bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden dark:bg-yellow-700'>
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="w-full lg:w-1/3">
                            <img src={camping.fullbg} className="w-full h-80 object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]" alt="" />
                        </div>
                        <div className="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                                    <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">
                                    Adventure Collection</h2>
                                    <p className="text-sm sm:text-base lg:text-lg pt-4 dark:text-white">
                                    Refined camping essentials crafted to elevate every outdoor experience</p>
                                <button onClick={() => navigate(`/category/1`)}
                                className="mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all">
                                    Explore Collection
                                </button>
                        </div>
                    </div>
                </div>

                <div className='bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden dark:bg-yellow-700'>
                    <div class="flex flex-col lg:flex-row items-center ">
                        <div class="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">
                                Construction Solutions
                            </h2>
                            <p className='text-sm sm:text-base lg:text-lg pt-4 dark:text-white'>
                                Engineered machinery and equipment built to support strength, precision, and reliability on every project.</p>
                            <button onClick={() => navigate(`/category/2`)}
                            className='mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all'>
                                Explore Collection
                            </button>
                        </div>
                        <div class="w-full lg:w-1/3">
                            <img src={construction.banpic} className='w-full h-80 object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]' alt="" />
                        </div>
                    </div>
                </div>
    
                <div className="bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden dark:bg-yellow-700">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="w-full lg:w-1/3">
                            <img src={elecrical.bgelec} className="w-full h-80 object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]" alt="" />
                        </div>
                        <div className="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                                    <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">
                                    Power Tools Collection</h2>
                                    <p className="text-sm sm:text-base lg:text-lg pt-4 dark:text-white">
                                   High-performance tools crafted for precision and control.</p>
                                <button onClick={() => navigate(`/category/3`)}
                                className="mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all">
                                    Explore Collection
                                </button>
                        </div>
                    </div>
                </div>
    
                <div className='bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden dark:bg-yellow-700'>
                    <div class="flex flex-col lg:flex-row items-center ">
                        <div class="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">
                                Digital Essentials
                            </h2>
                            <p className='text-sm sm:text-base lg:text-lg pt-4 dark:text-white'>
                                Advanced technology designed for seamless productivity.</p>
                            <button onClick={() => navigate(`/category/4`)}
                            className='mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all'>
                                Explore Collection
                            </button>
                        </div>
                        <div class="w-full lg:w-1/3">
                            <img src={electronics.digibg} className='w-full h-80 object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]' alt="" />
                        </div>
                    </div>
                </div>
            </div>
  )
}

export default Service