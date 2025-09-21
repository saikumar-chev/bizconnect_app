import React from 'react';
import Modal from './Modal';
import { User } from '../types';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: User[];
  onViewProfile: (user: User) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, title, users, onViewProfile }) => {
  const handleViewProfile = (user: User) => {
    onClose(); // Close this modal before opening the profile page
    onViewProfile(user);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="max-h-[60vh] overflow-y-auto">
        {users.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {users.map(user => (
              <button
                key={user.userId}
                onClick={() => handleViewProfile(user)}
                className="w-full text-left flex items-center p-4 hover:bg-slate-50 transition-colors"
              >
                <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full mr-4" />
                <span className="font-semibold text-slate-800">{user.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 p-8">No users to display.</p>
        )}
      </div>
    </Modal>
  );
};

export default UserListModal;