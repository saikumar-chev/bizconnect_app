import React, { useState, useMemo } from 'react';
import { User, Post, Problem, Idea } from '../types';
import { CogIcon } from './icons';
import Feed from './Feed';
import ProblemList from './ProblemList';
import IdeaList from './IdeaList';

interface ProfilePageProps {
    user: User;
    currentUser: User | null;
    posts: Post[];
    problems: Problem[];
    ideas: Idea[];
    onEditProfile: () => void;
    onViewProfile: (user: User) => void;
    onOpenDetails: (item: Problem | Idea) => void;
    onLikePost: (postId: string) => void;
    onAddComment: (postId: string, commentText: string) => void;
    onVoteOnPoll: (postId: string, optionId: string) => void;
    onDeleteComment: (postId: string, commentId: string) => void;
    onSharePost: (postId: string) => void;
    onDeletePost: (postId: string) => void;
    onDeleteChallenge: (challengeId: string) => void;
    onDeleteIdea: (ideaId: string) => void;
    onShowUserList: (userIds: string[], title: string) => void;
}

type ProfileTab = 'posts' | 'challenges' | 'ideas';

const ProfilePage: React.FC<ProfilePageProps> = (props) => {
    const { user, currentUser, posts, problems, ideas, onEditProfile } = props;
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

    const userContent = useMemo(() => ({
        posts: posts.filter(p => p.postedBy.userId === user.userId),
        problems: problems.filter(p => p.postedBy.userId === user.userId),
        ideas: ideas.filter(i => i.postedBy.userId === user.userId),
    }), [posts, problems, ideas, user.userId]);

    const isCurrentUserProfile = currentUser?.userId === user.userId;

    const getTabClass = (tab: ProfileTab) => 
        `px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${
            activeTab === tab 
            ? 'bg-slate-800 text-white' 
            : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
        }`;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'posts':
                return userContent.posts.length > 0 ? (
                    <Feed 
                        posts={userContent.posts} 
                        currentUser={props.currentUser}
                        onLikePost={props.onLikePost}
                        onAddComment={props.onAddComment}
                        onVoteOnPoll={props.onVoteOnPoll}
                        onViewProfile={props.onViewProfile}
                        onSharePost={props.onSharePost}
                        onDeletePost={props.onDeletePost}
                        onDeleteComment={props.onDeleteComment}
                        onShowUserList={props.onShowUserList}
                    />
                ) : (
                    <p className="text-center text-slate-500 py-8">This user hasn't made any posts yet.</p>
                );
            case 'challenges':
                return userContent.problems.length > 0 ? (
                    <ProblemList 
                        problems={userContent.problems} 
                        currentUser={props.currentUser}
                        onOpenDetails={props.onOpenDetails} 
                        onViewProfile={props.onViewProfile}
                        onDeleteChallenge={props.onDeleteChallenge}
                    />
                ) : (
                    <p className="text-center text-slate-500 py-8">This user hasn't posted any challenges yet.</p>
                );
            case 'ideas':
                return userContent.ideas.length > 0 ? (
                    <IdeaList 
                        ideas={userContent.ideas} 
                        currentUser={props.currentUser}
                        onOpenDetails={props.onOpenDetails} 
                        onViewProfile={props.onViewProfile}
                        onDeleteIdea={props.onDeleteIdea}
                    />
                ) : (
                    <p className="text-center text-slate-500 py-8">This user hasn't posted any ideas yet.</p>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start">
                    <img src={user.avatarUrl} alt={user.name} className="h-24 w-24 md:h-32 md:w-32 rounded-full ring-4 ring-slate-200 flex-shrink-0" />
                    <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left flex-grow">
                        <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
                        <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                        <p className="mt-4 text-slate-600 leading-relaxed">{user.bio || 'This user has not set a bio yet.'}</p>
                    </div>
                    {isCurrentUserProfile && (
                        <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0">
                            <button onClick={onEditProfile} className="flex items-center justify-center w-full md:w-auto bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
                                <CogIcon className="h-5 w-5 mr-2" />
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-slate-200">
                    <div className="flex justify-center p-2 space-x-1 sm:space-x-2">
                        <button onClick={() => setActiveTab('posts')} className={getTabClass('posts')}>
                            Posts ({userContent.posts.length})
                        </button>
                        <button onClick={() => setActiveTab('challenges')} className={getTabClass('challenges')}>
                            Challenges ({userContent.problems.length})
                        </button>
                        <button onClick={() => setActiveTab('ideas')} className={getTabClass('ideas')}>
                            Ideas ({userContent.ideas.length})
                        </button>
                    </div>
                </div>
                <div className="p-2 sm:p-4">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;