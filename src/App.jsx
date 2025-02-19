import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Aboutus from './components/Pages/Aboutus';
import ProductsDetails from './components/Pages/ProductsDetails';
import Gallery from './components/Pages/Gallery';
import ContactUs from './components/Pages/ContactUs';
import Careers from './components/Pages/Careers';
import Banner from './components/Banner'; 
import Footer from './components/Footer';
import AboutUs from './components/AboutUs'; 
import Products from './components/Products'; 
import OurValues from './components/OurValues'; 
import VisionMissionObjectives from './components/Pages/VisionMissionObjectives';


function App() {
  return (
    <Router>
      <div>
        <Navbar />

        <Routes>
          <Route path="/" element={
            <>
            <Banner />
            <AboutUs/>
            <Products/>
            <OurValues/>
            </>
            } />
          <Route path="/aboutus" element={
          <>
          <Aboutus/>
          <VisionMissionObjectives/>
          </>
        
        } />
          <Route path="/products" element={<ProductsDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/careers" element={<Careers />} />
          
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
