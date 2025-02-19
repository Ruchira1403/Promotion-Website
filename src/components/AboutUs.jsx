import React from 'react';

const AboutUs = () => {
  return (
    <section className="bg-white py-12 px-4 md:px-8">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">About Us</h2>
        <p className="text-gray-700 mb-4">
         Wishwa Products(PVT) Ltd. is a modern factory located in a beautiful surrounding area close to Colombo Kandy main road in Kegalle. 
          In recent times, our company has taken part in the process of buying milk from local farmers for the best possible prices. 
          It helps to uplift the country’s economy. 
          In the period of last 40 years, Island Dairy has become a first-class institution of dairy milk production, and we won multiple awards including ISO Standards. 
          Today, Island Dairy becomes a partner in increasing the country’s milk production.
        </p>
        <p className="text-gray-700 mb-6">
          Our company also provides opportunities for university students in agriculture, animal science, dairy science, food science, and other related degrees and diplomas. 
          wishwa product was founded by one person, and now it has become a big tree spreading out its branch network around the country, 
          and we provide so many direct and indirect job opportunities for thousands of people.
        </p>
        <a href="#" className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">
          READ MORE
        </a>
      </div>
    </section>
  );
};

export default AboutUs;