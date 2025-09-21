import React from 'react';
import { Idea, User } from '../types';
import { LightbulbIcon, TrashIcon } from './icons';
import { RewardInfo } from './RewardInfo';

interface IdeaCardProps {
  idea: Idea;
  currentUser: User | null;
  onOpenDetails: (idea: Idea) => void;
  onViewProfile: (user: User) => void;
  onDelete: (ideaId: string) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, currentUser, onOpenDetails, onViewProfile, onDelete }) => {
  const isOwner = currentUser?.userId === idea.postedBy.userId;
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-slate-200">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
            <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Idea
            </span>
            {isOwner && (
              <button
                onClick={() => onDelete(idea.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Delete idea"
              >
                <TrashIcon className="h-5 w-5" />
              </button>)}
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900">{idea.title}</h3>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed h-20 overflow-hidden">{idea.summary}</p>

        <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center text-slate-500">
                <LightbulbIcon className="h-5 w-5 mr-2 text-slate-400" />
                <span className="font-semibold text-slate-700">Innovative Concept</span>
            </div>
            <RewardInfo reward={idea.reward} />
        </div>
      </div>
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <button 
          onClick={() => onViewProfile(idea.postedBy)}
          className="flex items-center group focus:outline-none"
          aria-label={`View profile of ${idea.postedBy.name}`}
        >
            <img src={idea.postedBy.avatarUrl} alt={idea.postedBy.name} className="h-8 w-8 rounded-full mr-3 group-hover:ring-2 group-hover:ring-slate-300 transition-all" />
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{idea.postedBy.name}</span>
        </button>
        <button 
            onClick={() => onOpenDetails(idea)}
            className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800">
            View Details
        </button>
      </div>
    </div>
  );
};

export default IdeaCard;