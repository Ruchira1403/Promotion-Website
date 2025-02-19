import React from 'react';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold mb-6">Contact us</h1>
      <p className="text-center text-gray-600 mb-8">
        Have a question or need assistance? We are here to help with anything you need! Please fill out the form below or e-mail us at <span className="text-blue-500">islanddairies.info@gmail.com</span> and we will get back to you promptly regarding your request.
      </p>
      
      <div className="bg-teal-500 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-4">Get in touch with us</h2>
        <h3 className="text-lg text-white mb-4">Say hello.</h3>
        
        <form>
          <input
            type="text"
            placeholder="Name"
            className="w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="email"
            placeholder="E-mail Address"
            className="w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="tel"
            placeholder="Contact No"
            className="w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <textarea
            placeholder="Message"
            className="w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows="4"
          />
          <button
            type="submit"
            className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-lg font-semibold">Head Office</h2>
        <p className="text-gray-700">Island Dairies (Pvt) Ltd.</p>
        <p className="text-gray-700">No. 645, Ranwala, Kegalle, Sri Lanka. 7100.</p>
        <p className="text-gray-700">035 4932424</p>
        <p className="text-gray-700">islanddairies.info@gmail.com</p>
        <p className="text-gray-700">islanddairies.ofc@gmail.com</p>
        
        {/* You can embed a Google Map here */}
        <div className="mt-4">
          <iframe
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.789174715675!2d80.3961!3d7.2479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae1b5e7e6481e1f%3A0x3ecb2f2b3d8e4e2!2sIsland%20Dairies%20(PVT)%20LTD!5e0!3m2!1sen!2slk!4v1613500000000!5m2!1sen!2slk"
            width="400"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          />
        </div>
      </div>

      <footer className="mt-8">
        <p>Follow Us</p>
        {/* Add social media icons/links here */}
      </footer>
    </div>
  );
};

export default ContactUs;