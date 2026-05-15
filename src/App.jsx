import React, {useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx'
import Footer from './components/Footer.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CategoryPage from "./pages/CategoryPage";


const App = () => {

  const [theme, setTheme] = useState(localStorage.getItem('theme') ? 
  localStorage.getItem('theme') : 'light')

  return (
    <div className='dark:bg-black '>
      <Navbar theme={theme} setTheme={setTheme}/>
        <Home theme={theme}/>
      <Footer/>
      <BrowserRouter>
      <Routes>
        <Route path="/category/:categoryId" element={<CategoryPage />} />
      </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App