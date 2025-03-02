import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import img1 from '../assets/Products/img1.png';
import img2 from '../assets/Products/img2.png';
import img3 from '../assets/Products/img3.png';

const OurValues = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Image animation variants
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-20 px-8 lg:px-16 overflow-hidden">
      <div 
        ref={ref} 
        className="max-w-7xl mx-auto flex flex-wrap justify-between items-start"
      >
        {/* Left Section (Text Content) */}
        <motion.div 
          className="w-full md:w-1/3 mb-12 md:mb-0 pr-8"
          initial="hidden"
          animate={controls}
          variants={textVariants}
        >
          <motion.h2 
            className="text-gray-800 text-5xl font-bold mb-6"
            variants={textVariants}
          >
            Our Values
          </motion.h2>
          <motion.h3 
            className="text-green-600 text-2xl font-semibold mb-6"
            variants={textVariants}
          >
            Dedicated Service
          </motion.h3>
          <motion.p 
            className="text-gray-600 text-lg leading-relaxed"
            variants={textVariants}
          >
            Indulge in our wholesome dairy offerings, made from natural and premium-quality ingredients, 
            entirely free from any harmful additives. We take pride in delivering excellence 
            through our commitment to quality and customer satisfaction.
          </motion.p>
          
          <motion.button
            className="mt-8 px-8 py-3 bg-green-600 text-white rounded-lg 
                     hover:bg-green-700 transition-colors duration-300
                     transform hover:scale-105 active:scale-95"
            variants={textVariants}
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Right Section (Images) */}
        <motion.div 
          className="w-full md:w-2/3 flex flex-col space-y-6"
          initial="hidden"
          animate={controls}
          variants={imageVariants}
        >
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            {/* Main Image */}
            <motion.div 
              className="w-full md:w-2/3 overflow-hidden rounded-2xl shadow-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={img1}
                alt="Main product showcase"
                className="w-full h-[400px] object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            {/* Side Images */}
            <div className="w-full md:w-1/3 flex flex-col space-y-6">
              <motion.div 
                className="overflow-hidden rounded-2xl shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={img2}
                  alt="Product detail view"
                  className="w-full h-[190px] object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
              
              <motion.div 
                className="overflow-hidden rounded-2xl shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={img3}
                  alt="Product in use"
                  className="w-full h-[190px] object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OurValues;