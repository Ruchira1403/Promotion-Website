import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import img1 from '../assets/Products/img1.png';
import img2 from '../assets/Products/img2.png';
import img3 from '../assets/Products/img3.png';
import img4 from '../assets/Products/img4.png';
import img5 from '../assets/Products/img5.png';
import img6 from '../assets/Products/img6.png';
import img7 from '../assets/Products/img7.png';

const products = [
  { image: img1, name: 'Curd 950ml', size: '950ml' },
  { image: img2, name: 'Strawberry Drinking Yoghurt', size: '200 ml' },
  { image: img3, name: 'Mango Drinking Yoghurt', size: '200 ml' },
  { image: img4, name: 'Orange Flavoured Drink', size: '200 ml' },
  { image: img5, name: 'Vanilla Drinking Yoghurt', size: '200 ml' },
  { image: img6, name: 'Chocolate Drinking Yoghurt', size: '200 ml' },
  { image: img7, name: 'Pineapple Flavoured Drink', size: '200 ml' },
];

const ProductShowcase = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '20px',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          centerPadding: '10px',
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerPadding: '10px',
        },
      },
    ],
  };

  return (
    <div className="bg-blue-500 p-10">
      <h1 className="text-white text-2xl font-bold text-center mb-8">Our Products</h1>
      
      <Slider {...settings} className="slick-slider">
        {products.map((product, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center mx-4">
            <div className="w-full h-36 flex items-center justify-center mb-4">
              <img src={product.image} alt={product.name} className="max-h-full  w-[20] object-contain" />
            </div>
            <h2 className="text-lg font-semibold text-center">{product.name}</h2>
            <p className="text-gray-600 text-center">{product.size}</p>
            <div className="text-center mt-4">
              <button className="bg-blue-600 text-white py-2 px-4 rounded-full">
                View More
              </button>
            </div>
          </div>
        ))}
      </Slider>
      
      <div className="text-center mt-8">
        <button className="bg-red-500 text-white py-2 px-4 rounded-full">
          View All Products
        </button>
      </div>
    </div>
  );
};

export default ProductShowcase;