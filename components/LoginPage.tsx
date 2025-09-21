import React from 'react';
import GoogleSignInButton from './GoogleSignInButton';
import { AppView } from '../types';
import { LogoIcon, BriefcaseIcon, LightbulbIcon, ChatAltIcon } from './icons';

interface LoginPageProps {
  onLogin: (response: any) => void;
  googleClientId: string;
  setView: (view: AppView) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, googleClientId, setView }) => {
  const features = [
    {
      icon: <BriefcaseIcon className="h-6 w-6 text-teal-300" />,
      title: "Solve Real-World Challenges",
      description: "Tackle business problems posted by companies and earn rewards for your solutions."
    },
    {
      icon: <LightbulbIcon className="h-6 w-6 text-teal-300" />,
      title: "Launch Your Next Big Idea",
      description: "Post your innovative ideas and connect with partners who can help bring them to life."
    },
    {
      icon: <ChatAltIcon className="h-6 w-6 text-teal-300" />,
      title: "Build Your Network",
      description: "Engage with a community of entrepreneurs, innovators, and business leaders."
    }
  ];

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Side: Branding & Features */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-white">
        <div>
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8 text-white"/>
            <span className="text-2xl font-bold">BizConnect</span>
          </div>
          <h1 className="mt-12 text-4xl font-bold tracking-tight">
            The place where great ideas meet great opportunities.
          </h1>
          <p className="mt-4 text-slate-300">
            Join a thriving ecosystem of innovators and businesses.
          </p>
        </div>
        <div className="space-y-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-slate-700/50 p-3 rounded-full">{feature.icon}</div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center items-center mb-6">
            <LogoIcon className="h-10 w-10 text-slate-700" />
          </div>
          <h2 className="text-center text-3xl font-bold text-slate-800">Sign in to your account</h2>
          <p className="text-center text-slate-500 mt-2 mb-8">Welcome back! Please enter your details.</p>
          <GoogleSignInButton onLogin={onLogin} clientId={googleClientId} />
          <div className="text-center mt-12 text-sm text-slate-500">
            <div className="flex justify-center space-x-4 mb-2">
              <button onClick={() => setView('about')} className="hover:underline">About</button>
              <button onClick={() => setView('terms')} className="hover:underline">Terms</button>
              <button onClick={() => setView('privacy')} className="hover:underline">Privacy</button>
            </div>
            <p>&copy; {new Date().getFullYear()} BizConnect. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;