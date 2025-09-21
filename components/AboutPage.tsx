import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">About BizConnect</h1>
      <div className="space-y-4 text-slate-600 leading-relaxed text-center">
        <p>
          Welcome to BizConnect, the premier platform where innovation meets opportunity. Our mission is to bridge the gap between brilliant minds with groundbreaking ideas and the real-world business challenges that need them most.
        </p>
        <p>
          In today's fast-paced world, countless entrepreneurs and innovators have transformative ideas but lack the resources or connections to bring them to life. Simultaneously, established businesses and startups face complex problems that could be solved with a fresh perspective. BizConnect was created to be the catalyst for these connections.
        </p>
        <p>
          Whether you are a business looking to solve a tough challenge, an innovator with a game-changing idea, or a professional seeking to collaborate on exciting projects, BizConnect provides the tools and the community to help you succeed. Join us in building the future of business, one connection at a time.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;