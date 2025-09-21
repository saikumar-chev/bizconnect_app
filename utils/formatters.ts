import { Reward } from '../types';

export const formatReward = (reward: Reward): string => {
  if (reward.type === 'money') {
    // Use Intl.NumberFormat for proper comma formatting and prepend the Rupee symbol.
    const numberValue = parseFloat(reward.value.replace(/,/g, ''));
    if (isNaN(numberValue)) {
      return `₹ ${reward.value}`; // Fallback for non-numeric values
    }
    return `₹${new Intl.NumberFormat('en-IN').format(numberValue)}`;
  }
  return reward.value;
};