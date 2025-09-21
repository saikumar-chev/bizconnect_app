import React from 'react';
import { Problem, Idea, User } from '../types';
import Modal from './Modal';
import { BriefcaseIcon, LightbulbIcon } from './icons';
import { RewardInfo } from './RewardInfo';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Problem | Idea | null;
  onStartChat: (item: Problem | Idea) => void;
  currentUser: User | null;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, item, onStartChat, currentUser }) => {
  if (!item) return null;

  const isProblem = 'industry' in item;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Details" size="lg">
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${isProblem ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'}`}>
            {isProblem ? 'Challenge' : 'Idea'}
        </span>
        <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>
        <p className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
            {item.detailedDescription}
        </p>
        <div className="!mt-6 pt-4 border-t border-slate-200 text-sm text-slate-600 space-y-3">
            {isProblem ? (
                <>
                    <div className="flex items-center">
                        <BriefcaseIcon className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0" />
                        <span>Industry: <span className="font-semibold text-slate-800">{item.industry}</span></span>
                    </div>
                    <RewardInfo reward={item.reward} />
                </>
            ) : (
                <>
                    <div className="flex items-center">
                        <LightbulbIcon className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-800">Innovative Concept</span>
                    </div>
                    <RewardInfo reward={item.reward} />
                </>
            )}
        </div>
      </div>
      <div className="bg-slate-50 px-4 py-3 sm:px-6 flex justify-between items-center border-t">
        <div className="flex items-center">
            <img src={item.postedBy.avatarUrl} alt={item.postedBy.name} className="h-8 w-8 rounded-full mr-3" />
            <div>
                <p className="text-sm font-medium text-slate-800">{item.postedBy.name}</p>
                <p className="text-xs text-slate-500">Posted {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        {currentUser && currentUser.userId !== item.postedBy.userId && (
            <button
              type="button"
              onClick={() => onStartChat(item)}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700"
            >
              {isProblem ? 'Offer Solution' : 'Discuss Idea'}
            </button>
        )}
      </div>
    </Modal>
  );
};

export default DetailsModal;