import { Problem, Idea, Post } from '../types';
import { initialUsers } from '../utils/initialUsers';

const [user1, user2, user3, user4] = initialUsers;


export const getInitialData = (): { problems: Problem[]; ideas: Idea[]; posts: Post[] } => {
  const now = new Date();

  const staticProblems: Problem[] = [
    {
      id: 'prob-1',
      title: 'Streamlining Remote Team Collaboration',
      description: 'Seeking a SaaS solution to improve asynchronous communication and project tracking for a fully remote marketing agency.',
      detailedDescription: 'Our marketing agency has team members across multiple time zones. We struggle with keeping everyone aligned on project progress and deadlines. We need a tool that integrates with Slack and Google Workspace to provide a central hub for tasks, documents, and communication.',
      industry: 'SaaS',
      reward: { type: 'money', value: '5000' },
      postedBy: user2,
      createdAt: new Date(now.getTime() - 3600000 * 1),
      chatHistory: [],
    },
    {
      id: 'prob-2',
      title: 'Eco-Friendly Packaging for E-commerce',
      description: 'Our e-commerce brand needs a sustainable and cost-effective packaging solution for fragile goods.',
      detailedDescription: 'We sell handmade ceramics and have a high rate of breakage during shipping. We want to move away from plastic bubble wrap to an eco-friendly alternative that is both protective and affordable for a small business.',
      industry: 'E-commerce',
      reward: { type: 'equity', value: '2% Equity' },
      postedBy: user3,
      createdAt: new Date(now.getTime() - 3600000 * 5),
      chatHistory: [],
    },
    {
      id: 'prob-3',
      title: 'Local Artisan Marketplace App',
      description: 'We need a mobile platform to connect local artisans with customers in their city, supporting small businesses.',
      detailedDescription: 'The goal is to create a user-friendly app where local artists and craftspeople can list their products. Features should include artist profiles, product galleries, secure payments, and an option for local pickup or delivery. The main challenge is creating a simple onboarding process for non-tech-savvy sellers.',
      industry: 'Mobile App',
      reward: { type: 'job', value: 'Lead Mobile Developer' },
      postedBy: user4,
      createdAt: new Date(now.getTime() - 3600000 * 10),
      chatHistory: [],
    }
  ];

  const staticIdeas: Idea[] = [
    {
      id: 'idea-1',
      title: 'AI-Powered Meal Planning App',
      summary: 'A subscription-based mobile app that generates personalized weekly meal plans based on dietary restrictions, preferences, and local grocery sales.',
      detailedDescription: 'The app would use AI to learn user preferences over time, suggest recipes, create automated shopping lists, and integrate with grocery delivery services to streamline the entire meal planning process. Monetization through subscription fees and affiliate partnerships with grocery stores.',
      reward: { type: 'money', value: '25000' },
      postedBy: user1,
      createdAt: new Date(now.getTime() - 3600000 * 2),
      chatHistory: [],
    },
    {
      id: 'idea-2',
      title: 'Gamified Language Learning Platform for Kids',
      summary: 'An interactive platform that teaches children new languages through storytelling, games, and AR characters.',
      detailedDescription: 'Unlike traditional apps, this platform focuses on narrative-driven learning. Kids embark on adventures, interact with animated characters in augmented reality, and solve puzzles that reinforce vocabulary and grammar. The goal is to make learning feel like playing.',
      reward: { type: 'money', value: '50000' },
      postedBy: user4,
      createdAt: new Date(now.getTime() - 3600000 * 8),
      chatHistory: [],
    },
     {
      id: 'idea-3',
      title: 'Subscription Box for Vintage Vinyl Records',
      summary: 'A curated monthly subscription service that delivers classic and rare vinyl records to music enthusiasts.',
      detailedDescription: 'Each month, subscribers receive a themed box containing one high-quality vintage vinyl record, liner notes with the album\'s history, and a small related merchandise item. Tiers could be based on music genres like Jazz, Classic Rock, or Soul.',
      reward: { type: 'equity', value: '5% Equity & Co-founder role' },
      postedBy: user2,
      createdAt: new Date(now.getTime() - 3600000 * 12),
      chatHistory: [],
    }
  ];

  const staticPosts: Post[] = [
      {
          id: 'post-1',
          text: 'Just hit a major milestone for our new project! 🔥 What productivity tool can your team not live without? #startup #productivity',
          imageUrl: 'https://picsum.photos/seed/milestone/600/400',
          postedBy: user1,
          createdAt: new Date(now.getTime() - 1800000 * 1),
          // FIX: Used user object properties for IDs to ensure data consistency.
          likes: [user2.userId, user4.userId],
          comments: [
              { id: 'comment-1-1', text: 'Congrats! We swear by Asana.', postedBy: user2, createdAt: new Date(now.getTime() - 1800000 * 1 + 60000) },
              { id: 'comment-1-2', text: 'That\'s awesome! We\'ve been using Notion and love it.', postedBy: user4, createdAt: new Date(now.getTime() - 1800000 * 1 + 120000) }
          ]
      },
      {
          id: 'post-2',
          text: 'Thinking about the future of remote work. What do you think is the biggest challenge for companies going fully remote?',
          poll: {
              id: 'poll-1',
              options: [
                  // FIX: Used user object properties for IDs to ensure data consistency.
                  { id: 'opt-2-1', text: 'Team Culture', votes: [user1.userId] },
                  { id: 'opt-2-2', text: 'Communication', votes: [user3.userId] },
                  { id: 'opt-2-3', text: 'Security', votes: [] }
              ]
          },
          postedBy: user2,
          createdAt: new Date(now.getTime() - 1800000 * 3),
          // FIX: Used user object properties for IDs to ensure data consistency.
          likes: [user1.userId, user3.userId, user4.userId],
          comments: []
      },
      {
        id: 'post-3',
        text: 'Sharing a sneak peek of our new dashboard design. Feedback is welcome! What are the most important metrics you track daily?',
        imageUrl: 'https://picsum.photos/seed/dashboard/600/400',
        postedBy: user3,
        createdAt: new Date(now.getTime() - 1800000 * 5),
        likes: [user1.userId],
        comments: [
            { id: 'comment-3-1', text: 'Looks clean! We focus on daily active users and conversion rate.', postedBy: user1, createdAt: new Date(now.getTime() - 1800000 * 5 + 60000) }
        ]
      }
  ];

  return {
    problems: staticProblems,
    ideas: staticIdeas,
    posts: staticPosts,
  };
};
