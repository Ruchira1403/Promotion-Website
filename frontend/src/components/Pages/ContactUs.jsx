import React, { useState } from 'react';
import api from '../../utils/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/contact/send-email', formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold mb-6">Contact us</h1>
      <p className="text-center text-gray-600 mb-8 px-4">
        Have a question or need assistance? We are here to help with anything you need! Please fill out the form below or e-mail us at <span className="text-blue-500">islanddairies.info@gmail.com</span> and we will get back to you promptly regarding your request.
      </p>
      
      <div className="bg-teal-500 p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Get in touch with us</h2>
        <h3 className="text-lg text-white mb-4">Say hello.</h3>
        
        {success && (
          <div className="bg-green-200 text-green-800 p-4 rounded-md mb-4">
            Thank you for your message! We'll get back to you soon.
          </div>
        )}
        
        {error && (
          <div className="bg-red-200 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail Address"
            className="w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Contact No"
            className="w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={formData.phone}
            onChange={handleChange}
          />
          <textarea
            name="message"
            placeholder="Message"
            className="w-full p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition duration-200 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : 'Submit'}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center px-4">
        <h2 className="text-lg font-semibold">Head Office</h2>
        <p className="text-gray-700">Wishwa Diary (Pvt) Ltd.</p>
        <p className="text-gray-700">No. 645, Ranwala, Kegalle, Sri Lanka. 7100.</p>
        <p className="text-gray-700">035 4932424</p>
        <p className="text-gray-700">wishwadiary.info@gmail.com</p>
        <p className="text-gray-700">wishwadiary.ofc@gmail.com</p>
        
        <div className="mt-4 w-full max-w-md mx-auto">
          <iframe
            title="map"
            className="w-full rounded-lg shadow-md"
            height="300"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.789174715675!2d80.3961!3d7.2479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae1b5e7e6481e1f%3A0x3ecb2f2b3d8e4e2!2sIsland%20Dairies%20(PVT)%20LTD!5e0!3m2!1sen!2slk!4v1613500000000!5m2!1sen!2slk"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          />
        </div>
      </div>

      <footer className="mt-8">
        <p>Follow Us</p>
        {/* Social media icons can be added here */}
      </footer>
    </div>
  );
};

export default ContactUs;