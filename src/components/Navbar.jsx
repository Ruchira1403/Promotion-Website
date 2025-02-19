import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import Logo from '../assets/Products/logo.png'; 

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full z-10 top-0">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link to="/">
          <img src={Logo} alt="Wishwa Products Logo" className="h-12" />
        </Link>

        {/* Menu */}
        <div className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">HOME</Link>
          <Link to="/aboutus" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">ABOUT US</Link>
          <Link to="/products" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">PRODUCTS</Link>
          <Link to="/gallery" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">GALLERY</Link>
          <Link to="/contactus" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">CONTACT US</Link>
          <Link to="/careers" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">CAREERS</Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <Link to="/" className="block py-2 px-4 text-gray-700 hover:bg-gray-100">HOME</Link>
          <Link to="/aboutus" className="block py-2 px-4 text-gray-700 hover:bg-gray-100">ABOUT US</Link>
          <Link to="/products" className="block py-2 px-4 text-gray-700 hover:bg-gray-100">PRODUCTS</Link>
          <Link to="/gallery" className="block py-2 px-4 text-gray-700 hover:bg-gray-100">GALLERY</Link>
          <Link to="/contactus" className="block py-2 px-4 text-gray-700 hover:bg-gray-100">CONTACT US</Link>
          <Link to="/careers" className="block py-2 px-4 text-gray-700 hover:bg-gray-100">CAREERS</Link>
        </div>
      )}
    </nav>
    
  );
};

export default Navbar;
