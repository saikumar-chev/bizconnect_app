import React from 'react';
import { Post, User } from '../types';
import PostCard from './PostCard';

interface FeedProps {
  posts: Post[];
  currentUser: User | null;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onVoteOnPoll: (postId: string, optionId: string) => void;
  onViewProfile: (user: User) => void;
  onSharePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
}

const Feed: React.FC<FeedProps> = ({ posts, currentUser, onLikePost, onAddComment, onViewProfile, onDeleteComment, onVoteOnPoll, onSharePost, onDeletePost }) => {
  if (posts.length === 0) {
    return <p className="text-center text-slate-500">The feed is empty. Why not create the first post?</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {posts.map((post) => (
        <PostCard
          key={post.id} 
          post={post}
          currentUser={currentUser}
          onLikePost={onLikePost}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          onViewProfile={onViewProfile}
          onVoteOnPoll={onVoteOnPoll}
          onSharePost={onSharePost}
          onDeletePost={onDeletePost}
        />
      ))}
    </div>
  );
};

export default Feed;