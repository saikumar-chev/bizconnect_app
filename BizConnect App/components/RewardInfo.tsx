import React from 'react';
import { Reward } from '../types';
import { BriefcaseIcon, ChartPieIcon, GiftIcon } from './icons';
import { formatReward } from '../utils/formatters';

export const RewardInfo: React.FC<{ reward: Reward }> = ({ reward }) => {
    const iconClass = "h-5 w-5 mr-2 text-slate-400";
    const textClass = "font-semibold";

    switch (reward.type) {
        case 'money':
            return <div className="flex items-center text-slate-500"><span className="font-bold text-slate-400 mr-2 text-lg">₹</span><span>Reward: <span className={`${textClass} text-teal-600`}>{formatReward(reward)}</span></span></div>;
        case 'equity':
            return <div className="flex items-center text-slate-500"><ChartPieIcon className={iconClass} /><span>Equity: <span className={`${textClass} text-slate-700`}>{reward.value}</span></span></div>;
        case 'job':
            return <div className="flex items-center text-slate-500"><BriefcaseIcon className={iconClass} /><span>Offer: <span className={`${textClass} text-slate-700`}>{reward.value}</span></span></div>;
        case 'other':
            return <div className="flex items-center text-slate-500"><GiftIcon className={iconClass} /><span>Reward: <span className={`${textClass} text-slate-700`}>{reward.value}</span></span></div>;
        default:
            return null;
    }
};
