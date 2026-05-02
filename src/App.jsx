import React, { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx'

const App = () => {

  const [theme, setTheme] = useState(localStorage.getItem('theme') ? 
  localStorage.getItem('theme') : 'light')

  return (
    <div className='dark:bg-black '>
      <Navbar theme={theme} setTheme={setTheme}/>
      <div className='mt-20'>
        <Home theme={theme}/>
      </div>
    </div>
  )
}

export default App