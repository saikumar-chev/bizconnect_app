import React, { useState, useEffect, useRef } from 'react';
import { AppView, RecentChat, User, AppNotification } from '../types';
import { LightbulbIcon, BriefcaseIcon, LogoIcon, HomeIcon, ChatAltIcon, BellIcon, LogoutIcon, UserCircleIcon, MenuIcon, XIcon } from './icons';
import GoogleSignInButton from './GoogleSignInButton';

interface HeaderProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  onPostChallengeClick: () => void;
  onPostIdeaClick: () => void;
  onOpenCreatePostModal: () => void;
  currentUser: User | null;
  onViewProfile: (user: User) => void;
  onLogout: () => void;
  recentChats: RecentChat[];
  onOpenRecentChat: (chat: RecentChat) => void;
  onLogin: (response: any) => void;
  googleClientId: string;
  notifications: AppNotification[];
  hasUnreadChats: boolean;
  hasUnreadNotifications: boolean;
  onMarkNotificationsAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    activeView, 
    setActiveView, 
    onPostChallengeClick, 
    onPostIdeaClick,
    onOpenCreatePostModal,
    currentUser,
    onViewProfile,
    onLogout,
    recentChats,
    onOpenRecentChat,
    onLogin,
    googleClientId,
    notifications,
    hasUnreadChats,
    hasUnreadNotifications,
    onMarkNotificationsAsRead,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setIsChatMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setIsNotificationMenuOpen(false);
      }
      // No need to check for mobile menu ref, as it's a full-screen overlay.
      // Clicking outside is handled by the overlay itself if we add that functionality,
      // but for now, it's closed with the 'X' button.
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getButtonClasses = (view: AppView) => {
    return `flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      activeView === view
        ? 'bg-slate-800 text-white'
        : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
    }`;
  };

  const renderActionButtons = (isMobile: boolean = false) => (
    <>
      {activeView === 'feed' && <button onClick={() => { onOpenCreatePostModal(); isMobile && setIsMobileMenuOpen(false); }} className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors w-full">New Post</button>}
      {activeView === 'problems' && <button onClick={() => { onPostChallengeClick(); isMobile && setIsMobileMenuOpen(false); }} className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors w-full">Post Challenge</button>}
      {activeView === 'ideas' && <button onClick={() => { onPostIdeaClick(); isMobile && setIsMobileMenuOpen(false); }} className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors w-full">Post Idea</button>}
    </>
  );


  return (
    <>
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveView('feed')}
              className="flex items-center space-x-2"
              aria-label="Back to homepage"
            >
                <LogoIcon className="h-8 w-8 text-slate-800"/>
                <span className="text-xl font-bold text-slate-800">BizConnect</span>
            </button>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('feed')}
              className={getButtonClasses('feed')}
              aria-pressed={activeView === 'feed'}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setActiveView('problems')}
              className={getButtonClasses('problems')}
              aria-pressed={activeView === 'problems'}
            >
              <BriefcaseIcon className="h-5 w-5" />
              <span>Challenges</span>
            </button>
            <button
              onClick={() => setActiveView('ideas')}
              className={getButtonClasses('ideas')}
              aria-pressed={activeView === 'ideas'}
            >
              <LightbulbIcon className="h-5 w-5" />
              <span>Ideas</span>
            </button>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {currentUser && (
              <div className="hidden md:block">
                {renderActionButtons()}
              </div>
            )}
            
            {/* Chat Dropdown */}
            {currentUser && (
              <div className="relative" ref={chatMenuRef}>
                <button
                  onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Open chats"
                >
                  <ChatAltIcon className="h-6 w-6" />
                  {hasUnreadChats && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>
                {isChatMenuOpen && (
                  <div className="fixed sm:absolute top-20 sm:top-auto sm:mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-[calc(100vw-2rem)] sm:w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-slate-900">Recent Chats</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {recentChats.length > 0 ? (
                        recentChats.map(chat => (
                          <button
                            key={chat.chatId}
                            onClick={() => { onOpenRecentChat(chat); setIsChatMenuOpen(false); }}
                            className="w-full text-left flex items-start px-4 py-3 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <img src={chat.otherParticipant.avatarUrl} alt={chat.otherParticipant.name} className="h-10 w-10 rounded-full mr-3 flex-shrink-0" />
                            <div className="flex-grow overflow-hidden">
                              <p className="font-semibold truncate">{chat.otherParticipant.name}</p>
                              <p className="text-xs text-slate-500 truncate">{chat.lastMessageText || `Chat about "${chat.item.title}"`}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center text-sm text-slate-500">
                          No recent chats.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell */}
            {currentUser && (
              <div className="relative" ref={notificationMenuRef}>
                <button
                  onClick={() => {
                    setIsNotificationMenuOpen(!isNotificationMenuOpen);
                    if (!isNotificationMenuOpen && hasUnreadNotifications) {
                      onMarkNotificationsAsRead();
                    }
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="View notifications"
                >
                  <BellIcon className="h-6 w-6" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>
                {isNotificationMenuOpen && (
                  <div className="fixed sm:absolute top-20 sm:top-auto sm:mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-[calc(100vw-2rem)] sm:w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-slate-900">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div key={notif.id} className="flex items-start px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">
                            <img src={notif.actor.avatarUrl} alt={notif.actor.name} className="h-10 w-10 rounded-full mr-3 flex-shrink-0" />
                            <div className="flex-grow">
                              <p>
                                <span className="font-semibold">{notif.actor.name}</span> {notif.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center text-sm text-slate-500">
                          No new notifications.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Dropdown */}
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 focus:outline-none">
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-9 w-9 rounded-full ring-2 ring-white hover:ring-slate-300 transition-all"/>
                  </button>
                  {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                      <div className="px-4 py-3 border-b">
                           <p className="text-sm font-medium text-slate-900 truncate">{currentUser.name}</p>
                           <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      </div>
                      <button onClick={() => { onViewProfile(currentUser); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem"><UserCircleIcon className="h-5 w-5 mr-3 text-slate-400" />View Profile</button>
                      <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem"><LogoutIcon className="h-5 w-5 mr-3 text-slate-400" />Logout</button>
                  </div>
                  )}
              </div>
            )}

            {/* Sign-in Button Container */}
            {!currentUser && (
              <GoogleSignInButton onLogin={onLogin} clientId={googleClientId} />
            )}

            {/* Mobile Menu Button */}
            {currentUser && (
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Open main menu"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <div className={`fixed inset-0 z-50 bg-white p-4 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden h-screen`}>
        <div className="flex justify-between items-center mb-8">
          <span className="text-xl font-bold text-slate-800">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2" aria-label="Close menu">
            <XIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => { setActiveView('feed'); setIsMobileMenuOpen(false); }}
            className="text-left text-lg font-medium text-slate-700 hover:text-slate-900 p-2 rounded-md hover:bg-slate-100"
          >
            Feed
          </button>
          <button
            onClick={() => { setActiveView('problems'); setIsMobileMenuOpen(false); }}
            className="text-left text-lg font-medium text-slate-700 hover:text-slate-900 p-2 rounded-md hover:bg-slate-100"
          >
            Challenges
          </button>
          <button
            onClick={() => { setActiveView('ideas'); setIsMobileMenuOpen(false); }}
            className="text-left text-lg font-medium text-slate-700 hover:text-slate-900 p-2 rounded-md hover:bg-slate-100"
          >
            Ideas
          </button>

          <div className="pt-4 border-t border-slate-200">
            {currentUser && (
              <div className="w-full">{renderActionButtons(true)}</div>
            )}
          </div>
        </div>
      </div>
    </> 
  );
};

export default Header;