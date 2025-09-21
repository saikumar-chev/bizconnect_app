import React from 'react';
import { BriefcaseIcon, LightbulbIcon, HomeIcon } from './icons';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-lg border border-slate-200">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900">About BizConnect</h1>
        <p className="mt-4 text-lg text-slate-600">
          Connecting innovators, problem-solvers, and entrepreneurs to build the future of business, together.
        </p>
      </div>
      
      <div className="space-y-6 text-slate-700 leading-relaxed">
        <p className="text-lg">
          <strong>BizConnect</strong> is a dynamic ecosystem designed to bridge the gap between business challenges and innovative solutions. Our platform empowers entrepreneurs, business owners, and skilled professionals to connect, collaborate, and grow together.
        </p>
        <p>
          Whether you're an established company facing a specific hurdle or an innovator with a groundbreaking idea, BizConnect provides the tools and the community to turn ambition into action.
        </p>

        <div className="!mt-10 pt-6 border-t border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center p-4">
                    <div className="flex-shrink-0 h-16 w-16 mb-4 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
                        <BriefcaseIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Solve Business Challenges</h3>
                        <p className="mt-2 text-sm text-slate-600">Post a business problem and receive practical solutions from a global network of experts. Offer rewards, equity, or a job to the best solver.</p>
                    </div>
                </div>
                 <div className="flex flex-col items-center p-4">
                    <div className="flex-shrink-0 h-16 w-16 mb-4 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        <LightbulbIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Discover & Share Ideas</h3>
                        <p className="mt-2 text-sm text-slate-600">Share your unique business idea and find partners, investors, or buyers. Browse a marketplace of innovative concepts.</p>
                    </div>
                </div>
                 <div className="flex flex-col items-center p-4">
                    <div className="flex-shrink-0 h-16 w-16 mb-4 flex items-center justify-center rounded-full bg-sky-100 text-sky-600">
                        <HomeIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Explore the Feed</h3>
                        <p className="mt-2 text-sm text-slate-600">Engage with a vibrant community. Share insights, ask questions, run polls, and stay up-to-date with the latest business trends.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <p className="!mt-10 pt-6 border-t border-slate-200 text-center text-lg">
            Our mission is to foster a collaborative environment where every challenge is an opportunity and every idea has the potential to flourish. <strong>Join BizConnect and be a part of the future of business.</strong>
        </p>
      </div>
    </div>
  );
};

export default AboutPage;