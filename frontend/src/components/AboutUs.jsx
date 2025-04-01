import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaMedal, FaUsers, FaIndustry } from "react-icons/fa";

const AboutUs = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const stats = [
    {
      icon: <FaMedal className="text-4xl text-yellow-500" />,
      title: "40+ Years",
      description: "Of Excellence",
    },
    {
      icon: <FaUsers className="text-4xl text-orange-50" />,
      title: "1000+",
      description: "Local Farmers",
    },
    {
      icon: <FaIndustry className="text-4xl text-green-500" />,
      title: "ISO Certified",
      description: "Quality Standards",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl" ref={ref}>
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            About <span className="text-green-600">Wishwa Products</span>
          </h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-700 leading-relaxed">
              Wishwa Products(PVT) Ltd. is a modern dairy facility strategically
              located near the Colombo-Kandy main road in Kegalle, nestled in
              beautiful surroundings. Our commitment to supporting local farmers
              through competitive pricing has significantly contributed to the
              region's economic growth.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Over four decades, we've evolved into a premier dairy production
              institution, garnering multiple accolades including prestigious
              ISO certifications. Today, we're proud to be a key player in
              enhancing Sri Lanka's dairy production capacity.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We take pride in nurturing future talent by providing valuable
              opportunities to university students specializing in agriculture,
              animal science, dairy science, food science, and related fields.
              From humble beginnings with a single founder, Wishwa Products has
              grown into a nationwide network, creating thousands of direct and
              indirect employment opportunities.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-green-700 transition duration-300 shadow-md"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition duration-300"
            >
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {stat.title}
              </h3>
              <p className="text-gray-600">{stat.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
