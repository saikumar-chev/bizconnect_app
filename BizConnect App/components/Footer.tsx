import React from 'react';
import { LogoIcon } from './icons';

interface FooterProps {
  onNavigateToAbout: () => void;
  onNavigateToContact: () => void;
  onNavigateToTerms: () => void;
  onNavigateToPrivacy: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigateToAbout, onNavigateToContact, onNavigateToTerms, onNavigateToPrivacy }) => {
  const footerLinks = [
    { name: 'About', handler: onNavigateToAbout },
    { name: 'Contact', handler: onNavigateToContact },
    { name: 'Terms of Service', handler: onNavigateToTerms },
    { name: 'Privacy Policy', handler: onNavigateToPrivacy },
  ];
  
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <LogoIcon className="h-6 w-6 text-white"/>
            <span className="text-lg font-semibold text-white">BizConnect</span>
          </div>
          <div className="flex space-x-6">
            {footerLinks.map(link => (
              <button key={link.name} onClick={link.handler} className="text-sm hover:text-white transition-colors">
                {link.name}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-6 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} BizConnect. All rights reserved. Built for a brighter business future.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;