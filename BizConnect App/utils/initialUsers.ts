import { User } from '../types';

export const initialUsers: User[] = [
  {
    userId: 'user-01',
    name: 'SaiKumar Chevella',
    email: 'saikumar@example.com',
    avatarUrl: 'https://i.pravatar.cc/48?u=saikumar',
    bio: 'Serial entrepreneur and full-stack developer with a passion for disruptive SaaS products. Always on the lookout for the next big thing.'
  },
  {
    userId: 'user-02',
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatarUrl: 'https://i.pravatar.cc/48?u=janedoe',
    bio: 'Marketing guru specializing in early-stage startups. Let\'s build a brand that resonates.'
  },
  {
    // FIX: Normalized userId for consistency.
    userId: 'user-03',
    name: 'Carlos Gomez',
    email: 'carlos@example.com',
    avatarUrl: 'https://i.pravatar.cc/48?u=carlosgomez',
    bio: 'E-commerce specialist focusing on sustainable brands.'
  },
  {
    // FIX: Normalized userId for consistency.
    userId: 'user-04',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    avatarUrl: 'https://i.pravatar.cc/48?u=mariagarcia',
    bio: 'Ed-tech innovator and developer.'
  }
];
