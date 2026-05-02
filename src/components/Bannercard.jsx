import React from 'react'



function Bannercard (props){
  return (
    <div className="bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/3">
                <img src={props.rimage} className="w-full h-auto object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]" alt="" />
            </div>
            <div className="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">{props.title}</h2>
                <p className="text-sm sm:text-base lg:text-lg pt-4 dark:text-white">{props.Text}</p>
                <button className="mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all">Explore Collection</button>
            </div>
            <div className="w-full lg:w-1/3">
                <img src={props.limage} className="w-full h-auto object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]" alt="" />
            </div>
        </div>
    </div>
  )
}

export default Bannercard
