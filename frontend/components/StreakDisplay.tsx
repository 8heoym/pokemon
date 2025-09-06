import React from 'react';
import { motion } from 'framer-motion';
import { User } from '@/types';

interface StreakDisplayProps {
  user: User;
  onClaimDailyBonus?: () => void;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ user, onClaimDailyBonus }) => {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return '🏆';
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '💪';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '🌟';
    return '📚';
  };

  const getStreakTitle = (streak: number) => {
    if (streak >= 100) return '전설의 학자';
    if (streak >= 30) return '불타는 열정';
    if (streak >= 14) return '끈기의 달인';
    if (streak >= 7) return '번개 학습자';
    if (streak >= 3) return '꾸준한 학습자';
    return '새로운 시작';
  };

  const getNextMilestone = (streak: number) => {
    const milestones = [3, 7, 14, 30, 50, 100];
    const next = milestones.find(m => m > streak);
    return next || null;
  };

  const nextMilestone = getNextMilestone(user.currentStreak);
  const progress = nextMilestone 
    ? (user.currentStreak / nextMilestone) * 100 
    : 100;

  const canClaimDailyBonus = () => {
    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate.toDateString();
    return today !== lastActive;
  };

  return (
    <motion.div
      className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-xl p-6 text-white shadow-lg"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">
            {getStreakEmoji(user.currentStreak)}
          </div>
          <div>
            <h3 className="text-lg font-bold">연속 학습</h3>
            <p className="text-orange-100 text-sm">{getStreakTitle(user.currentStreak)}</p>
          </div>
        </div>
        
        {canClaimDailyBonus() && onClaimDailyBonus && (
          <motion.button
            onClick={onClaimDailyBonus}
            className="bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            일일 보너스 🎁
          </motion.button>
        )}
      </div>

      {/* Current Streak Display */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold mb-2">
          {user.currentStreak}일
        </div>
        <div className="text-orange-100">
          최장 기록: {user.longestStreak}일
        </div>
      </div>

      {/* Progress to Next Milestone */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>다음 목표</span>
            <span>{nextMilestone}일 ({nextMilestone - user.currentStreak}일 남음)</span>
          </div>
          <div className="w-full bg-orange-300 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-2"
              style={{ width: `${Math.min(progress, 100)}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Streak Benefits */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
          <div className="font-bold">별의모래 보너스</div>
          <div className="text-orange-100">
            {user.currentStreak >= 30 ? '+150%' :
             user.currentStreak >= 14 ? '+100%' :
             user.currentStreak >= 7 ? '+50%' :
             user.currentStreak >= 3 ? '+20%' : '기본'}
          </div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
          <div className="font-bold">일일 보너스</div>
          <div className="text-orange-100">
            {user.currentStreak >= 14 ? '3배' :
             user.currentStreak >= 7 ? '2배' :
             user.currentStreak >= 3 ? '1.5배' : '1배'}
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 text-center text-orange-100 text-sm">
        {user.currentStreak === 0 ? '오늘부터 새로운 시작! 🚀' :
         user.currentStreak < 3 ? '좋은 시작이에요! 계속해보세요 💪' :
         user.currentStreak < 7 ? '훌륭해요! 습관이 만들어지고 있어요 ⭐' :
         user.currentStreak < 14 ? '대단해요! 꾸준함의 힘을 보여주고 있어요 🔥' :
         user.currentStreak < 30 ? '놀라워요! 진정한 학습자의 모습이에요 🏆' :
         '전설적이에요! 당신은 학습의 달인입니다! 👑'}
      </div>
    </motion.div>
  );
};

export default StreakDisplay;