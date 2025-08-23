'use client';

import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ 
  message = "포켓몬 세계로 이동 중..." 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 로딩 애니메이션 */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <div className="loading-pokeball mx-auto mb-4"></div>
        </motion.div>

        {/* 포켓몬 이모지들 */}
        <motion.div 
          className="flex justify-center space-x-4 text-4xl mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.span
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0
            }}
          >
            ⚡
          </motion.span>
          <motion.span
            animate={{ 
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0.3
            }}
          >
            🔥
          </motion.span>
          <motion.span
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0.6
            }}
          >
            ⭐
          </motion.span>
        </motion.div>

        {/* 로딩 메시지 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-2 font-pokemon">
            {message}
          </h2>
          <div className="flex justify-center items-center space-x-1 text-blue-500">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              •
            </motion.span>
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              •
            </motion.span>
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            >
              •
            </motion.span>
          </div>
        </motion.div>

        {/* 로딩 팁들 */}
        <motion.div 
          className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div
            key={Math.floor(Date.now() / 3000)} // 3초마다 변경
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {(() => {
              const tips = [
                "🎮 곱셈은 같은 수를 여러 번 더하는 것이에요!",
                "🔥 문제를 맞추면 포켓몬을 잡을 수 있어요!",
                "⭐ 힌트를 보면 더 쉽게 풀 수 있어요!",
                "🚀 구구단을 외우면 레벨업이 빨라져요!",
                "💎 희귀한 포켓몬일수록 더 많은 경험치를 줘요!"
              ];
              const randomTip = tips[Math.floor(Date.now() / 3000) % tips.length];
              return (
                <div>
                  <p className="text-sm font-bold text-blue-700 mb-1">💡 알아두세요!</p>
                  <p className="text-sm text-blue-600">{randomTip}</p>
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}