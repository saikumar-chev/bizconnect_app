import React from 'react';
import { Idea, User } from '../types';
import IdeaCard from './IdeaCard';

interface IdeaListProps {
  ideas: Idea[];
  currentUser: User | null;
  onOpenDetails: (idea: Idea) => void;
  onViewProfile: (user: User) => void;
  onDeleteIdea: (ideaId: string) => void;
}

const IdeaList: React.FC<IdeaListProps> = ({ ideas, currentUser, onOpenDetails, onViewProfile, onDeleteIdea }) => {
  if (ideas.length === 0) {
    return <p className="text-center text-slate-500">No matching ideas found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} currentUser={currentUser} onOpenDetails={onOpenDetails} onViewProfile={onViewProfile} onDelete={onDeleteIdea} />
      ))}
    </div>
  );
};

export default IdeaList;