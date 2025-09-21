import React from 'react';
import { Problem, User } from '../types';
import { BriefcaseIcon, TrashIcon } from './icons';
import { RewardInfo } from './RewardInfo';

interface ProblemCardProps {
  problem: Problem;
  currentUser: User | null;
  onOpenDetails: (problem: Problem) => void;
  onViewProfile: (user: User) => void;
  onDelete: (problemId: string) => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, currentUser, onOpenDetails, onViewProfile, onDelete }) => {
  const isOwner = currentUser?.userId === problem.postedBy.userId;
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-slate-200">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
            <span className="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Challenge
            </span>
            {isOwner && (
              <button
                onClick={() => onDelete(problem.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Delete challenge"
              >
                <TrashIcon className="h-5 w-5" />
              </button>)}
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900">{problem.title}</h3>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed h-20 overflow-hidden">{problem.description}</p>
        
        <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center text-slate-500">
                <BriefcaseIcon className="h-5 w-5 mr-2 text-slate-400" />
                <span>Industry: <span className="font-semibold text-slate-700">{problem.industry}</span></span>
            </div>
            <RewardInfo reward={problem.reward} />
        </div>
      </div>
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <button 
          onClick={() => onViewProfile(problem.postedBy)}
          className="flex items-center group focus:outline-none"
          aria-label={`View profile of ${problem.postedBy.name}`}
        >
            <img src={problem.postedBy.avatarUrl} alt={problem.postedBy.name} className="h-8 w-8 rounded-full mr-3 group-hover:ring-2 group-hover:ring-slate-300 transition-all" />
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{problem.postedBy.name}</span>
        </button>
        <button 
            onClick={() => onOpenDetails(problem)}
            className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800">
            View Details
        </button>
      </div>
    </div>
  );
};

export default ProblemCard;