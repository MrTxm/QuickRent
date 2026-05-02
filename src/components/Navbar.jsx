import React, { useState } from 'react'
import {assets} from '../assets/assets'
import Themetoggle from './themetoggle'

const Navbar = ({theme, setTheme}) => {

  const[sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className='flex justify-between items-center px-4 
    sm:px-12 lg:px-24 xl:px-40 py-4 sticky top-0 z-20
    backdrop-blur-xl font-large bg-secondary dark:bg-gray-900/70'>

        <img src={theme === 'dark' ? assets.logo : assets.logo} className='w-32 sm:w-40' alt=''/>

        <div className={`text-white dark:text-white sm:text-sm ${!sidebarOpen ? 'max-sm:w-0 overflow-hidden' : "max-sm:w-60 max-sm:pl-10"}
        max-sm:fixed top-0 bottom-0 right-0 max-sm:min-h-screen max-sm:h-full max-sm:flex-col
        max-sm:bg-mprimary max-sm:text-#1F2937 max-sm:pt-20 flex sm:items-center gap-5 transition-all`}>

          <img src={assets.close} alt="" className='w-5 absolute right-4 top-4 sm:hidden ' onClick={()=> setSidebarOpen(false)}/>

            <a onClick={()=>setSidebarOpen(false)} href='#Home' className='sm:hover:border-b'>Home</a>
            <a onClick={()=>setSidebarOpen(false)} href='#Service' className='sm:hover:border-b'>Service</a>
            <a onClick={()=>setSidebarOpen(false)} href='#About' className='sm:hover:border-b'>About</a>
            <a onClick={()=>setSidebarOpen(false)} href='#Contact Us' className='sm:hover:border-b'>Contact Us</a>
        </div>

        <div className='flex items-center gap-2 sm:gap-2'>
          
          <Themetoggle theme={theme} setTheme={setTheme} />
          <img src={theme === 'dark' ? assets.bar : assets.bar} alt="" onClick={()=>setSidebarOpen(true)} className='w-8 sm:hidden'/>

            <a href="#" className='text-sm max-sm:hidden flex items-center bg-primary text-black px-6 py-2
        rounded-full cursor-pointer hover:scale-103 transition-all'>Login</a>
        </div>
    </div>
  )
}

export default Navbar