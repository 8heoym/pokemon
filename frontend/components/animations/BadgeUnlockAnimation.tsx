'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BadgeUnlockAnimationProps {
  isVisible: boolean;
  badgeName: string;
  badgeDescription: string;
  badgeEmoji?: string;
  regionTheme?: 'grassland' | 'pond' | 'garden' | 'volcano' | 'forest' | 'desert' | 'cave' | 'peak';
  onComplete: () => void;
}

const REGION_CONFIG = {
  grassland: {
    bgGradient: 'from-green-400 via-emerald-500 to-green-600',
    particleColor: '🌿',
    accentColor: 'text-green-100',
    glowColor: 'shadow-green-500/50'
  },
  pond: {
    bgGradient: 'from-blue-400 via-cyan-500 to-blue-600', 
    particleColor: '💧',
    accentColor: 'text-blue-100',
    glowColor: 'shadow-blue-500/50'
  },
  garden: {
    bgGradient: 'from-pink-400 via-rose-500 to-pink-600',
    particleColor: '🌸',
    accentColor: 'text-pink-100', 
    glowColor: 'shadow-pink-500/50'
  },
  volcano: {
    bgGradient: 'from-red-400 via-orange-500 to-red-600',
    particleColor: '🔥',
    accentColor: 'text-red-100',
    glowColor: 'shadow-red-500/50'
  },
  forest: {
    bgGradient: 'from-emerald-400 via-green-500 to-emerald-600',
    particleColor: '🍃',
    accentColor: 'text-emerald-100',
    glowColor: 'shadow-emerald-500/50'
  },
  desert: {
    bgGradient: 'from-yellow-400 via-orange-500 to-yellow-600',
    particleColor: '🏜️',
    accentColor: 'text-yellow-100',
    glowColor: 'shadow-yellow-500/50'
  },
  cave: {
    bgGradient: 'from-gray-400 via-slate-500 to-gray-600',
    particleColor: '💎',
    accentColor: 'text-gray-100',
    glowColor: 'shadow-gray-500/50'
  },
  peak: {
    bgGradient: 'from-indigo-400 via-purple-500 to-indigo-600',
    particleColor: '❄️',
    accentColor: 'text-indigo-100',
    glowColor: 'shadow-indigo-500/50'
  }
} as const;

const BadgeUnlockAnimation: React.FC<BadgeUnlockAnimationProps> = ({
  isVisible,
  badgeName,
  badgeDescription,
  badgeEmoji = '🏆',
  regionTheme = 'grassland',
  onComplete
}) => {
  const config = REGION_CONFIG[regionTheme];

  React.useEffect(() => {
    if (isVisible) {
      // 5초 후 자동으로 닫힘
      const timer = setTimeout(() => {
        onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 배경 오버레이 */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
          />

          {/* 파티클 효과 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 50,
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  y: -50,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1.2, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 4,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              >
                {config.particleColor}
              </motion.div>
            ))}
          </div>

          {/* 메인 콘텐츠 */}
          <motion.div
            className="relative z-10 text-center px-8 py-12 max-w-lg"
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -100 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              delay: 0.2 
            }}
          >
            {/* "배지 획득!" 텍스트 */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className={`text-4xl md:text-6xl font-bold ${config.accentColor} mb-2`}>
                🎉 배지 획득! 🎉
              </h1>
              <div className="text-white text-lg opacity-90">
                새로운 지역을 정복했습니다!
              </div>
            </motion.div>

            {/* 배지 아이콘 */}
            <motion.div
              className={`w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center 
                         shadow-2xl ${config.glowColor} border-4 border-white`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.8, 
                type: "spring", 
                stiffness: 200,
                duration: 1
              }}
            >
              <motion.div
                className="text-6xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                {badgeEmoji}
              </motion.div>
            </motion.div>

            {/* 배지 이름 */}
            <motion.h2
              className={`text-2xl md:text-3xl font-bold ${config.accentColor} mb-3`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              {badgeName}
            </motion.h2>

            {/* 배지 설명 */}
            <motion.p
              className="text-white text-lg opacity-90 leading-relaxed"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              {badgeDescription}
            </motion.p>

            {/* 닫기 버튼 */}
            <motion.button
              onClick={onComplete}
              className="mt-8 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-3 px-8 rounded-full 
                         backdrop-blur-sm border border-white border-opacity-30 transition-all duration-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              계속하기 ✨
            </motion.button>
          </motion.div>

          {/* 반짝임 효과 */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }, (_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute text-white text-xl"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${20 + (i % 3) * 20}%`
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlockAnimation;