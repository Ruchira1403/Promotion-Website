import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import Logo from '../assets/Products/logo.png'; 

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white py-10">
     

       

        {/* Contact Information */}
        <div className="text-center mb-8 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Wishwa Product (PVT) LTD.</h3>
          <p className="flex items-center justify-center mb-2">
            <FaMapMarkerAlt className="mr-2" />
            No. 645, Colombo Road, Ranwala, Kegalle, 71000, Sri Lanka.
          </p>
          <p className="flex items-center justify-center mb-2">
            <FaPhoneAlt className="mr-2" />
            Telephone: +94 35 493424
          </p>
          <p className="flex items-center justify-center mb-2">
            <FaPhoneAlt className="mr-2" />
            Hotline: +94 777 730061
          </p>
          <p className="flex items-center justify-center mb-4">
            <FaEnvelope className="mr-2" />
            Email: <a href="mailto:islanddairies.info@gmail.com" className="underline">islanddairies.info@gmail.com</a>
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center mb-8">
          <a href="#" className="mx-2 text-white hover:text-gray-300 transition-colors duration-300">
            <FaFacebookF size="2em" />
          </a>
          <a href="#" className="mx-2 text-white hover:text-gray-300 transition-colors duration-300">
            <FaTwitter size="2em" />
          </a>
          <a href="#" className="mx-2 text-white hover:text-gray-300 transition-colors duration-300">
            <FaInstagram size="2em" />
          </a>
        </div>

        
    </footer>
  );
};

export default Footer;