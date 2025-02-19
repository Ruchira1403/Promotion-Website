import React from 'react';
import Img1 from '../assets/banner.jpg';

const Banner = () => {
  return (
    <div className="relative text-black h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-700 via-gray-900 to-black">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={Img1}
          alt="Dairy Products"
          className="object-cover w-full h-full opacity-40"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-4">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
          Full of Natural and Fresh Dairy Only
        </h2>
        <p className="mt-4 text-lg md:text-xl text-gray-300 drop-shadow-md">
          Island Dairy Products is truly a Sri Lankan brand trusted by generations. We offer you a range of nutritious, quality, healthy dairies with the freshness and taste of fresh milk.
        </p>
        <button className="mt-8 bg-red-600 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:bg-red-700 transition duration-300 transform hover:scale-105">
          VIEW ALL PRODUCTS
        </button>
      </div>
    </div>
  );
};

export default Banner;
