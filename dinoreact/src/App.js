import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Homepage from './pages/homepage/homepage'
import Converter from './pages/converter/converter'
import Navbar from './components/navbar/navbar'
import Contact from './pages/contact/contact'
import JSONEditor from './pages/jsoneditor/App'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/homepage' element={<Homepage />} />
        <Route path='/converter' element={<Converter />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/JSONEditor' element={<JSONEditor />} />
      </Routes> 
    </div>
  );
}

export default App;