'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PokemonReactionProps {
  isVisible: boolean;
  reaction: 'joy' | 'disappointment' | 'thinking' | 'excitement' | 'idle';
  pokemonName?: string;
  onComplete?: () => void;
}

const REACTION_CONFIG = {
  joy: {
    emoji: '🎉',
    animation: {
      bounce: { scale: [1, 1.2, 1], rotate: [-5, 5, -5, 0] },
      duration: 0.6,
      repeat: 2
    },
    message: '잘했어요!',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  disappointment: {
    emoji: '😅',
    animation: {
      sway: { x: [-10, 10, -5, 5, 0], rotate: [-3, 3, -2, 2, 0] },
      duration: 0.8,
      repeat: 1
    },
    message: '다시 한번!',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800'
  },
  thinking: {
    emoji: '🤔',
    animation: {
      think: { rotate: [0, -10, 10, -5, 5, 0], y: [0, -5, 0] },
      duration: 1,
      repeat: Infinity
    },
    message: '생각해보세요~',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  excitement: {
    emoji: '⚡',
    animation: {
      flash: { scale: [1, 1.3, 1], opacity: [1, 0.8, 1] },
      duration: 0.3,
      repeat: 3
    },
    message: '대단해요!',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  idle: {
    emoji: '😊',
    animation: {
      breathe: { scale: [1, 1.05, 1] },
      duration: 2,
      repeat: Infinity
    },
    message: '함께 문제를 풀어봐요!',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  }
} as const;

const PokemonReaction: React.FC<PokemonReactionProps> = ({
  isVisible,
  reaction,
  pokemonName = '파트너',
  onComplete
}) => {
  const config = REACTION_CONFIG[reaction];

  React.useEffect(() => {
    if (isVisible && reaction !== 'idle' && reaction !== 'thinking' && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, config.animation.duration * 1000 * (config.animation.repeat + 1));
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, reaction, config, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-4 z-40 pointer-events-none"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* 말풍선 */}
          <div className={`${config.bgColor} ${config.textColor} px-4 py-2 rounded-xl shadow-lg relative mb-2`}>
            <div className="text-sm font-medium">
              {config.message}
            </div>
            {/* 말풍선 꼬리 */}
            <div 
              className={`absolute bottom-0 left-6 transform translate-y-full`}
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${config.bgColor.includes('green') ? '#dcfce7' : 
                                      config.bgColor.includes('orange') ? '#fed7aa' :
                                      config.bgColor.includes('blue') ? '#dbeafe' :
                                      config.bgColor.includes('yellow') ? '#fef3c7' : '#f3f4f6'}`
              }}
            />
          </div>

          {/* 파트너 포켓몬 (간단한 이모지 버전) */}
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-3xl border-4 border-blue-200"
              animate={config.animation as any}
              transition={{
                duration: config.animation.duration,
                repeat: config.animation.repeat,
                repeatType: reaction === 'thinking' || reaction === 'idle' ? 'loop' : 'reverse',
                ease: "easeInOut"
              }}
            >
              {config.emoji}
            </motion.div>
            
            <div className="bg-white px-3 py-1 rounded-lg shadow-md">
              <div className="text-xs text-gray-600 font-medium">
                {pokemonName}
              </div>
            </div>
          </div>

          {/* 추가 이펙트 (기쁨일 때 주변에 별가루) */}
          {reaction === 'joy' && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400 text-sm"
                  initial={{ 
                    x: Math.random() * 60 - 30,
                    y: Math.random() * 60 - 30,
                    scale: 0,
                    opacity: 0 
                  }}
                  animate={{ 
                    scale: 1,
                    opacity: [0, 1, 0],
                    y: -20 
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: 2 
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PokemonReaction;