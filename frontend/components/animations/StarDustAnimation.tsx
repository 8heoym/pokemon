'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StarDustParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface StarDustAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  amount: number;
  sourceX?: number;
  sourceY?: number;
}

const StarDustAnimation: React.FC<StarDustAnimationProps> = ({
  isActive,
  onComplete,
  amount,
  sourceX = 50,
  sourceY = 70
}) => {
  const [particles, setParticles] = useState<StarDustParticle[]>([]);

  useEffect(() => {
    if (isActive) {
      // PRD [F-3.2]: 별의모래가 화면에 쏟아져 나오는 효과
      const newParticles: StarDustParticle[] = Array.from({ length: amount }, (_, index) => ({
        id: index,
        x: sourceX + (Math.random() - 0.5) * 40, // 소스 주변으로 분산
        y: sourceY + (Math.random() - 0.5) * 20,
        size: Math.random() * 8 + 4, // 4-12px 크기
        delay: index * 0.05 // 순차적 등장
      }));
      
      setParticles(newParticles);
      
      // 애니메이션 완료 후 정리
      setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 3000);
    }
  }, [isActive, amount, sourceX, sourceY, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute flex items-center justify-center"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            initial={{ 
              opacity: 0, 
              scale: 0,
              rotate: 0,
              y: 0
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.8],
              rotate: 360,
              y: [-20, -60, -100], // 위로 올라가다가 상단 UI로
            }}
            transition={{ 
              duration: 2.5,
              delay: particle.delay,
              times: [0, 0.2, 0.8, 1],
              ease: "easeOut"
            }}
          >
            {/* 별의모래 파티클 */}
            <div 
              className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-full"
              style={{
                width: '100%',
                height: '100%',
                boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
                filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))'
              }}
            >
              {/* 반짝임 효과 */}
              <motion.div
                className="absolute inset-0 bg-white rounded-full opacity-40"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </motion.div>
        ))}
        
        {/* 상단 UI로 흡수되는 효과 */}
        <motion.div
          className="absolute top-4 right-4 flex items-center space-x-2"
          initial={{ scale: 1 }}
          animate={isActive ? { 
            scale: [1, 1.1, 1],
            filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
          } : {}}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <div className="text-yellow-400 text-lg">✨</div>
          <div className="text-yellow-400 font-bold">+{amount}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StarDustAnimation;