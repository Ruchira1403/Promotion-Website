import React from 'react';

const VisionMissionObjectives = () => {
  return (
    <section className="bg-blue-100 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Vision */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Vision</h2>
          <p className="text-xl text-gray-700">
            To become the leading milk products production company in the year of 2030.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 ">Mission</h2>
          <p className="text-xl text-gray-700">
            Promoting local dairy farmers and providing high-quality milk products to the people of Sri Lanka.
          </p>
        </div>

        {/* Objectives */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 ">Objectives</h2>
          <div className="text-center text-xl text-gray-700 space-y-4  ">
            <p>Encouraging milk farmers by giving maximum price in favor of the island milk farmer.</p>
            <p>Providing high-quality dairy products to the people of Sri Lanka.</p>
            <p>Creating opportunities to drink fresh milk to nourish the Sri Lankan people.</p>
            <p>Establishing dairy villages in rural areas and creating employment opportunities.</p>
            <p>To build a healthy generation through best quality products & make Sri Lanka prosperous.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionObjectives;
