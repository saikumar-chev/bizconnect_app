import React, { useState } from 'react';
import { Post, User, Comment, PollOption } from '../types';
import { HeartIcon, ChatBubbleIcon, PaperPlaneIcon, TrashIcon, ShareIcon } from './icons';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onViewProfile: (user: User) => void;
  onVoteOnPoll: (postId: string, optionId: string) => void;
  onSharePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onShowUserList: (userIds: string[], title: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLikePost,
  onAddComment,
  onDeleteComment,
  onViewProfile,
  onVoteOnPoll,
  onSharePost,
  onDeletePost,
  onShowUserList,
}) => {
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };

  const isLiked = currentUser ? post.likes.includes(currentUser.userId) : false;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => onViewProfile(post.postedBy)} className="flex items-center">
          <img src={post.postedBy.avatarUrl} alt={post.postedBy.name} className="h-10 w-10 rounded-full mr-3" />
          <div>
            <p className="font-semibold text-slate-800">{post.postedBy.name}</p>
            <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </button>
        {currentUser?.userId === post.postedBy.userId && (
          <button
            onClick={() => onDeletePost(post.id)}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
            aria-label="Delete post"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4">
        <p className="text-slate-700 whitespace-pre-wrap">{post.text}</p>
      </div>
      {post.imageUrl && (
        <div className="bg-slate-100">
          <img src={post.imageUrl} alt="Post content" className="w-full max-h-96 object-cover" />
        </div>
      )}

      {/* Poll Section */}
      {post.poll && currentUser && (
        <div className="px-4 pt-2 pb-4 space-y-3">{(() => {
          const poll = post.poll!; // We know poll is defined here from the check above
          const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);
          return <>
            {poll.options.map(option => {
            const votePercentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
            const hasVotedForThis = option.votes.includes(currentUser.userId);

            return (
              <button
                key={option.id}
                onClick={() => onVoteOnPoll(post.id, option.id)}
                className={`w-full text-left group relative border rounded-md p-3 transition-all duration-200 ${hasVotedForThis ? 'border-slate-400 bg-slate-100' : 'border-slate-300 hover:border-slate-400'}`}
              >
                  <div
                      className="absolute top-0 left-0 h-full bg-teal-400/20 rounded-l-md transition-all duration-500 ease-out"
                      style={{ width: `${votePercentage}%` }}
                  />
                  <div className="relative flex justify-between items-center z-10">
                    <div className="flex items-center" onClick={e => e.stopPropagation()}>
                      <span className={`font-medium text-sm ${hasVotedForThis ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{option.text}</span>
                      {hasVotedForThis && <span className="ml-2 text-teal-600">✓</span>}
                    </div>
                    <div className="flex items-center space-x-4" onClick={e => e.stopPropagation()}>
                      {option.votes.length > 0 ? (
                        <button onClick={() => onShowUserList(option.votes, `Votes for "${option.text}"`)} className="text-xs text-slate-500 font-semibold hover:underline">
                          {option.votes.length} {option.votes.length === 1 ? 'vote' : 'votes'}
                        </button>
                      ) : <span className="text-xs text-slate-400">0 votes</span>}
                      <span className="text-sm text-slate-600 font-bold w-10 text-right">{Math.round(votePercentage)}%</span>
                    </div>
                  </div>
              </button>
            );
            })}
            <div className="text-right text-xs text-slate-500 pt-1">
              Total Votes: <button onClick={() => onShowUserList(poll.options.flatMap(o => o.votes), 'All Voters')} className="font-semibold hover:underline">
                {totalVotes}
              </button>
            </div>
          </>})()}
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4 flex justify-between items-center border-t border-slate-200">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1 text-slate-500">
            <button onClick={() => onLikePost(post.id)} className="p-1 rounded-full hover:bg-red-50" aria-label="Like post">
              <HeartIcon className={`h-6 w-6 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`} />
            </button>
            {post.likes.length > 0 ? (
              <button onClick={() => onShowUserList(post.likes, 'Likes')} className="text-sm font-medium hover:underline">{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</button>
            ) : (
              <span className="text-sm font-medium">0 likes</span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-slate-500">
            <ChatBubbleIcon className="h-6 w-6" />
            <span className="text-sm font-medium">{post.comments.length}</span>
          </div>
        </div>
        <div>
          <button onClick={() => onSharePost(post.id)} className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 transition-colors" aria-label="Share post">
            <ShareIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="space-y-4">
          {post.comments.map((comment: Comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <button onClick={() => onViewProfile(comment.postedBy)}>
                <img src={comment.postedBy.avatarUrl} alt={comment.postedBy.name} className="h-8 w-8 rounded-full" />
              </button>
              <div className="flex-1">
                <div className="bg-slate-100 rounded-lg p-3">
                  <div className="flex items-baseline justify-between">
                    <button onClick={() => onViewProfile(comment.postedBy)} className="font-semibold text-sm text-slate-800 hover:underline">
                      {comment.postedBy.name}
                    </button>
                    {/* --- DELETE BUTTON LOGIC --- */}
                    {currentUser?.userId === comment.postedBy.userId && (
                      <button
                        onClick={() => onDeleteComment(post.id, comment.id)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                        aria-label="Delete comment"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{comment.text}</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Form */}
        {currentUser && (
          <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center space-x-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-8 w-8 rounded-full" />
            <div className="relative flex-grow">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800 disabled:text-slate-300"
                disabled={!commentText.trim()}
                aria-label="Post comment"
              >
                <PaperPlaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostCard;