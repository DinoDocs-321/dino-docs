import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Homepage from './pages/homepage/homepage';
import Converter from './pages/converter/converter';
import Contact from './pages/contact/contact';
import JSONEditor from './pages/jsoneditor/App';
import SchemaForm from './pages/SchemaForm/App';
import SignIn from './pages/signin/signin'
import SignUp from './pages/signup/signup'

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
        <Route path='/schema-form' element={<SchemaForm />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        {/* define path for url not found ! */}
      </Routes> 
    </div>
  );
}

export default App;
