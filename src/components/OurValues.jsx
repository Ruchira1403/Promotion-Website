import React from 'react';
import img1 from '../assets/Products/img1.png'; // Replace with your image paths
import img2 from '../assets/Products/img2.png';
import img3 from '../assets/Products/img3.png';

const OurValues = () => {
  return (
    <div className="bg-white py-16 px-8 lg:px-16">
      <div className="flex flex-wrap justify-between items-start">
        
        {/* Left Section (Text Content) */}
        <div className="w-full md:w-1/3 mb-8 md:mb-0">
          <h2 className="text-gray-800 text-4xl font-bold mb-4">Our Values</h2>
          <h3 className="text-blue-600 text-xl font-semibold mb-4">Dedicated Service</h3>
          <p className="text-gray-600 leading-relaxed">
            Indulge in our wholesome dairy offerings, made from natural and premium-quality ingredients, 
            entirely free from any harmful additives.
          </p>
        </div>

        {/* Right Section (Images) */}
        <div className="w-full md:w-2/3 flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">

            {/* Main Image */}
            <div className="w-full md:w-2/3">
              <img
                src={img1}
                alt="Main product"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Top-right and Bottom-right Images */}
            <div className="w-full md:w-1/3 flex flex-col space-y-4">
              <img
                src={img2}
                alt="Top right product"
                className="w-full h-1/2 object-cover rounded-lg"
              />
              <img
                src={img3}
                alt="Bottom right product"
                className="w-full h-1/2 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurValues;