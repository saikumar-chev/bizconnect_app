import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { User } from '../types';
import Modal from './Modal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedData: { name: string; bio: string; avatarUrl: string; }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name);
      setBio(user.bio || '');
      setAvatarPreview(user.avatarUrl);
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Name cannot be empty.");
        return;
    }
    onSave({ name, bio, avatarUrl: avatarPreview || (user ? user.avatarUrl : '') });
  };
  
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <img src={avatarPreview || ''} alt="Profile preview" className="h-20 w-20 rounded-full object-cover ring-2 ring-offset-2 ring-slate-200" />
            <div>
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/png, image/jpeg"
              />
              <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50"
              >
                  Change Picture
              </button>
              <p className="text-xs text-slate-500 mt-1">PNG or JPG.</p>
            </div>
          </div>
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="profile-bio" className="block text-sm font-medium text-slate-700">Bio</label>
            <textarea
              id="profile-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
              placeholder="Tell us a little about yourself..."
            ></textarea>
          </div>
        </div>
        <div className="bg-slate-50 px-4 py-3 sm:px-6 flex justify-end space-x-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
