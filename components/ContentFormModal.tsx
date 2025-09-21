import React from 'react';
import Modal from './Modal';

interface ContentFormModalProps {
  type: 'challenge' | 'idea';
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ContentFormModal: React.FC<ContentFormModalProps> = ({
  type,
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSubmit,
}) => {
  const isChallenge = type === 'challenge';

  const config = {
    title: isChallenge ? 'Post a New Challenge' : 'Post a New Idea',
    labels: {
      title: isChallenge ? 'Challenge Title' : 'Idea Title',
      shortDescription: isChallenge ? 'Short Description (for card view)' : 'Summary (for card view)',
    },
    placeholders: {
      title: isChallenge ? 'e.g., Increase user engagement' : 'e.g., AI-Powered Meal Planning App',
      shortDescription: isChallenge ? 'Describe the business problem in 1-2 sentences.' : 'Summarize your idea in 1-2 sentences.',
      detailedDescription: isChallenge
        ? 'Provide a more detailed explanation of the challenge (3-4 sentences).'
        : 'Provide a more detailed explanation of the idea, its features, and potential market.',
      rewardValue: {
        money: isChallenge ? '1,500' : '25,000',
        equity: isChallenge ? 'e.g., 5% Equity' : 'e.g., 10% Equity',
        job: isChallenge ? 'e.g., Lead Developer' : 'e.g., Co-founder',
        other: 'Describe the reward',
      },
    },
    shortDescriptionName: isChallenge ? 'description' : 'summary',
    submitButtonText: isChallenge ? 'Submit Challenge' : 'Submit Idea',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="lg">
      <form onSubmit={onSubmit}>
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">{config.labels.title}</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={onFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder={config.placeholders.title} required />
          </div>
          <div>
            <label htmlFor={config.shortDescriptionName} className="block text-sm font-medium text-slate-700">{config.labels.shortDescription}</label>
            <textarea id={config.shortDescriptionName} name={config.shortDescriptionName} value={formData[config.shortDescriptionName]} onChange={onFormChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder={config.placeholders.shortDescription} required></textarea>
          </div>
          <div>
            <label htmlFor="detailedDescription" className="block text-sm font-medium text-slate-700">Detailed Description</label>
            <textarea id="detailedDescription" name="detailedDescription" value={formData.detailedDescription} onChange={onFormChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder={config.placeholders.detailedDescription} required></textarea>
          </div>
          {isChallenge && (
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-700">Industry</label>
              <input type="text" id="industry" name="industry" value={formData.industry} onChange={onFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="e.g., SaaS" required />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rewardType" className="block text-sm font-medium text-slate-700">Reward Type</label>
              <select id="rewardType" name="rewardType" value={formData.rewardType} onChange={onFormChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md bg-white">
                <option value="money">Money</option>
                <option value="equity">Equity</option>
                <option value="job">Job Offer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="rewardValue" className="block text-sm font-medium text-slate-700">Reward Value</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                {formData.rewardType === 'money' && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 sm:text-sm">₹</span>
                  </div>
                )}
                <input
                  type="text"
                  id="rewardValue"
                  name="rewardValue"
                  value={formData.rewardValue}
                  onChange={onFormChange}
                  className={`block w-full rounded-md border-slate-300 py-2 pr-3 focus:border-slate-500 focus:ring-slate-500 sm:text-sm ${formData.rewardType === 'money' ? 'pl-7' : 'pl-3'}`}
                  placeholder={config.placeholders.rewardValue[formData.rewardType as keyof typeof config.placeholders.rewardValue]}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t">
          <button type="button" onClick={onClose} className="mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50">Cancel</button>
          <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700">{config.submitButtonText}</button>
        </div>
      </form>
    </Modal>
  );
};

export default ContentFormModal;