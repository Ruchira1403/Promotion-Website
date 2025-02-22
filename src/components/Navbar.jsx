import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/Products/logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full fixed z-10 top-0 bg-gradient-to-r from-green-600 via-green-500 to-green-400 shadow-xl">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="transform transition-transform duration-300 hover:scale-110">
            <img src={Logo} alt="Wishwa Products Logo" className="h-16 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {[
              { path: "/", text: "HOME" },
              { path: "/aboutus", text: "ABOUT US" },
              { path: "/products", text: "PRODUCTS" },
              { path: "/gallery", text: "GALLERY" },
              { path: "/contactus", text: "CONTACT US" },
              { path: "/careers", text: "CAREERS" }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-white font-semibold tracking-wide py-2 px-4 transition-all duration-300 hover:text-green-100 group"
              >
                {item.text}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-green-100 transition-colors duration-300 focus:outline-none"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white rounded-b-lg shadow-lg overflow-hidden">
            {[
              { path: "/", text: "HOME" },
              { path: "/aboutus", text: "ABOUT US" },
              { path: "/products", text: "PRODUCTS" },
              { path: "/gallery", text: "GALLERY" },
              { path: "/contactus", text: "CONTACT US" },
              { path: "/careers", text: "CAREERS" }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block py-3 px-6 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-300 border-b border-gray-100 last:border-none"
              >
                {item.text}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;