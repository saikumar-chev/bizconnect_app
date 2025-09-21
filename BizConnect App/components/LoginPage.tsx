import React from 'react';
import GoogleSignInButton from './GoogleSignInButton';
import { AppView } from '../types';
import { LogoIcon } from './icons';

interface LoginPageProps {
  onLogin: (response: any) => void;
  googleClientId: string;
  setView: (view: AppView) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, googleClientId, setView }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              <span className="block">Connect, Solve, and</span>
              <span className="block text-teal-400">Grow Your Business</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300/90">
              Tap into a global network of experts to solve your toughest challenges, or discover and purchase the next big business idea.
            </p>
          </div>
        </div>
      </div>

      {/* Login Box */}
      <div className="flex-grow flex flex-col justify-center items-center p-4 -mt-20">
        <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-lg text-center border border-slate-200/80">
          <div className="flex justify-center items-center mb-4">
            <LogoIcon className="h-10 w-10 text-slate-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-1 mb-8">Sign in to continue to BizConnect</p>
          <GoogleSignInButton onLogin={onLogin} clientId={googleClientId} />
        </div>
      </div>
      <footer className="text-center p-4 text-slate-500 text-xs">
        <div className="flex justify-center space-x-4 text-sm mb-2">
          <button onClick={() => setView('about')} className="hover:underline text-slate-600">About</button>
          <span className="text-slate-300">|</span>
          <button onClick={() => setView('terms')} className="hover:underline text-slate-600">Terms of Service</button>
          <span className="text-slate-300">|</span>
          <button onClick={() => setView('privacy')} className="hover:underline text-slate-600">Privacy Policy</button>
        </div>
        <p>&copy; {new Date().getFullYear()} BizConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;