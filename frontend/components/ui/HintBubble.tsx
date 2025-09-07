'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HintBubbleProps {
  isVisible: boolean;
  hintText: string;
  helperPokemon?: 'rotom' | 'professor-oak' | 'eevee';
  onClose?: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
}

const HELPER_CONFIG = {
  rotom: {
    emoji: '📱',
    name: '로토무 도감',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    accentColor: 'bg-blue-500'
  },
  'professor-oak': {
    emoji: '👨‍🔬',
    name: '오박사',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    accentColor: 'bg-green-500'
  },
  eevee: {
    emoji: '🦊',
    name: '이브이',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    accentColor: 'bg-orange-500'
  }
} as const;

const POSITION_STYLES = {
  'bottom-left': 'fixed bottom-20 left-4',
  'bottom-right': 'fixed bottom-20 right-4',
  'top-left': 'fixed top-20 left-4',
  'top-right': 'fixed top-20 right-4',
  'center': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
} as const;

const HintBubble: React.FC<HintBubbleProps> = ({
  isVisible,
  hintText,
  helperPokemon = 'rotom',
  onClose,
  position = 'bottom-right'
}) => {
  const config = HELPER_CONFIG[helperPokemon];
  const positionClass = POSITION_STYLES[position];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={`${positionClass} z-50 max-w-sm`}>
          {/* PRD [F-3.3]: 도우미 포켓몬과 말풍선 */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.3 
            }}
          >
            {/* 말풍선 */}
            <div className={`${config.bgColor} ${config.borderColor} ${config.textColor} 
                           border-2 rounded-xl p-4 shadow-lg mb-3 relative`}>
              
              {/* 말풍선 내용 */}
              <div className="space-y-2">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-lg">{config.emoji}</div>
                    <div className="text-sm font-bold">{config.name}</div>
                  </div>
                  
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* 힌트 내용 */}
                <div className="text-sm leading-relaxed">
                  💡 {hintText}
                </div>
                
                {/* CRA 원칙 적용: 시각적 설명 추가 */}
                {hintText.includes('×') && (
                  <div className="mt-3 p-2 bg-white bg-opacity-50 rounded-lg">
                    <div className="text-xs text-gray-600">
                      <strong>시각적 설명:</strong>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex space-x-1">
                        {/* 간단한 시각적 표현 */}
                        <span className="text-2xl">🎯</span>
                        <span className="text-sm">그룹으로 나누어 세어보세요!</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 말풍선 꼬리 */}
              <div 
                className="absolute bottom-0 left-6 transform translate-y-full"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `8px solid ${
                    config.bgColor.includes('blue') ? '#dbeafe' :
                    config.bgColor.includes('green') ? '#dcfce7' :
                    config.bgColor.includes('orange') ? '#fed7aa' : '#f3f4f6'
                  }`
                }}
              />
            </div>

            {/* 도우미 캐릭터 */}
            <motion.div
              className="flex justify-start"
              animate={{
                x: [0, -2, 2, 0],
                rotate: [0, -1, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
            >
              <div className={`w-16 h-16 ${config.accentColor} rounded-full 
                             flex items-center justify-center text-2xl 
                             shadow-lg border-4 border-white`}>
                {config.emoji}
              </div>
            </motion.div>

            {/* 반짝임 효과 */}
            <div className="absolute -top-2 -right-2 pointer-events-none">
              <motion.div
                className="text-yellow-400 text-sm"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                ✨
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HintBubble;