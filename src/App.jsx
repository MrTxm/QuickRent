import React, { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx'
import Footer from './components/Footer.jsx'

const App = () => {

  const [theme, setTheme] = useState(localStorage.getItem('theme') ? 
  localStorage.getItem('theme') : 'light')

  return (
    <div className='dark:bg-black '>
      <Navbar theme={theme} setTheme={setTheme}/>
        <Home theme={theme}/>
      <Footer/>
    </div>
  )
}

export default App