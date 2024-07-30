import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Homepage from './pages/homepage/homepage'
import Converter from './pages/converter/converter'
import Navbar from './components/navbar/navbar'
import Contact from './pages/contact/contact'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
         <Route path='/homepage' element={<Homepage />} />
         <Route path='/converter' element={<Converter />} />
         <Route path='/contact' element={<Contact />} />
      </Routes> 
    </div>
  );
}

export default App;