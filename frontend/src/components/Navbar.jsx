import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/Products/logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: "/", text: "HOME" },
    { path: "/aboutus", text: "ABOUT US" },
    { path: "/products", text: "PRODUCTS" },
    { path: "/gallery", text: "GALLERY" },
    { path: "/contactus", text: "CONTACT US" },
    { path: "/careers", text: "CAREERS" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg"
          : "bg-gradient-to-r from-green-600 to-green-400"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 max-w-[1400px] mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 transform transition hover:scale-105"
          >
            <img src={Logo} alt="Logo" className="h-14 w-auto" />
            <span
              className={`font-bold text-xl ${
                isScrolled ? "text-gray-800" : "text-white"
              }`}
            >
              Dairy 
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200
                  ${
                    isScrolled
                      ? isActive(link.path)
                        ? "text-green-600"
                        : "text-gray-600 hover:text-green-600"
                      : "text-white hover:text-green-200"
                  }
                  group
                `}
              >
                {link.text}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100
                    ${isScrolled ? "bg-green-600" : "bg-white"}
                  `}
                />
              </Link>
            ))}

            {/* Add this Cart link */}
            <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span
                    className={`text-sm font-medium ${
                      isScrolled ? "text-gray-600" : "text-white"
                    }`}
                  >
                    {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${
                isScrolled ? "text-gray-600" : "text-white"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium
                    ${
                      isActive(link.path)
                        ? "bg-green-100 text-green-600"
                        : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                    }
                  `}
                >
                  {link.text}
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              <div className="mt-4 space-y-2 pb-3">
                {user ? (
                  <>
                    <span className="block px-3 py-2 text-gray-600">
                      {user.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full px-3 py-2 text-center rounded-md bg-green-500 text-white hover:bg-green-600"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full px-3 py-2 text-center rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
