import React, { useState, useMemo } from 'react';
import { User, Post, Problem, Idea } from '../types';
import PostCard from './PostCard';
import ProblemCard from './ProblemCard';
import IdeaCard from './IdeaCard';
import { BriefcaseIcon, LightbulbIcon, ClipboardListIcon } from './icons';


type ProfileTab = 'posts' | 'challenges' | 'ideas';

interface ProfilePageProps {
    user: User;
    currentUser: User | null;
    posts: Post[];
    problems: Problem[];
    ideas: Idea[];
    onViewProfile: (user: User) => void;
    onOpenDetails: (item: Problem | Idea) => void;
    onEditProfile: () => void;
    onLikePost: (postId: string) => void;
    onAddComment: (postId: string, text: string) => void;
    onVoteOnPoll: (postId: string, optionId: string) => void;
    onSharePost: (postId: string) => void;
    onDeletePost: (postId: string) => void;
    onDeleteChallenge: (challengeId: string) => void;
    onDeleteComment: (postId: string, commentId: string) => void;
    onDeleteIdea: (ideaId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
    user, 
    currentUser, 
    posts, 
    problems, 
    ideas,
    onViewProfile,
    onOpenDetails,
    onEditProfile,
    onLikePost,
    onAddComment,
    onVoteOnPoll,
    onSharePost,
    onDeletePost,
    onDeleteChallenge,
    onDeleteComment,
    onDeleteIdea,
}) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

    const userPosts = useMemo(() => posts.filter(p => p.postedBy.userId === user.userId).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()), [posts, user.userId]);
    const userProblems = useMemo(() => problems.filter(p => p.postedBy.userId === user.userId).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()), [problems, user.userId]);
    const userIdeas = useMemo(() => ideas.filter(p => p.postedBy.userId === user.userId).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()), [ideas, user.userId]);

    const isCurrentUserProfile = user.userId === currentUser?.userId;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'posts':
                return (
                    <div className="max-w-2xl mx-auto space-y-8">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
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
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-10">This user hasn't made any posts yet.</p>
                        )}
                    </div>
                );
            case 'challenges':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {userProblems.length > 0 ? (
                            userProblems.map(problem => (
                                <ProblemCard key={problem.id} problem={problem} currentUser={currentUser} onOpenDetails={onOpenDetails} onViewProfile={onViewProfile} onDelete={onDeleteChallenge} /> // Pass onDeleteChallenge to onDelete
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-10 col-span-full">This user hasn't posted any challenges.</p>
                        )}
                    </div>
                );
            case 'ideas':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {userIdeas.length > 0 ? (
                            userIdeas.map(idea => (
                                <IdeaCard key={idea.id} idea={idea} currentUser={currentUser} onOpenDetails={onOpenDetails} onViewProfile={onViewProfile} onDelete={onDeleteIdea} /> // Pass onDeleteIdea to onDelete
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-10 col-span-full">This user hasn't posted any ideas.</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    }

    const getTabClass = (tab: ProfileTab) => {
        return `px-4 py-2 font-semibold text-sm rounded-md transition-colors ${
            activeTab === tab 
            ? 'bg-slate-800 text-white' 
            : 'text-slate-600 hover:bg-slate-200'
        }`;
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 flex flex-col md:flex-row items-center text-center md:text-left">
                <img 
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-32 w-32 rounded-full ring-4 ring-slate-200 flex-shrink-0"
                />
                <div className="mt-4 md:mt-0 md:ml-8 flex-grow">
                    <div className="flex items-center justify-center md:justify-between">
                        <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                        {isCurrentUserProfile && (
                            <button 
                                onClick={onEditProfile}
                                className="hidden md:inline-block px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                    <p className="mt-4 text-slate-700 leading-relaxed">{user.bio || "This user hasn't written a bio yet."}</p>
                    <div className="mt-6 flex justify-center md:justify-start space-x-6 text-slate-600">
                        <div className="flex items-center space-x-2">
                            <ClipboardListIcon className="h-5 w-5 text-slate-400" />
                            <span className="font-semibold">{userPosts.length}</span>
                            <span>Posts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <BriefcaseIcon className="h-5 w-5 text-slate-400" />
                            <span className="font-semibold">{userProblems.length}</span>
                            <span>Challenges</span>
                        </div>
                         <div className="flex items-center space-x-2">
                            <LightbulbIcon className="h-5 w-5 text-slate-400" />
                            <span className="font-semibold">{userIdeas.length}</span>
                            <span>Ideas</span>
                        </div>
                    </div>
                     {isCurrentUserProfile && (
                        <button 
                            onClick={onEditProfile}
                            className="md:hidden mt-4 w-full px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Content Tabs */}
            <div className="mt-8">
                <div className="border-b border-slate-200 mb-8">
                    <nav className="flex justify-center -mb-px space-x-4" aria-label="Tabs">
                         <button onClick={() => setActiveTab('posts')} className={getTabClass('posts')}>
                            Posts
                         </button>
                         <button onClick={() => setActiveTab('challenges')} className={getTabClass('challenges')}>
                            Challenges
                         </button>
                         <button onClick={() => setActiveTab('ideas')} className={getTabClass('ideas')}>
                            Ideas
                         </button>
                    </nav>
                </div>
                {renderTabContent()}
            </div>
        </div>
    );
}

export default ProfilePage;