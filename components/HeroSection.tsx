
import React from 'react';

interface HeroSectionProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="bg-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            <span className="block">Connect, Solve, and</span>
            <span className="block text-teal-400">Grow Your Business</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
            Tap into a global network of experts to solve your toughest challenges, or discover and purchase the next big business idea.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-md">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search for challenges or ideas..."
                  className="w-full pl-4 pr-12 py-3 rounded-full bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  value={searchTerm}
                  onChange={onSearchChange}
                  aria-label="Search for challenges or ideas"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
