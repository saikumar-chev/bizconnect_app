import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Problem, Idea, AppView, User, Post, Comment, Poll, ChatMessage, RecentChat, AppNotification } from './types';
import { supabase } from './services/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProblemList from './components/ProblemList';
import IdeaList from './components/IdeaList';
import Feed from './components/Feed';
import Footer from './components/Footer'; 
import Spinner from './components/Spinner'; 
import CreatePostModal from './components/CreatePostModal';
import EditProfileModal from './components/EditProfileModal';
import ChatModal from './components/ChatModal';
import DetailsModal from './components/DetailsModal';
import ContentFormModal from './components/ContentFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import ProfilePage from './components/ProfilePage';
import UserListModal from './components/UserListModal';
import LoginPage from './components/LoginPage';
import { useAuth } from './useAuth';



// Access the Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App: React.FC = () => {
  // --- App State ---
  const [users, setUsers] = useState<User[]>([]);
  const [view, setView] = useState<AppView>('feed');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Modal & Interactivity State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isPostChallengeModalOpen, setPostChallengeModalOpen] = useState(false);
  const [isPostIdeaModalOpen, setPostIdeaModalOpen] = useState(false);
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [userListModal, setUserListModal] = useState<{ isOpen: boolean; title: string; users: User[] }>({ isOpen: false, title: '', users: [] });
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<Problem | Idea | null>(null);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // --- Form State ---
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', detailedDescription: '', industry: '', rewardType: 'money', rewardValue: '' });
  const [newIdea, setNewIdea] = useState({ title: '', summary: '', detailedDescription: '', rewardType: 'money', rewardValue: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', contact: '', subject: '', description: '' });
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
  // --- Chat State ---
  const [selectedChat, setSelectedChat] = useState<{ item: Problem | Idea, messages: ChatMessage[], chatId: string } | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [userChatIds, setUserChatIds] = useState<Set<string>>(new Set());

  // Ref to hold the latest chat state to avoid stale closures in subscriptions
  const chatStateRef = useRef({ isChatModalOpen, selectedChat });
  useEffect(() => {
    chatStateRef.current = { isChatModalOpen, selectedChat };
  });
  
  // --- Custom Hooks ---
  const { currentUser, setCurrentUser, onLogin } = useAuth(users);

  // Ref to hold the latest state for use in subscriptions, preventing stale closures.
  const stateRef = useRef({ users, posts, currentUser, userChatIds, problems, ideas, recentChats });
  useEffect(() => {
    stateRef.current = { users, posts, currentUser, userChatIds, problems, ideas, recentChats };
  }, [users, posts, currentUser, userChatIds, problems, ideas, recentChats]);


  // --- Effects ---

  // --- Data Fetching and Processing ---
  const processUsers = (usersData: any[]): { userMap: Map<string, User>, allUsers: User[] } => {
    const allUsers = (usersData || []).map(u => ({
        userId: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarurl,
        bio: u.bio,
    })) as User[];
    const userMap = new Map(allUsers.map(u => [u.userId, u]));
    return { userMap, allUsers };
  };

  const processComments = (commentsData: any[], userMap: Map<string, User>): Map<string, Comment[]> => {
    const commentsByPostId = new Map<string, Comment[]>();
    (commentsData || []).forEach(comment => {
        const author = userMap.get(comment.user_id);
        if (author) {
            const postComments = commentsByPostId.get(comment.postid) || [];
            postComments.push({ ...comment, id: comment.commentid, postedBy: author, createdAt: new Date(comment.createdat) });
            commentsByPostId.set(comment.postid, postComments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
        }
    });
    return commentsByPostId;
  };

  const processLikes = (likesData: any[]): Map<string, string[]> => {
    const likesByPostId = new Map<string, string[]>();
    (likesData || []).forEach(like => {
        const postLikes = likesByPostId.get(like.postid) || [];
        postLikes.push(like.user_id);
        likesByPostId.set(like.postid, postLikes);
    });
    return likesByPostId;
  };

  function assembleContent<T>(
    items: any[],
    userMap: Map<string, User>,
    idField: string,
    postedByField: string,
    assembler: (item: any, author: User) => T
  ): T[] {
    return items
      .map(item => {
        const author = userMap.get(item[postedByField]);
        if (!author) return null;
        const baseItem = { ...item, id: item[idField], postedBy: author, createdAt: new Date(item.createdat) };
        return assembler(baseItem, author);
      })
      .filter(Boolean) as T[];
  }

  // Effect to fetch all public data on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel
        const [usersResponse, challengesResponse, ideasResponse, postsResponse, commentsResponse, likesResponse, pollsResponse, pollOptionsResponse, pollVotesResponse] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('challenges').select('*'),
          supabase.from('ideas').select('*'),
          supabase.from('posts').select('*'),
          supabase.from('comments').select('*'),
          supabase.from('likes').select('*'),
          supabase.from('polls').select('*'),
          supabase.from('poll_options').select('*'),
          supabase.from('poll_votes').select('*'),
        ]);

        // Check for errors in responses
        const responses = { usersResponse, challengesResponse, ideasResponse, postsResponse, commentsResponse, likesResponse, pollsResponse, pollOptionsResponse, pollVotesResponse };
        for (const [key, response] of Object.entries(responses)) {
          if (response.error) throw new Error(`Failed to fetch ${key.replace('Response', '')}: ${response.error.message}`);
        }

        // Process and assemble data
        const { userMap, allUsers } = processUsers(usersResponse.data || []);
        const commentsByPostId = processComments(commentsResponse.data || [], userMap);
        const likesByPostId = processLikes(likesResponse.data || []);

        // Process Polls
        const votesByOptionId = new Map<string, string[]>();
        (pollVotesResponse.data || []).forEach(vote => {
            const votes = votesByOptionId.get(vote.optionid) || [];
            votes.push(vote.user_id);
            votesByOptionId.set(vote.optionid, votes);
        });
        const optionsByPollId = new Map<string, any[]>();
        (pollOptionsResponse.data || []).forEach(option => {
            const pollOptions = optionsByPollId.get(option.pollid) || [];
            pollOptions.push({ id: option.optionid, text: option.text, votes: votesByOptionId.get(option.optionid) || [] });
            optionsByPollId.set(option.pollid, pollOptions);
        });
        const pollsByPostId = new Map<string, Poll>();
        (pollsResponse.data || []).forEach(poll => {
            pollsByPostId.set(poll.postid, { id: poll.pollid, options: optionsByPollId.get(poll.pollid) || []});
        });

        const loadedPosts = assembleContent(postsResponse.data || [], userMap, 'postid', 'user_id', (item) => ({
          ...item,
          imageUrl: item.imageurl,
          comments: commentsByPostId.get(item.postid) || [],
          likes: likesByPostId.get(item.postid) || [],
          poll: pollsByPostId.get(item.postid) || null,
        }));

        const loadedProblems = assembleContent(challengesResponse.data || [], userMap, 'challengeid', 'user_id', (item) => ({
          ...item,
          title: item.title, description: item.description, detailedDescription: item.detaileddescription, industry: item.industry,
          reward: { type: item.rewardtype, value: item.rewardvalue },
          chatHistory: [],
        }));

        const loadedIdeas = assembleContent(ideasResponse.data || [], userMap, 'ideaid', 'user_id', (item) => ({
          ...item,
          title: item.title, summary: item.summary, detailedDescription: item.detaileddescription,
          reward: { type: item.rewardtype, value: item.rewardvalue },
          chatHistory: [],
        }));

        // Set state
        setProblems(loadedProblems);
        setIdeas(loadedIdeas);
        setPosts(loadedPosts);
        setUsers(allUsers);
        
        // Restore user from local storage AFTER all other state is set
        const storedUser = localStorage.getItem('bizconnect_user');
        if (storedUser) {
            const parsedUser: { email: string } = JSON.parse(storedUser);
            // Find the full, fresh user object from the fetched data using the stored email.
            const freshUser = allUsers.find(u => u.email === parsedUser.email);

            if (freshUser) {
                // If found, set this fresh user as the current user.
                setCurrentUser(freshUser);
                // Also, update localStorage with the fresh data to prevent future mismatches.
                localStorage.setItem('bizconnect_user', JSON.stringify(freshUser));
            } else {
                // If the user from localStorage doesn't exist in the database, log them out.
                localStorage.removeItem('bizconnect_user');
            }
        }
      } catch (e: any) {
          setError("Failed to load initial data: " + e.message);
      } finally {
          setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // --- Auth Handlers ---
  // Effect to fetch user-specific data (notifications, chats) when the user logs in or out.
  useEffect(() => {
    // This guard is crucial. It prevents this hook from running on initial render
    // before the main data is loaded, or if the user is not logged in.
    // It ensures we only fetch user data when we have a user AND the public data is ready.
    if (!currentUser || isLoading) {
      // Clear user-specific data on logout or if global data isn't ready
      setNotifications([]);
      setRecentChats([]);
      setUserChatIds(new Set());
      return;
    }

    const fetchUserData = async () => {
      const [notificationsResponse, chatsResponse, chatParticipantsResponse, chatMessagesResponse] = await Promise.all([
        supabase.from('notifications').select('*').eq('user_id', currentUser.userId).order('createdat', { ascending: false }).limit(20),
        supabase.from('chats').select('*'),
        supabase.from('chat_participants').select('*'),
        supabase.from('chat_messages').select('*'),
      ]);

      // Process Notifications
      const userMap = new Map(users.map(u => [u.userId, u]));
      if (notificationsResponse.data) {
        const userNotifications = (notificationsResponse.data)
          .map(n => {
            const actor = userMap.get(n.actor_id);
            if (!actor) return null;
            return {
              id: n.id, actor, message: n.message,
              createdAt: new Date(n.createdat), seen: n.seen,
            };
          }).filter(Boolean) as AppNotification[];
        setNotifications(userNotifications);
      }

      // Process Recent Chats
      if (chatParticipantsResponse.data && chatsResponse.data && chatMessagesResponse.data) {
        const userChatIds = new Set((chatParticipantsResponse.data).filter(p => p.user_id === currentUser.userId).map(p => p.chatid));
        setUserChatIds(userChatIds);

        const lastMessages = new Map<string, any>();
        (chatMessagesResponse.data).forEach(msg => {
          if (userChatIds.has(msg.chatid) && (!lastMessages.has(msg.chatid) || new Date(msg.createdat) > new Date(lastMessages.get(msg.chatid).createdat))) {
            lastMessages.set(msg.chatid, msg);
          }
        });

        const contentMap = new Map([...problems, ...ideas].map(item => [item.id, item]));

        const processedRecentChats = (chatsResponse.data)
          .filter(chat => userChatIds.has(chat.chatid))
          .map(chat => {
            const otherParticipantEntry = (chatParticipantsResponse.data).find(p => p.chatid === chat.chatid && p.user_id !== currentUser.userId);
            const otherParticipant = otherParticipantEntry ? userMap.get(otherParticipantEntry.user_id) : currentUser;
            const item = contentMap.get(chat.itemid);
            const lastMessage = lastMessages.get(chat.chatid);

            if (!otherParticipant || !item) return null;

            return {
              chatId: chat.chatid, item, otherParticipant,
              lastMessageText: lastMessage?.text,
              lastMessageTimestamp: lastMessage ? new Date(lastMessage.createdat) : undefined,
            };
          }).filter(Boolean) as RecentChat[];
        setRecentChats(processedRecentChats.sort((a, b) => (b.lastMessageTimestamp?.getTime() || 0) - (a.lastMessageTimestamp?.getTime() || 0)));
      }
    };

    fetchUserData();
  }, [currentUser, isLoading, users, problems, ideas]);
  
  // Use a ref to ensure the callback passed to Google is always the latest one
  const loginHandlerRef = useRef(onLogin);
  useEffect(() => {
    loginHandlerRef.current = onLogin;
  });

  const handleLogout = useCallback(() => {
    if(window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
    }
    setCurrentUser(null);
    localStorage.removeItem('bizconnect_user');
    setNotifications([]); // Clear notifications on logout
    setView('feed');
  }, []);

  // --- Confirmation Modal Handlers ---
  const handleConfirm = () => {
    if (confirmation?.onConfirm) {
      confirmation.onConfirm();
    }
    setConfirmation(null);
  };

  const handleCancel = () => {
    setConfirmation(null);
  };

  const handleMarkNotificationsAsRead = useCallback(async () => {
    if (!currentUser) return;
    // Mark as seen in the UI immediately for responsiveness
    setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
    
    // Update the database in the background
    await supabase.from('notifications').update({ seen: true }).eq('user_id', currentUser.userId);
  }, [currentUser]);

  
  // --- Real-time Subscriptions ---
  useEffect(() => {
    // Guard: Do not set up subscriptions until the initial data load is complete.
    if (isLoading) return;

    // Function to handle the current user being added to a new chat
    const handleNewChatParticipant = (payload: RealtimePostgresChangesPayload<any>) => {
      const newParticipant = payload.new;
      // If the current user is added to a new chat, update their list of chat IDs
      // so they can receive notifications for it.
      if (currentUser && newParticipant.user_id === currentUser.userId) {
        setUserChatIds(prevIds => {
          const newIds = new Set(prevIds);
          newIds.add(newParticipant.chatid);
          return newIds;
        });
      }
    };

    // Function to handle real-time updates to user profiles
    const handleUserUpdate = (payload: RealtimePostgresChangesPayload<any>) => {
      const updatedData = payload.new;
      const updatedUser: User = {
        userId: updatedData.id,
        name: updatedData.name,
        email: updatedData.email,
        avatarUrl: updatedData.avatarurl,
        bio: updatedData.bio,
      };
      // Update the user in the main users list
      setUsers(prev => prev.map(u => u.userId === updatedUser.userId ? updatedUser : u));
      // If the updated user is the current user, update that state as well
      if (stateRef.current.currentUser?.userId === updatedUser.userId) {
        setCurrentUser(updatedUser);
      }
    };

    // Function to handle new users signing up in real-time
    const handleNewUser = (payload: RealtimePostgresChangesPayload<any>) => {
      const newUser = payload.new;
      const formattedUser: User = {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarurl,
        bio: newUser.bio,
      };
      setUsers(prevUsers => {
        // Avoid adding duplicates if the user is already in the list
        if (prevUsers.find(u => u.userId === formattedUser.userId)) {
          return prevUsers;
        }
        return [...prevUsers, formattedUser];
      });
    };

    // Function to handle new posts
    const handleNewPost = (payload: RealtimePostgresChangesPayload<any>) => {
      const newPostData = payload.new;
      const { users: currentUsersFromRef } = stateRef.current;
      const author = currentUsersFromRef.find(u => u.userId === newPostData.user_id);
      if (author) {
        const newPost: Post = {
          id: newPostData.postid,
          text: newPostData.text,
          imageUrl: newPostData.imageurl,
          postedBy: author,
          createdAt: new Date(newPostData.createdat),
          likes: [],
          comments: [],
        };
        setPosts(prevPosts => [newPost, ...prevPosts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      }
    };

    const handleNewPoll = (payload: RealtimePostgresChangesPayload<any>) => {
      const newPollData = payload.new;
      // This handler is tricky because options might arrive separately.
      // The simplest robust solution is to refetch the post when a new poll is associated with it.
      setPosts(prevPosts => {
        const post = prevPosts.find(p => p.id === newPollData.postid);
        if (post && !post.poll) { // Only update if the post doesn't already have a poll
          const newPoll: Poll = { id: newPollData.pollid, options: [] }; // Options will be filled by poll_options trigger or next fetch
          return prevPosts.map(p => p.id === newPollData.postid ? { ...p, poll: newPoll } : p);
        }
        return prevPosts;
      });
      // A more complex but complete solution would listen to poll_options inserts too.
    };

    // Function to handle new challenges
    const handleNewChallenge = (payload: RealtimePostgresChangesPayload<any>) => {
      const newChallengeData = payload.new;
      const { users: currentUsersFromRef } = stateRef.current;
      const author = currentUsersFromRef.find(u => u.userId === newChallengeData.user_id);
      if (author) {
        const newProblem: Problem = {
          id: newChallengeData.challengeid,
          title: newChallengeData.title,
          description: newChallengeData.description,
          detailedDescription: newChallengeData.detaileddescription,
          industry: newChallengeData.industry,
          reward: { type: newChallengeData.rewardtype, value: newChallengeData.rewardvalue },
          postedBy: author,
          createdAt: new Date(newChallengeData.createdat),
          chatHistory: [],
        };
        setProblems(prev => [newProblem, ...prev].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      }
    };

    // Function to handle new ideas
    const handleNewIdea = (payload: RealtimePostgresChangesPayload<any>) => {
      const newIdeaData = payload.new;
      const { users: currentUsersFromRef } = stateRef.current;
      const author = currentUsersFromRef.find(u => u.userId === newIdeaData.user_id);
      if (author) {
        const newIdea: Idea = {
          id: newIdeaData.ideaid,
          title: newIdeaData.title,
          summary: newIdeaData.summary,
          detailedDescription: newIdeaData.detaileddescription,
          reward: { type: newIdeaData.rewardtype, value: newIdeaData.rewardvalue },
          postedBy: author,
          createdAt: new Date(newIdeaData.createdat),
          chatHistory: [],
        };
        setIdeas(prev => [newIdea, ...prev].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      }
    };

    // Function to handle new comments
    const handleNewComment = (payload: RealtimePostgresChangesPayload<any>) => {
      const newCommentData = payload.new;
      const { users, posts, currentUser } = stateRef.current;
      const author = users.find(u => u.userId === newCommentData.user_id);
      if (author) {
        // UI Update: Add the new comment to the post's comment list for all users
        const newComment: Comment = {
          id: newCommentData.commentid,
          text: newCommentData.text,
          postedBy: author,
          createdAt: new Date(newCommentData.createdat),
        };
        setPosts(prevPosts => prevPosts.map(p => 
          p.id === newCommentData.postid 
            ? { ...p, comments: [...p.comments, newComment].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) } 
            : p
        ));

        // Notification Creation: If the comment is on the current user's post, create a notification.
        const post = posts.find(p => p.id === newCommentData.postid);
        if (post && currentUser && post.postedBy.userId === currentUser.userId && newCommentData.user_id !== currentUser.userId) {
          supabase.from('notifications').insert({
            user_id: post.postedBy.userId,
            actor_id: author.userId,
            type: 'comment',
            message: `commented on your post: "${post.text.substring(0, 20)}..."`,
            link_to: `/post/${post.id}`
          }).then(({ error }) => {
            if (error) console.error('Error creating comment notification:', error);
          });
        }
      }
    };

    const handleLikeUpdate = (payload: RealtimePostgresChangesPayload<any>) => {
      const { posts, users, currentUser } = stateRef.current;
      if (payload.eventType === 'INSERT') {
        const newLike = payload.new;
        // UI Update: Add the like to the post's like list for all users
        setPosts(prev => prev.map(p => p.id === newLike.postid ? { ...p, likes: [...p.likes, newLike.user_id] } : p));

        // Notification Creation: If the like is on the current user's post, create a notification.
        const post = posts.find(p => p.id === newLike.postid);
        if (post && currentUser && post.postedBy.userId === currentUser.userId && newLike.user_id !== currentUser.userId) {
          const actor = users.find(u => u.userId === newLike.user_id);
          if (actor) {
            supabase.from('notifications').insert({
              user_id: post.postedBy.userId,
              actor_id: actor.userId,
              type: 'like',
              message: `liked your post: "${post.text.substring(0, 30)}..."`,
              link_to: `/post/${post.id}`
            }).then(({ error }) => {
              if (error) console.error('Error creating like notification:', error);
            });
          }
        }
      } else if (payload.eventType === 'DELETE') {
        const oldLike = payload.old as { postid: string, user_id: string };
        // UI Update: Remove the like from the post's like list for all users
        setPosts(prev => prev.map(p => p.id === oldLike.postid ? { ...p, likes: p.likes.filter(uid => uid !== oldLike.user_id) } : p));
      }
    };

    const handleNewChatMessage = async (payload: RealtimePostgresChangesPayload<any>) => {
      const newMessage = payload.new;
      const { isChatModalOpen: isModalOpen, selectedChat: currentChat, } = chatStateRef.current;
      const { userChatIds: currentChatIds, currentUser: user, users, problems, ideas } = stateRef.current;

      const isRelevantChat = currentChatIds.has(newMessage.chatid);
      const isFromOtherUser = user && newMessage.user_id !== user.userId;

      if (!isRelevantChat || !user || !isFromOtherUser) return;

      const author = users.find(u => u.userId === newMessage.user_id);
      if (!author) return;

      const isChatWindowOpenForThisChat = isModalOpen && currentChat?.chatId === newMessage.chatid;

      // 1. Update the message list in real-time if the chat window is open
      if (isChatWindowOpenForThisChat) {
        const newChatMessage: ChatMessage = { id: newMessage.messageid, text: newMessage.text, sender: author, timestamp: new Date(newMessage.createdat) };
        setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, newChatMessage] } : null);
      } else {
        // 2. If chat window is not open, create a notification.
        supabase.from('notifications').insert({
          user_id: user.userId,
          actor_id: author.userId,
          type: 'chat_message',
          message: `sent you a new message.`,
          link_to: `/chat/${newMessage.chatid}`
        }).then(({ error }) => {
          if (error) console.error('Error creating chat notification:', error);
        });
      }

      // 3. Update the "Recent Chats" list.
      const existingChat = stateRef.current.recentChats.find(c => c.chatId === newMessage.chatid);
      if (existingChat) {
        setRecentChats(prev => {
          const updated = { ...existingChat, lastMessageText: newMessage.text, lastMessageTimestamp: new Date(newMessage.createdat) };
          return [updated, ...prev.filter(c => c.chatId !== newMessage.chatid)];
        });
      } else {
        // This is a new chat, we need to fetch its details to create a RecentChat object.
        const { data: chatInfo } = await supabase.from('chats').select('itemid').eq('chatid', newMessage.chatid).single();
        if (chatInfo) {
          const contentMap = new Map([...problems, ...ideas].map(item => [item.id, item]));
          const item = contentMap.get(chatInfo.itemid);
          if (item) {
            const newRecentChat: RecentChat = {
              chatId: newMessage.chatid,
              item,
              otherParticipant: author,
              lastMessageText: newMessage.text,
              lastMessageTimestamp: new Date(newMessage.createdat),
            };
            setRecentChats(prev => [newRecentChat, ...prev].sort((a, b) => (b.lastMessageTimestamp?.getTime() || 0) - (a.lastMessageTimestamp?.getTime() || 0)));
          }
        }
      }
    };

    const handleNewNotification = (payload: RealtimePostgresChangesPayload<any>) => {
      const newNotificationData = payload.new;
      const { users: currentUsers, currentUser: user } = stateRef.current;
      // Only add the notification if it's for the current user
      if (user && newNotificationData.user_id === user.userId) {
        const actor = currentUsers.find(u => u.userId === newNotificationData.actor_id);
        if (actor) {
          const newNotification: AppNotification = {
            id: newNotificationData.id,
            actor,
            message: newNotificationData.message,
            createdAt: new Date(newNotificationData.createdat),
            seen: newNotificationData.seen,
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      }
    };

    const usersInsertSub = supabase.channel('public-users-insert').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, handleNewUser).subscribe();
    const usersUpdateSub = supabase.channel('public-users-update').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, handleUserUpdate).subscribe();
    const challengesSub = supabase.channel('public-challenges').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'challenges' }, handleNewChallenge).subscribe();
    const ideasSub = supabase.channel('public-ideas').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ideas' }, handleNewIdea).subscribe();
    const postsSub = supabase.channel('public-posts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, handleNewPost).subscribe();
    const commentsSub = supabase.channel('public-comments').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, handleNewComment).subscribe();
    const likesSub = supabase.channel('public-likes').on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, handleLikeUpdate).subscribe();
    const pollsSub = supabase.channel('public-polls').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'polls' }, handleNewPoll).subscribe();
    const chatParticipantsSub = supabase.channel('public-chat-participants').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_participants' }, handleNewChatParticipant).subscribe();
    const chatMessagesSub = supabase.channel('public-chat-messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, handleNewChatMessage).subscribe();
    const notificationsSub = supabase.channel('public-notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, handleNewNotification).subscribe();

    return () => {
      supabase.removeChannel(usersInsertSub);
      supabase.removeChannel(usersUpdateSub);
      supabase.removeChannel(challengesSub);
      supabase.removeChannel(ideasSub);
      supabase.removeChannel(postsSub);
      supabase.removeChannel(commentsSub);
      supabase.removeChannel(likesSub);
      supabase.removeChannel(pollsSub);
      supabase.removeChannel(chatParticipantsSub);
      supabase.removeChannel(chatMessagesSub);
      supabase.removeChannel(notificationsSub);
    };
  }, [isLoading]); // Dependencies should only include values that, when changed, require subscriptions to be torn down and recreated.

  // --- Memoized Event Handlers for Performance ---

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleNewChallengeChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewChallenge(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleNewIdeaChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewIdea(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleContactFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  }, []);
  
  // --- Modal Open/Close & View Navigation Handlers ---
  
  const handleOpenPostChallenge = () => setPostChallengeModalOpen(true);
  const handleOpenPostIdea = () => setPostIdeaModalOpen(true);
  const handleOpenCreatePostModal = () => setCreatePostModalOpen(true);

  const handleOpenDetailsModal = useCallback((item: Problem | Idea) => {
    setSelectedItemForDetails(item);
    setDetailsModalOpen(true);
  }, []);

  const handleStartChatFromDetails = useCallback(async (item: Problem | Idea) => {
    if (!currentUser) {
      alert("Please log in to start a chat.");
      return;
    }

    setDetailsModalOpen(false);
    setIsChatLoading(true);
    setChatModalOpen(true);

    const itemType = 'industry' in item ? 'challenge' : 'idea';

    // 1. Find or create the chat room
    let { data: chat, error: chatError } = await supabase.from('chats').select('*').eq('itemid', item.id).single();

    if (chatError && chatError.code !== 'PGRST116') { // Handle errors other than "not found"
      setError(`Failed to load chat: ${chatError.message}`);
      setIsChatLoading(false);
      return;
    }

    if (!chat) { // If chat doesn't exist, create it
      const { data: newChat, error: newChatError } = await supabase.from('chats').insert({
        itemid: item.id,
        itemtype: itemType
      }).select().single();
      if (newChatError) {
        setError(`Failed to create chat: ${newChatError.message}`);
        setIsChatLoading(false);
        return;
      }
      chat = newChat;

      // Add participants to the new chat, avoiding adding the same user twice
      const participants = [{ chatid: chat.chatid, user_id: currentUser.userId }];
      if (currentUser.userId !== item.postedBy.userId) {
        participants.push({ chatid: chat.chatid, user_id: item.postedBy.userId });
      }
      
      await supabase.from('chat_participants').insert(participants);
    }

    // 2. Fetch messages for the chat
    const { data: messagesData, error: messagesError } = await supabase.from('chat_messages').select('*').eq('chatid', chat.chatid).order('createdat', { ascending: true });

    if (messagesError) {
      setError(`Failed to load messages: ${messagesError.message}`);
      setIsChatLoading(false);
      return;
    }

    const userMap = new Map(users.map(u => [u.userId, u]));
    const messages = messagesData
      .map(msg => {
        const sender = userMap.get(msg.user_id);
        if (!sender) return null; // Gracefully handle messages from unknown/deleted users
        return { id: msg.messageid, text: msg.text, sender, timestamp: new Date(msg.createdat) };
      })
      .filter(Boolean) as ChatMessage[];

    setSelectedChat({ item, messages, chatId: chat!.chatid });
    setIsChatLoading(false);
  }, [currentUser, users]);
  const handleViewProfile = useCallback((user: User) => {
    setViewedUser(user);
    setView('profile');
  }, []);

  const handleOpenRecentChat = useCallback((chat: RecentChat) => {
    // Re-use the existing chat opening logic
    handleStartChatFromDetails(chat.item);
  }, [handleStartChatFromDetails]);

  const handleCloseChatModal = () => {
    setChatModalOpen(false);
    setTimeout(() => {
        setSelectedChat(null);
        setIsChatLoading(false);
    }, 300);
  }
  
  // --- Feature Logic Handlers ---
  
  // Generic content creation handler to reduce code duplication
  async function createContent<T, U>({
    contentName,
    currentUser,
    formData,
    requiredFields,
    buildLocalItem,
    buildDbItem,
    tableName,
    idField,
    updateState,
    onSuccess,
  }: {
    contentName: string;
    currentUser: User | null;
    formData: any;
    requiredFields: string[];
    buildLocalItem: () => T;
    buildDbItem: () => U;
    tableName: string;
    idField: string;
    updateState: React.Dispatch<React.SetStateAction<T[]>>;
    onSuccess: () => void;
  }) {
    if (!currentUser) {
      alert(`Please log in to post a ${contentName}.`);
      return;
    }
    if (requiredFields.some(field => !formData[field])) {
      alert("Please fill out all required fields.");
      return;
    }

    const localItem = buildLocalItem();
    const dbItem = buildDbItem();

    const { data, error } = await supabase.from(tableName).insert(dbItem).select().single();
    
    if (error) {
      alert(`Failed to post ${contentName}: ${error.message}`);
    } else {
      const newItem = { ...localItem, id: data![idField], createdAt: new Date(data!.createdat) };
      updateState(prev => [newItem as T, ...prev]);
      onSuccess();
      setToastMessage(`${contentName.charAt(0).toUpperCase() + contentName.slice(1)} posted successfully!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handlePostChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createContent<Problem, any>({
      contentName: 'challenge', currentUser, formData: newChallenge,
      requiredFields: ['title', 'description', 'detailedDescription', 'industry', 'rewardValue'],
      buildLocalItem: () => ({
        id: '', title: newChallenge.title, description: newChallenge.description, detailedDescription: newChallenge.detailedDescription, industry: newChallenge.industry,
        reward: { type: newChallenge.rewardType as any, value: newChallenge.rewardValue },
        postedBy: currentUser!, createdAt: new Date(), chatHistory: [],
      }),
      buildDbItem: () => ({
        title: newChallenge.title, description: newChallenge.description, detaileddescription: newChallenge.detailedDescription, industry: newChallenge.industry,
        rewardtype: newChallenge.rewardType, rewardvalue: newChallenge.rewardValue, user_id: currentUser!.userId
      }),
      tableName: 'challenges', idField: 'challengeid', updateState: setProblems,
      onSuccess: () => {
        setPostChallengeModalOpen(false);
        setNewChallenge({ title: '', description: '', detailedDescription: '', industry: '', rewardType: 'money', rewardValue: '' });
        setView('problems');
      },
    });
  };
  
  const handlePostIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createContent<Idea, any>({
      contentName: 'idea', currentUser, formData: newIdea,
      requiredFields: ['title', 'summary', 'detailedDescription', 'rewardValue'],
      buildLocalItem: () => ({
        id: '', title: newIdea.title, summary: newIdea.summary, detailedDescription: newIdea.detailedDescription,
        reward: { type: newIdea.rewardType as any, value: newIdea.rewardValue },
        postedBy: currentUser!, createdAt: new Date(), chatHistory: [],
      }),
      buildDbItem: () => ({
        title: newIdea.title, summary: newIdea.summary, detaileddescription: newIdea.detailedDescription,
        rewardtype: newIdea.rewardType, rewardvalue: newIdea.rewardValue, user_id: currentUser!.userId
      }),
      tableName: 'ideas', idField: 'ideaid', updateState: setIdeas,
      onSuccess: () => {
        setPostIdeaModalOpen(false);
        setNewIdea({ title: '', summary: '', detailedDescription: '', rewardType: 'money', rewardValue: '' });
        setView('ideas');
      },
    });
  };

  const handleContactFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(contactForm).some(field => (field as string).trim() === '')) {
        alert('Please fill out all fields.');
        return;
    }
    console.log('Contact Form Submitted:', contactForm);
    alert('Thank you for your message! We will get back to you shortly.');
    setContactForm({ name: '', email: '', contact: '', subject: '', description: '' });
    setView('feed');
  }, [contactForm]);

  const handleUpdateProfile = useCallback(async (updatedUserData: { name: string; bio: string; avatarUrl: string }) => {
    if (!currentUser) return;    

    const { error } = await supabase.from('users').update({
      name: updatedUserData.name,
      bio: updatedUserData.bio,
      avatarurl: updatedUserData.avatarUrl
    }).eq('id', currentUser.userId);

    // After a successful DB update, we only need to update the userMap and currentUser.
    // React's rendering will automatically propagate the changes everywhere the user object is used.
    if (error) {
        alert(`Failed to update profile: ${error.message}`);
    } else {
        const updatedUser: User = { ...currentUser, ...updatedUserData };
        setUsers(prev => prev.map(u => u.userId === currentUser.userId ? updatedUser : u));
        setCurrentUser(updatedUser);
        localStorage.setItem('bizconnect_user', JSON.stringify(updatedUser));
        if (viewedUser?.userId === currentUser.userId) setViewedUser(updatedUser);

        setEditProfileModalOpen(false);
        setToastMessage("Profile updated successfully!");
        setTimeout(() => setToastMessage(null), 3000);
    }
  }, [currentUser]);

  const handleCreatePost = useCallback(async (postData: { text: string; imageUrl?: string; poll?: Omit<Poll, 'id'> & { durationDays: number } }) => {
    if (!currentUser) {
      alert("Please log in to create a post.");
      return;
    }

    // 1. Insert the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({ text: postData.text, imageurl: postData.imageUrl, user_id: currentUser.userId })
      .select()
      .single();

    if (postError) {
      alert(`Failed to create post: ${postError.message}`);
      return;
    }

    let finalPoll: Poll | undefined = undefined;

    // 2. If there's a poll, insert it and its options
    if (postData.poll) {
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({ postid: post.postid, durationdays: postData.poll.durationDays })
        .select()
        .single();

      if (pollError) {
        alert(`Failed to create poll: ${pollError.message}`);
        // Consider deleting the post here for consistency
        return;
      }

      const pollOptionsToInsert = postData.poll.options.map(opt => ({ pollid: poll.pollid, text: opt.text }));
      const { data: pollOptions, error: optionsError } = await supabase.from('poll_options').insert(pollOptionsToInsert).select();

      if (optionsError) {
        alert(`Failed to create poll options: ${optionsError.message}`);
        // Consider cleanup
        return;
      }
      finalPoll = { id: poll.pollid, options: pollOptions.map(opt => ({ id: opt.optionid, text: opt.text, votes: [] })) };
    }

    // Optimistic Update: Add the post to the state immediately for a responsive UI.
    // The real-time subscription will handle this for other users.
    const newPost: Post = {
      id: post.postid,
      text: postData.text,
      imageUrl: postData.imageUrl,
      postedBy: currentUser,
      createdAt: new Date(post.createdat),
      likes: [],
      comments: [],
      poll: finalPoll,
    };
    setPosts(prev => [newPost, ...prev]);

    setCreatePostModalOpen(false);
    setToastMessage("Post created successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  }, [currentUser]);

  const handleLikePost = useCallback(async (postId: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const isLiked = post.likes.includes(currentUser.userId);
    let error;
    if (isLiked) {
        ({ error } = await supabase.from('likes').delete().match({ postid: postId, user_id: currentUser.userId }));
    } else {
        ({ error } = await supabase.from('likes').insert({ postid: postId, user_id: currentUser.userId }));
    }
    const newLikes = isLiked ? post.likes.filter(uid => uid !== currentUser.userId) : [...post.likes, currentUser.userId];

    if (!error) {
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          return { ...p, likes: newLikes };
        }
        return p;
      }));
    }
  }, [currentUser, posts]);

  const handleAddComment = useCallback(async (postId: string, commentText: string) => {
    if (!currentUser || !commentText.trim()) return;
    const tempId = `temp-comment-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      text: commentText,
      postedBy: currentUser,
      createdAt: new Date(),
    };
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, comments: [...p.comments, tempComment] } : p));

    const { data, error } = await supabase.from('comments').insert({
        postid: postId,
        user_id: currentUser.userId,
        text: commentText,
    }).select().single();

    if (error) {
      // Revert on error
      setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== tempId) } : p));
      alert(`Failed to add comment: ${error.message}`);
    } else {
      // Replace temp comment with real one
      setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, comments: p.comments.map(c => c.id === tempId ? { ...tempComment, id: data!.commentid, createdAt: new Date(data!.createdat) } : c) } : p));
    }
  }, [currentUser, posts]);

  const handleDeleteComment = useCallback(async (postId: string, commentId: string) => {
    setConfirmation({
      isOpen: true,
      title: "Delete Comment",
      message: "Are you sure you want to permanently delete this comment?",
      onConfirm: async () => {
        const { error } = await supabase.from('comments').delete().eq('commentid', commentId);
        if (error) {
          alert(`Failed to delete comment: ${error.message}`);
        } else {
          setPosts(prevPosts =>
            prevPosts.map(p =>
              p.id === postId
                ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
                : p
            )
          );
          setToastMessage("Comment deleted successfully!");
          setTimeout(() => setToastMessage(null), 3000);
        }
      },
    });
  }, [currentUser]);

  const handleShowUserList = useCallback((userIds: string[], title: string) => {
    const userMap = new Map(users.map(u => [u.userId, u]));
    const usersToShow = userIds.map(id => userMap.get(id)).filter(Boolean) as User[];
    setUserListModal({
      isOpen: true,
      title,
      users: usersToShow,
    });
  }, [users]);

  const handleCloseUserListModal = () => {
    setUserListModal({ isOpen: false, title: '', users: [] });
  };

  const handleVoteOnPoll = useCallback(async (postId: string, optionId:string) => {
    if (!currentUser) return;

    const post = posts.find(p => p.id === postId);
    if (!post || !post.poll) return;

    // Prevent re-voting on the same option, allow changing vote
    const { error } = await supabase.from('poll_votes').upsert({
        pollid: post.poll.id,
        optionid: optionId,
        user_id: currentUser.userId,
    }, { onConflict: 'pollid,user_id' }); // This handles inserting or updating the vote

    if (!error) {
        // Update local state to reflect the vote immediately
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId && p.poll) {
                const newOptions = p.poll.options.map(opt => ({
                    ...opt,
                    votes: opt.votes.filter(uid => uid !== currentUser.userId) // Remove old vote
                })).map(opt => opt.id === optionId ? { ...opt, votes: [...opt.votes, currentUser.userId] } : opt); // Add new vote
                return { ...p, poll: { ...p.poll, options: newOptions } };
            }
            return p;
        }));
    }
  }, [currentUser, posts]);
  
  const handleSendMessage = useCallback(async () => {
    if (!chatMessage.trim() || !selectedChat || !currentUser) return;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      text: chatMessage,
      sender: currentUser,
      timestamp: new Date()
    };

    // Optimistically update the UI
    setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, tempMessage] } : null);
    setChatMessage('');

    const { data: newMessage, error } = await supabase.from('chat_messages').insert({
      chatid: selectedChat.chatId,
      user_id: currentUser.userId,
      text: chatMessage
    }).select().single();

    if (error) {
      alert(`Failed to send message: ${error.message}`);
      // Revert optimistic update on error
      setSelectedChat(prev => prev ? { ...prev, messages: prev.messages.filter(m => m.id !== tempMessage.id) } : null);
    } else {
      // Replace temporary message with the real one from the database
      setSelectedChat(prev => prev ? { ...prev, messages: prev.messages.map(m => m.id === tempMessage.id ? { ...tempMessage, id: newMessage.messageid, timestamp: new Date(newMessage.createdat) } : m) } : null);
    }
  }, [chatMessage, selectedChat, currentUser]);

  const handleSharePost = useCallback(async (postId: string) => {
    const postToShare = posts.find(p => p.id === postId);
    if (!postToShare) return;

    const shareData = {
      title: 'Check out this post on BizConnect',
      text: `${postToShare.postedBy.name} posted: "${postToShare.text}"`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\nShared from BizConnect.`);
        setToastMessage('Post content copied to clipboard!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error sharing post:', err);
      setToastMessage('Could not share post at this time.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  }, [posts]);

  const handleDeletePost = useCallback(async (postId: string) => {
    setConfirmation({
      isOpen: true,
      title: "Delete Post",
      message: "Are you sure you want to permanently delete this post?",
      onConfirm: async () => {
        const { error } = await supabase.from('posts').delete().eq('postid', postId);
        if (error) {
          alert(`Failed to delete post: ${error.message}`);
        } else {
          setPosts(prev => prev.filter(p => p.id !== postId));
          setToastMessage("Post deleted successfully!");
          setTimeout(() => setToastMessage(null), 3000);
        }
      },
    });
  }, [currentUser]);

  const handleDeleteChallenge = useCallback(async (challengeId: string) => {
    setConfirmation({
      isOpen: true,
      title: "Delete Challenge",
      message: "Are you sure you want to permanently delete this challenge?",
      onConfirm: async () => {
        const { error } = await supabase.from('challenges').delete().eq('challengeid', challengeId);
        if (error) {
          alert(`Failed to delete challenge: ${error.message}`);
        } else {
          setProblems(prev => prev.filter(p => p.id !== challengeId));
          setToastMessage("Challenge deleted successfully!");
          setTimeout(() => setToastMessage(null), 3000);
        }
      },
    });
  }, [currentUser]);

  const handleDeleteIdea = useCallback(async (ideaId: string) => {
    setConfirmation({
      isOpen: true,
      title: "Delete Idea",
      message: "Are you sure you want to permanently delete this idea?",
      onConfirm: async () => {
        const { error } = await supabase.from('ideas').delete().eq('ideaid', ideaId);
        if (error) {
          alert(`Failed to delete idea: ${error.message}`);
        } else {
          setIdeas(prev => prev.filter(i => i.id !== ideaId));
          setToastMessage("Idea deleted successfully!");
          setTimeout(() => setToastMessage(null), 3000);
        }
      },
    });
  }, [currentUser]);

  // --- Memoized Filtering & Data Transformation ---

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return sortedPosts;
    return sortedPosts.filter(post => 
      post.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.postedBy?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedPosts, searchTerm]);

  const filteredProblems = useMemo(() => {
    if (!searchTerm) return problems;
    return problems.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [problems, searchTerm]);

  const filteredIdeas = useMemo(() => {
    if (!searchTerm) return ideas;
    return ideas.filter(i => 
      i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ideas, searchTerm]);

  // --- Render Logic ---

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center bg-red-50 border border-red-200 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-red-700">Oops! Something went wrong.</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <p className="mt-4 text-sm text-slate-500">Please try refreshing the page.</p>
        </div>
      );
    }
    
    switch (view) {
        case 'feed':
            return <Feed posts={filteredPosts} currentUser={currentUser} onLikePost={handleLikePost} onAddComment={handleAddComment} onVoteOnPoll={handleVoteOnPoll} onViewProfile={handleViewProfile} onSharePost={handleSharePost} onDeletePost={handleDeletePost} onDeleteComment={handleDeleteComment} onShowUserList={handleShowUserList} />;
        case 'problems':
            return <ProblemList 
                        problems={filteredProblems} 
                        currentUser={currentUser} 
                        onOpenDetails={handleOpenDetailsModal} 
                        onViewProfile={handleViewProfile} 
                        onDeleteChallenge={handleDeleteChallenge} />;
        case 'ideas':
            return <IdeaList 
                        ideas={filteredIdeas}
                        currentUser={currentUser}
                        onOpenDetails={handleOpenDetailsModal} onViewProfile={handleViewProfile} onDeleteIdea={handleDeleteIdea} />;
        case 'profile':
            return viewedUser ? <ProfilePage 
                                    user={viewedUser} 
                                    currentUser={currentUser}
                                    posts={posts}
                                    problems={problems}
                                    ideas={ideas}
                                    onViewProfile={handleViewProfile}
                                    onOpenDetails={handleOpenDetailsModal}
                                    onEditProfile={() => setEditProfileModalOpen(true)}
                                    onLikePost={handleLikePost}
                                    onAddComment={handleAddComment}
                                    onVoteOnPoll={handleVoteOnPoll}
                                    onDeleteComment={handleDeleteComment}
                                    onSharePost={handleSharePost}
                                    onDeletePost={handleDeletePost}
                                    onDeleteChallenge={handleDeleteChallenge}
                                    onDeleteIdea={handleDeleteIdea}
                                    onShowUserList={handleShowUserList}
                                /> : null;
        case 'about':
            return <AboutPage />;
        case 'contact':
            return <ContactPage 
                        formData={contactForm} 
                        onChange={handleContactFormChange} 
                        onSubmit={handleContactFormSubmit}
                        onCancel={() => setView('feed')}
                    />;
        case 'terms':
            return <TermsOfServicePage />;
        case 'privacy':
            return <PrivacyPolicyPage />;
        default:
            return null;
    }
  };

  // Derived state for notification dots
  const hasUnreadNotifications = useMemo(() => notifications.some(n => !n.seen), [notifications]);
  const hasUnreadChats = useMemo(() => notifications.some(n => n.message.includes('message') && !n.seen), [notifications]);

  const showHeroSection = ['feed', 'problems', 'ideas'].includes(view);

  // New, safer check for the environment variable.
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-red-800">Configuration Error</h1>
        <p className="mt-4 text-red-700">
          The <code className="bg-red-200 text-red-900 px-2 py-1 rounded font-mono">VITE_GOOGLE_CLIENT_ID</code> is missing.
        </p>
        <p className="mt-2 text-slate-600">Please ensure you have a <code className="bg-slate-200 text-slate-800 px-2 py-1 rounded font-mono">.env</code> file in your project root and that you have restarted your development server.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spinner />
        <p className="mt-4 text-slate-500">Connecting to the business world...</p>
      </div>
    );
  }

  const publicViews: AppView[] = ['about', 'contact', 'terms', 'privacy'];
  const isPublicView = publicViews.includes(view);

  // If no user is logged in, show the login page.
  if (!currentUser) {
    // But, if the user is trying to view a public page, show that instead.
    if (isPublicView) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Header
            activeView={view}
            setActiveView={setView}
            onPostChallengeClick={() => {}}
            onPostIdeaClick={() => {}}
            onOpenCreatePostModal={() => {}}
            currentUser={null}
            onViewProfile={() => {}}
            onLogout={() => {}}
            recentChats={[]}
            googleClientId={GOOGLE_CLIENT_ID}
            onLogin={onLogin}
            onOpenRecentChat={() => {}}
            notifications={[]}
            hasUnreadChats={false}
            hasUnreadNotifications={false}
            onMarkNotificationsAsRead={() => {}}
          />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {renderContent()}
          </main>
          <Footer
            onNavigateToAbout={() => setView('about')}
            onNavigateToContact={() => setView('contact')}
            onNavigateToTerms={() => setView('terms')}
            onNavigateToPrivacy={() => setView('privacy')}
          />
        </div>
      );
    }
    return <LoginPage onLogin={onLogin} googleClientId={GOOGLE_CLIENT_ID} setView={setView} />;
  }

  // Otherwise, show the main application.
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        activeView={view}
        setActiveView={setView}
        onPostChallengeClick={handleOpenPostChallenge}
        onPostIdeaClick={handleOpenPostIdea}
        onOpenCreatePostModal={handleOpenCreatePostModal}
        currentUser={currentUser}
        onViewProfile={handleViewProfile}
        onLogout={handleLogout}
        recentChats={recentChats}
        googleClientId={GOOGLE_CLIENT_ID}
        onLogin={onLogin}
        onOpenRecentChat={handleOpenRecentChat}
        notifications={notifications}
        hasUnreadChats={hasUnreadChats}
        hasUnreadNotifications={hasUnreadNotifications}
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
      />
      <main className="flex-grow">
        {showHeroSection && (
          <HeroSection
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        )}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {renderContent()}
        </div>
      </main>
      <Footer 
        onNavigateToAbout={() => setView('about')} 
        onNavigateToContact={() => setView('contact')}
        onNavigateToTerms={() => setView('terms')}
        onNavigateToPrivacy={() => setView('privacy')}
      />

      {/* --- Modals --- */}
      
       <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onCreatePost={handleCreatePost}
      />
      
      <EditProfileModal 
        isOpen={isEditProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
        user={currentUser}
        onSave={handleUpdateProfile}
      />
      
      <DetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        item={selectedItemForDetails}
        onStartChat={handleStartChatFromDetails}
        currentUser={currentUser}
      />

      <ContentFormModal
        type="challenge"
        isOpen={isPostChallengeModalOpen}
        onClose={() => setPostChallengeModalOpen(false)}
        formData={newChallenge}
        onFormChange={handleNewChallengeChange}
        onSubmit={handlePostChallengeSubmit}
      />

      <ContentFormModal
        type="idea"
        isOpen={isPostIdeaModalOpen}
        onClose={() => setPostIdeaModalOpen(false)}
        formData={newIdea}
        onFormChange={handleNewIdeaChange}
        onSubmit={handlePostIdeaSubmit}
      />

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={handleCloseChatModal}
        chat={selectedChat}
        currentUser={currentUser}
        isLoading={isChatLoading}
        onSendMessage={handleSendMessage}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
      />

      {confirmation && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          title={confirmation.title}
          message={confirmation.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <UserListModal
        isOpen={userListModal.isOpen}
        onClose={handleCloseUserListModal}
        title={userListModal.title}
        users={userListModal.users}
        onViewProfile={handleViewProfile}
      />

      {/* --- Toast Notification --- */}
      {toastMessage && (
        <div 
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium z-50 toast-enter"
          onAnimationEnd={(e) => {
              if (e.animationName === 'fadeOut') {
                  setToastMessage(null);
              }
          }}
        >
          {toastMessage}
        </div>
      )}

    </div>
  );
};

export default App;
