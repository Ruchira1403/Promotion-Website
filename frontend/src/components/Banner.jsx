import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Img1 from '../assets/banner.jpg'; // Replace with your image paths
import Img2 from '../assets/banner2.jpg';
import Img3 from '../assets/banner3.jpg';
import Img4 from '../assets/banner4.jpg';

const Banner = () => {
  // Settings for the carousel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
  };

  // Banner data
  const banners = [
    {
      image: Img1,
      title: 'Full of Natural and Fresh Dairy Only',
      description:
        'Island Dairy Products is truly a Sri Lankan brand trusted by generations. We offer you a range of nutritious, quality, healthy dairies with the freshness and taste of fresh milk.',
      buttonText: 'VIEW ALL PRODUCTS',
    },
    {
      image: Img2,
      title: 'Premium Quality Dairy Products',
      description:
        'Experience the richness of our premium dairy products, crafted with care and tradition for your health and happiness.',
      buttonText: 'EXPLORE NOW',
    },
    {
      image: Img3,
      title: 'Healthy Living Starts Here',
      description:
        'Our dairy products are packed with essential nutrients to support a healthy and active lifestyle.',
      buttonText: 'SHOP NOW',
    },
    {
      image: Img4,
      title: 'Freshness Delivered to Your Doorstep',
      description:
        'Enjoy the convenience of fresh dairy products delivered straight to your home, ensuring quality and taste.',
      buttonText: 'ORDER NOW',
    },
  ];

  return (
    <Slider {...settings}>
      {banners.map((banner, index) => (
        <div key={index} className="relative text-black h-screen flex flex-col items-center justify-center">
          {/* Background Image */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={banner.image}
              alt={`Banner ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-3xl px-4">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
              {banner.title}
            </h2>
            <p className="mt-4 text-lg md:text-xl text-gray-300 drop-shadow-md">
              {banner.description}
            </p>
            <button className="mt-8 bg-red-600 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:bg-red-700 transition duration-300 transform hover:scale-105">
              {banner.buttonText}
            </button>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default Banner;