import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HelloWorld from './HelloWorld'
import { useState } from 'react'
import Homepage from './pages/homepage/homepage'
import Converter from './pages/converter/converter'

function App() {
  return (
    <div>
      <Routes>
         <HelloWorld />
         <Route path='/homepage' element={<Homepage />} />
         <Route path='/converter' element={<Converter />} />
      </Routes> 
    </div>
  );
}

export default App;