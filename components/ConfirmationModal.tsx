import React from 'react';
import Modal from './Modal';
import { TrashIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <TrashIcon className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-slate-900">{title}</h3>
          <div className="mt-2">
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-3">
        <button type="button" onClick={onConfirm} className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 sm:w-auto sm:text-sm">
          Delete
        </button>
        <button type="button" onClick={onCancel} className="inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto sm:text-sm">
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;