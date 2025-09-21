import React, { useEffect, useRef } from 'react';
import Modal from './Modal';
import { ChatMessage, Problem, Idea, User } from '../types';
import Spinner from './Spinner'; 
import { PaperPlaneIcon, XIcon } from './icons';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: { item: Problem | Idea; messages: ChatMessage[] } | null;
  currentUser: User | null;
  isLoading: boolean;
  onSendMessage: () => void;
  chatMessage: string;
  setChatMessage: (value: string) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  chat,
  currentUser,
  isLoading,
  onSendMessage,
  chatMessage,
  setChatMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const renderChatContent = () => (
    <>
      {isLoading && <div className="h-full flex items-center justify-center"><Spinner /></div>}
      {!isLoading && chat && currentUser && (
        <div className="flex flex-col h-full">
          {/* Header for mobile full-screen view */}
          <div className="md:hidden p-4 border-b bg-white flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center">
              <img src={chat.item.postedBy.avatarUrl} alt={chat.item.postedBy.name} className="h-10 w-10 rounded-full mr-3" />
              <div>
                <h3 className="font-semibold text-slate-800">{chat.item.postedBy.name}</h3>
                <p className="text-xs text-slate-500 truncate">Regarding: {chat.item.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800"><XIcon className="h-6 w-6" /></button>
          </div>

          <div className="flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto bg-slate-50">
            {chat.messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.sender.userId === currentUser.userId ? 'justify-end' : 'justify-start'}`}>
                {msg.sender.userId !== currentUser.userId && (
                  <img src={msg.sender.avatarUrl} alt={msg.sender.name} className="h-8 w-8 rounded-full flex-shrink-0" />
                )}
                <div className={`rounded-2xl p-3 max-w-xs sm:max-w-sm md:max-w-md shadow-sm ${msg.sender.userId === currentUser.userId ? 'bg-slate-800 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`}>
                  <p className="text-sm break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            {chat.messages.length === 0 && (
              <div className="text-center text-sm text-slate-400 py-8">Start the conversation about "{chat.item.title}" by sending a message.</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-white border-t sticky bottom-0">
            <form onSubmit={(e) => { e.preventDefault(); onSendMessage(); }} className="flex items-center space-x-3">
              <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type your message..." className="flex-grow px-4 py-2 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400" autoComplete="off" />
              <button type="submit" className="flex-shrink-0 bg-slate-800 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-slate-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed" disabled={!chatMessage.trim()} aria-label="Send message">
                <PaperPlaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Modal */}
      <div className="hidden md:block">
        <Modal isOpen={isOpen} onClose={onClose} title={`Chat with ${chat?.item.postedBy.name}`} size="lg">
          <div className="h-[70vh]">{renderChatContent()}</div>
        </Modal>
      </div>
      {/* Mobile Fullscreen View */}
      <div className={`md:hidden fixed inset-0 bg-white z-50 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} transition-transform duration-300 ease-in-out`}>
        {isOpen && renderChatContent()}
      </div>
    </>
  );
};

export default ChatModal;