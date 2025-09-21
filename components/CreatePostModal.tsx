import React, { useState, useRef, ChangeEvent } from 'react';
import Modal from './Modal';
import { Poll, PollOption } from '../types';
import { PhotographIcon, ChartBarIcon } from './icons';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (postData: { 
    text: string; 
    imageUrl?: string; 
    poll?: { options: { text: string }[], durationDays: number } 
  }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onCreatePost }) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setText('');
    setImagePreview(null);
    setIsCreatingPoll(false);
    setPollOptions(['', '']);
    setPollDuration(1);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Please enter some text for your post.');
      return;
    }
    
    let pollData: { options: { text: string }[], durationDays: number } | undefined = undefined;
    if (isCreatingPoll) {
        const validOptions = pollOptions.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
            alert('A poll must have at least two options.');
            return;
        }
        pollData = {
            options: validOptions.map(optText => ({
                text: optText,
            })),
            durationDays: pollDuration,
        };
    }
    
    onCreatePost({ text, imageUrl: imagePreview || undefined, poll: pollData });
    handleClose();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsCreatingPoll(false); // Can't have both image and poll for simplicity
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const togglePollCreator = () => {
    setIsCreatingPoll(!isCreatingPoll);
    if (!isCreatingPoll) {
        setImagePreview(null); // Can't have both image and poll
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create a New Post" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <textarea
              id="post-text"
              name="text"
              rows={isCreatingPoll || imagePreview ? 3 : 6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border-none rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm transition-all"
              placeholder={isCreatingPoll ? "What is your poll question?" : "What's on your mind?"}
              required
            ></textarea>
          </div>

          {imagePreview && (
             <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg max-h-60 object-contain"/>
                <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-opacity-75"
                    aria-label="Remove image"
                >
                    &times;
                </button>
            </div>
          )}

          {isCreatingPoll && (
            <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
              <p className="font-semibold text-sm text-slate-700">Poll Options</p>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <input 
                        type="text"
                        value={option}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                        maxLength={50}
                    />
                    {pollOptions.length > 2 && (
                        <button type="button" onClick={() => removePollOption(index)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600" aria-label={`Remove option ${index + 1}`}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
              ))}
               {pollOptions.length < 4 && (
                 <button type="button" onClick={addPollOption} className="text-sm font-medium text-teal-600 hover:text-teal-800">Add option</button>
               )}
               <div className="pt-2">
                 <label htmlFor="poll-duration" className="block text-sm font-medium text-slate-700">Poll duration</label>
                 <select 
                    id="poll-duration"
                    value={pollDuration}
                    onChange={(e) => setPollDuration(Number(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md bg-white"
                 >
                    <option value={1}>1 Day</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days</option>
                 </select>
               </div>
            </div>
          )}

        </div>
        <div className="px-6 pb-4 flex justify-between items-center border-t pt-4">
             <div className="flex items-center space-x-2">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                 />
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700" aria-label="Add image">
                     <PhotographIcon className="h-6 w-6"/>
                 </button>
                 <button type="button" onClick={togglePollCreator} className={`p-2 rounded-full hover:bg-slate-100 ${isCreatingPoll ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:text-slate-700'}`} aria-label="Create poll">
                    <ChartBarIcon className="h-6 w-6" />
                 </button>
             </div>
             <div className="flex justify-end space-x-2">
                 <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 disabled:bg-slate-400"
                    disabled={!text.trim()}
                  >
                    Post
                  </button>
             </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;