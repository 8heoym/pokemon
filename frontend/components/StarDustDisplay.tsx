import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types';

interface StarDustDisplayProps {
  user: User;
  recentEarned?: number;
  className?: string;
}

const StarDustDisplay: React.FC<StarDustDisplayProps> = ({ 
  user, 
  recentEarned = 0, 
  className = '' 
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  React.useEffect(() => {
    if (recentEarned > 0) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentEarned]);

  const formatStarDust = (amount: number) => {
    if (amount >= 10000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toLocaleString();
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="text-2xl">✨</div>
          <div>
            <h3 className="font-bold text-lg">별의모래</h3>
            <p className="text-purple-200 text-xs">Star Dust</p>
          </div>
        </div>

        {/* Amount Display */}
        <div className="text-center">
          <motion.div
            className="text-3xl font-bold mb-2"
            key={user.starDust} // Re-render animation when amount changes
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            {formatStarDust(user.starDust)}
          </motion.div>
          
          {/* Recent Earned Animation */}
          <AnimatePresence>
            {showAnimation && recentEarned > 0 && (
              <motion.div
                className="absolute -top-2 right-2 bg-yellow-400 text-yellow-900 text-sm font-bold px-2 py-1 rounded-full"
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.5 }}
                transition={{ duration: 0.8 }}
              >
                +{recentEarned}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-purple-200 text-sm">
            포켓몬 상점 화폐
          </div>
        </div>

        {/* Star Dust Sparkle Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 20}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Usage Tips */}
      <div className="mt-2 text-xs text-gray-600 text-center">
        정답을 맞혀서 별의모래를 모아보세요! ⭐
      </div>
    </div>
  );
};

export default StarDustDisplay;