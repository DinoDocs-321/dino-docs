import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/route/PrivateRoute';
import Navbar from './components/navbar/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Homepage from './pages/homepage/homepage';
import BSONConverter from './pages/converter/BSONConverter';
import JSONConverter from './pages/converter/JSONConverter';
import Contact from './pages/contact/contact';
import SchemaEditor from './pages/schemaEditor/App';
import SchemaForm from './pages/SchemaForm/App';
import SignIn from './pages/signin/signin';
import SignUp from './pages/signup/signup'
import SignOut from './pages/signout/signout';
import NotFound from './pages/notfound/notfound';
import ForgotPassword from './pages/forgetpwd/forgetpwd';
import Generator from './pages/generate/generator';
import DomainGenerate from './pages/domainGenerate/domainGenerate';
import VerifyCode from './pages/VerifyCode/VerifyCode';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import DocsPage from './pages/docs/DocsPage';
import JSONSchemaDocs from'./pages/docs/JSONSchemaDocs'; 
import GettingStarted from'./pages/docs/GettingStarted'; 
import Converter from './pages/converter/converter';
import OldEditor from './pages/schemaEditor/works'
import About from './pages/about/App'


function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route
          path='/homepage'
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route path='/' element={<Homepage />} />
        <Route path='/BSONConverter' element={<BSONConverter />} />
        <Route path='/JSONConverter' element={<JSONConverter />} />
        <Route path='/converter' element={<Converter />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/schemaEditor' element={<SchemaEditor />} />
        <Route path='/schema-form' element={<SchemaForm />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/signout' element={<SignOut />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:uidb64/:token' element={<ResetPassword />} />
        <Route path='/generate' element={<Generator />} />
        <Route path='/oldeditor' element={<OldEditor />} />
        <Route path="/domain-generate" element={<DomainGenerate />} />
        <Route path='/verify-code' element={<VerifyCode />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/docs' element={<DocsPage />} />
        <Route path='/about' element={<About />} />
        <Route path='/jsonschema-docs' element={<JSONSchemaDocs />} />
        <Route path='/getting-started' element={<GettingStarted />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
}


export default App;
