import React from 'react';
import { Problem, User } from '../types';
import ProblemCard from './ProblemCard';

interface ProblemListProps {
  problems: Problem[];
  currentUser: User | null;
  onOpenDetails: (problem: Problem) => void;
  onViewProfile: (user: User) => void;
  onDeleteChallenge: (problemId: string) => void;
}

const ProblemList: React.FC<ProblemListProps> = ({ problems, currentUser, onOpenDetails, onViewProfile, onDeleteChallenge }) => {
  if (problems.length === 0) {
    return <p className="text-center text-slate-500">No matching challenges found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} currentUser={currentUser} onOpenDetails={onOpenDetails} onViewProfile={onViewProfile} onDelete={onDeleteChallenge} />
      ))}
    </div>
  );
};

export default ProblemList;