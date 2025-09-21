export interface User {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
}

export type RewardType = 'money' | 'equity' | 'job' | 'other';

export interface Reward {
  type: RewardType;
  value: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: User;
  timestamp: Date;
}

export interface Problem {
  id:string;
  title: string;
  description: string;
  detailedDescription: string;
  industry: string;
  reward: Reward;
  postedBy: User;
  createdAt: Date;
  chatHistory: ChatMessage[];
}

export interface Idea {
  id: string;
  title: string;
  summary: string;
  detailedDescription: string;
  reward: Reward;
  postedBy: User;
  createdAt: Date;
  chatHistory: ChatMessage[];
}

export interface Comment {
  id: string;
  text: string;
  postedBy: User;
  createdAt: Date;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // Array of user IDs
}

export interface Poll {
  id: string;
  options: PollOption[];
}

export interface Post {
  id: string;
  text: string;
  imageUrl?: string;
  poll?: Poll;
  postedBy: User;
  createdAt: Date;
  likes: string[]; // Array of user IDs
  comments: Comment[];
}

export type AppView = 'feed' | 'problems' | 'ideas' | 'about' | 'contact' | 'terms' | 'privacy' | 'profile';

export interface RecentChat {
  chatId: string;
  item: Problem | Idea;
  otherParticipant: User;
  lastMessageText?: string;
  lastMessageTimestamp?: Date;
}

export interface AppNotification {
  id: string;
  actor: User;
  message: string;
  createdAt: Date;
  seen: boolean;
  // Optional link for future navigation
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: any) => void; }) => void;
          renderButton: (parent: HTMLElement | null, options: { theme?: string; size?: string; type?: string; shape?: string; text?: string; }) => void;
          prompt: (notification?: any) => void;
          disableAutoSelect: () => void;
        }
      }
    }
  }
}
