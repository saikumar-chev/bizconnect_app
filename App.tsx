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
import Modal from './components/Modal';
import CreatePostModal from './components/CreatePostModal';
import EditProfileModal from './components/EditProfileModal';
import ChatModal from './components/ChatModal';
import DetailsModal from './components/DetailsModal';
import ConfirmationModal from './components/ConfirmationModal';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import ProfilePage from './components/ProfilePage';
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
  const stateRef = useRef({ users, posts, currentUser, userChatIds, problems, ideas });
  useEffect(() => {
    stateRef.current = { users, posts, currentUser, userChatIds, problems, ideas };
  });


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
        setPosts(prevPosts => [newPost, ...prevPosts]);
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

      if (!isRelevantChat || !isFromOtherUser) return;

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
      const existingChat = recentChats.find(c => c.chatId === newMessage.chatid);
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
    const postsSub = supabase.channel('public-posts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, handleNewPost).subscribe();
    const commentsSub = supabase.channel('public-comments').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, handleNewComment).subscribe();
    const likesSub = supabase.channel('public-likes').on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, handleLikeUpdate).subscribe();
    const chatParticipantsSub = supabase.channel('public-chat-participants').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_participants' }, handleNewChatParticipant).subscribe();
    const chatMessagesSub = supabase.channel('public-chat-messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, handleNewChatMessage).subscribe();
    const notificationsSub = supabase.channel('public-notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, handleNewNotification).subscribe();

    return () => {
      supabase.removeChannel(usersInsertSub);
      supabase.removeChannel(usersUpdateSub);
      supabase.removeChannel(postsSub);
      supabase.removeChannel(commentsSub);
      supabase.removeChannel(likesSub);
      supabase.removeChannel(chatParticipantsSub);
      supabase.removeChannel(chatMessagesSub);
      supabase.removeChannel(notificationsSub);
    };
  }, [isLoading, recentChats]); // Add recentChats to dependency array to ensure the async function inside handleNewChatMessage has the latest version

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

  const handleCreatePost = useCallback(async (postData: { text: string; imageUrl?: string; poll?: Poll }) => {
    await createContent<Post, any>({
      contentName: 'post', currentUser, formData: postData,
      requiredFields: ['text'],
      buildLocalItem: () => ({
        id: '', text: postData.text, imageUrl: postData.imageUrl, poll: postData.poll,
        postedBy: currentUser!, createdAt: new Date(), likes: [], comments: [],
      }),
      buildDbItem: () => ({
        text: postData.text, imageurl: postData.imageUrl, user_id: currentUser!.userId,
      }),
      tableName: 'posts', idField: 'postid', updateState: setPosts,
      onSuccess: () => {
        setCreatePostModalOpen(false);
        setView('feed');
      },
    });
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
            return <Feed posts={filteredPosts} currentUser={currentUser} onLikePost={handleLikePost} onAddComment={handleAddComment} onVoteOnPoll={handleVoteOnPoll} onViewProfile={handleViewProfile} onSharePost={handleSharePost} onDeletePost={handleDeletePost} onDeleteComment={handleDeleteComment} />;
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
                                    posts={posts.filter(p => p.postedBy.userId === viewedUser.userId)}
                                    problems={problems.filter(p => p.postedBy.userId === viewedUser.userId)}
                                    ideas={ideas.filter(i => i.postedBy.userId === viewedUser.userId)}
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

      {/* Post Challenge Modal */}
      <Modal isOpen={isPostChallengeModalOpen} onClose={() => setPostChallengeModalOpen(false)} title="Post a New Challenge" size="lg">
        <form onSubmit={handlePostChallengeSubmit}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">Challenge Title</label>
                    <input type="text" id="title" name="title" value={newChallenge.title} onChange={handleNewChallengeChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="e.g., Increase user engagement" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700">Short Description (for card view)</label>
                    <textarea id="description" name="description" value={newChallenge.description} onChange={handleNewChallengeChange} rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="Describe the business problem in 1-2 sentences." required></textarea>
                </div>
                 <div>
                    <label htmlFor="detailedDescription" className="block text-sm font-medium text-slate-700">Detailed Description</label>
                    <textarea id="detailedDescription" name="detailedDescription" value={newChallenge.detailedDescription} onChange={handleNewChallengeChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="Provide a more detailed explanation of the challenge (3-4 sentences)." required></textarea>
                </div>
                <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-slate-700">Industry</label>
                    <input type="text" id="industry" name="industry" value={newChallenge.industry} onChange={handleNewChallengeChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="e.g., SaaS" required />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="rewardType" className="block text-sm font-medium text-slate-700">Reward Type</label>
                        <select id="rewardType" name="rewardType" value={newChallenge.rewardType} onChange={handleNewChallengeChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md bg-white">
                            <option value="money">Money</option>
                            <option value="equity">Equity</option>
                            <option value="job">Job Offer</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="rewardValue" className="block text-sm font-medium text-slate-700">Reward Value</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            {newChallenge.rewardType === 'money' && (
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 sm:text-sm">₹</span>
                                </div>
                            )}
                            <input type="text" id="rewardValue" name="rewardValue" value={newChallenge.rewardValue} onChange={handleNewChallengeChange} className={`block w-full rounded-md border-slate-300 py-2 pr-3 focus:border-slate-500 focus:ring-slate-500 sm:text-sm ${newChallenge.rewardType === 'money' ? 'pl-7' : 'pl-3'}`} placeholder={
                                newChallenge.rewardType === 'money' ? "1,500" :
                                newChallenge.rewardType === 'equity' ? "e.g., 5% Equity" :
                                newChallenge.rewardType === 'job' ? "e.g., Lead Developer" : "Describe the reward"
                            } required />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 px-4 py-3 sm:px-6 flex justify-end space-x-2 border-t">
                <button type="button" onClick={() => setPostChallengeModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700">Submit Challenge</button>
            </div>
        </form>
      </Modal>
      
      {/* Post Idea Modal */}
      <Modal isOpen={isPostIdeaModalOpen} onClose={() => setPostIdeaModalOpen(false)} title="Post a New Idea" size="lg">
        <form onSubmit={handlePostIdeaSubmit}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                    <label htmlFor="idea-title" className="block text-sm font-medium text-slate-700">Idea Title</label>
                    <input type="text" id="idea-title" name="title" value={newIdea.title} onChange={handleNewIdeaChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="e.g., AI-Powered Meal Planning App" required />
                </div>
                <div>
                    <label htmlFor="idea-summary" className="block text-sm font-medium text-slate-700">Summary (for card view)</label>
                    <textarea id="idea-summary" name="summary" value={newIdea.summary} onChange={handleNewIdeaChange} rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="Summarize your idea in 1-2 sentences." required></textarea>
                </div>
                 <div>
                    <label htmlFor="idea-detailedDescription" className="block text-sm font-medium text-slate-700">Detailed Description</label>
                    <textarea id="idea-detailedDescription" name="detailedDescription" value={newIdea.detailedDescription} onChange={handleNewIdeaChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="Provide a more detailed explanation of the idea, its features, and potential market." required></textarea>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="idea-rewardType" className="block text-sm font-medium text-slate-700">Reward Type</label>
                        <select id="idea-rewardType" name="rewardType" value={newIdea.rewardType} onChange={handleNewIdeaChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md bg-white">
                            <option value="money">Money</option>
                            <option value="equity">Equity</option>
                            <option value="job">Job Offer</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="idea-rewardValue" className="block text-sm font-medium text-slate-700">Reward Value</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            {newIdea.rewardType === 'money' && (
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 sm:text-sm">₹</span>
                                </div>
                            )}
                            <input type="text" id="idea-rewardValue" name="rewardValue" value={newIdea.rewardValue} onChange={handleNewIdeaChange} className={`block w-full rounded-md border-slate-300 py-2 pr-3 focus:border-slate-500 focus:ring-slate-500 sm:text-sm ${newIdea.rewardType === 'money' ? 'pl-7' : 'pl-3'}`} placeholder={
                                newIdea.rewardType === 'money' ? "25,000" :
                                newIdea.rewardType === 'equity' ? "e.g., 10% Equity" :
                                newIdea.rewardType === 'job' ? "e.g., Co-founder" : "Describe the reward"
                            } required />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 px-4 py-3 sm:px-6 flex justify-end space-x-2 border-t">
                <button type="button" onClick={() => setPostIdeaModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700">Submit Idea</button>
            </div>
        </form>
      </Modal>

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
