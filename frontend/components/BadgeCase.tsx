import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Badge } from '@/types';
import { PokemonCard, PokemonButton } from './ui';

interface BadgeCaseProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const BadgeCase: React.FC<BadgeCaseProps> = ({ user, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'achievement' | 'progress' | 'streak' | 'special'>('all');

  // Mock badges data (in real app, fetch from API)
  const allBadges: Badge[] = [
    {
      id: 'first_steps',
      name: '첫 걸음',
      description: '첫 번째 문제를 풀었습니다',
      imageUrl: '/images/badges/first_steps.png',
      category: 'achievement',
      earnedAt: new Date('2025-09-01'),
    },
    {
      id: 'table_master_2',
      name: '2단 마스터',
      description: '2단 구구단을 완벽하게 마스터했습니다',
      imageUrl: '/images/badges/table_2.png',
      category: 'progress',
      earnedAt: user.completedTables.includes(2) ? new Date('2025-09-02') : undefined,
    },
    {
      id: 'table_master_3',
      name: '3단 마스터',
      description: '3단 구구단을 완벽하게 마스터했습니다',
      imageUrl: '/images/badges/table_3.png',
      category: 'progress',
      earnedAt: user.completedTables.includes(3) ? new Date('2025-09-03') : undefined,
    },
    {
      id: 'table_master_5',
      name: '5단 마스터',
      description: '5단 구구단을 완벽하게 마스터했습니다',
      imageUrl: '/images/badges/table_5.png',
      category: 'progress',
      earnedAt: user.completedTables.includes(5) ? new Date('2025-09-04') : undefined,
    },
    {
      id: 'dedication_streak',
      name: '끈기의 상징',
      description: '30일 연속 학습을 달성했습니다',
      imageUrl: '/images/badges/dedication.png',
      category: 'streak',
      earnedAt: user.currentStreak >= 30 || user.longestStreak >= 30 ? new Date('2025-09-05') : undefined,
    },
    {
      id: 'streak_master',
      name: '연속 학습의 달인',
      description: '50일 연속 학습을 달성했습니다',
      imageUrl: '/images/badges/streak_master.png',
      category: 'streak',
      earnedAt: user.currentStreak >= 50 || user.longestStreak >= 50 ? new Date('2025-09-06') : undefined,
    },
    {
      id: 'accuracy_master',
      name: '정확도의 달인',
      description: '100문제 연속 정답을 달성했습니다',
      imageUrl: '/images/badges/accuracy.png',
      category: 'achievement',
    },
    {
      id: 'speed_demon',
      name: '번개같은 속도',
      description: '평균 5초 이내로 50문제를 풀었습니다',
      imageUrl: '/images/badges/speed.png',
      category: 'achievement',
    },
    {
      id: 'pokemon_collector',
      name: '포켓몬 컬렉터',
      description: '100마리의 포켓몬을 수집했습니다',
      imageUrl: '/images/badges/collector.png',
      category: 'achievement',
      earnedAt: user.caughtPokemon.length >= 100 ? new Date('2025-09-07') : undefined,
    },
    {
      id: 'all_tables_master',
      name: '구구단 마스터',
      description: '모든 구구단을 완벽하게 마스터했습니다',
      imageUrl: '/images/badges/all_master.png',
      category: 'special',
      earnedAt: user.completedTables.length >= 8 ? new Date('2025-09-08') : undefined,
    }
  ];

  const earnedBadges = allBadges.filter(badge => badge.earnedAt);
  const filteredBadges = selectedCategory === 'all' 
    ? allBadges 
    : allBadges.filter(badge => badge.category === selectedCategory);

  const getBadgeIcon = (category: Badge['category']) => {
    switch (category) {
      case 'achievement': return '🏆';
      case 'progress': return '📈';
      case 'streak': return '🔥';
      case 'special': return '⭐';
      default: return '🎖️';
    }
  };

  const getBadgeColor = (category: Badge['category']) => {
    switch (category) {
      case 'achievement': return 'from-yellow-400 to-yellow-600';
      case 'progress': return 'from-blue-400 to-blue-600';
      case 'streak': return 'from-red-400 to-red-600';
      case 'special': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const categoryLabels = {
    all: '전체',
    achievement: '업적',
    progress: '진행도', 
    streak: '연속 학습',
    special: '특별'
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🏆</div>
                <div>
                  <h2 className="text-2xl font-bold">배지 케이스</h2>
                  <p className="text-yellow-200">
                    획득한 배지: {earnedBadges.length}/{allBadges.length}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-yellow-200 text-2xl p-2"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>컬렉션 진행도</span>
                <span>{Math.round((earnedBadges.length / allBadges.length) * 100)}%</span>
              </div>
              <div className="w-full bg-yellow-600 rounded-full h-2">
                <motion.div
                  className="bg-white rounded-full h-2"
                  style={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedCategory(key as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getBadgeIcon(key === 'all' ? 'achievement' : key as Badge['category'])} {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Badges Grid */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PokemonCard className="h-full text-center relative">
                    {/* Badge Image */}
                    <div className={`
                      w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl
                      bg-gradient-to-br ${getBadgeColor(badge.category)}
                      ${badge.earnedAt ? 'shadow-lg' : 'grayscale opacity-40'}
                    `}>
                      {getBadgeIcon(badge.category)}
                    </div>

                    {/* Badge Info */}
                    <h3 className={`font-bold text-sm mb-2 ${badge.earnedAt ? 'text-gray-800' : 'text-gray-400'}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-xs mb-3 ${badge.earnedAt ? 'text-gray-600' : 'text-gray-400'}`}>
                      {badge.description}
                    </p>

                    {/* Earned Date or Lock */}
                    {badge.earnedAt ? (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ {badge.earnedAt.toLocaleDateString('ko-KR')}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        🔒 미달성
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className={`
                      absolute top-2 right-2 text-xs px-2 py-1 rounded-full text-white
                      bg-gradient-to-r ${getBadgeColor(badge.category)}
                    `}>
                      {getBadgeIcon(badge.category)}
                    </div>

                    {/* New Badge Animation */}
                    {badge.earnedAt && (new Date().getTime() - badge.earnedAt.getTime()) < 24 * 60 * 60 * 1000 && (
                      <motion.div
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [1, 0.8, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                      >
                        NEW!
                      </motion.div>
                    )}
                  </PokemonCard>
                </motion.div>
              ))}
            </div>

            {filteredBadges.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-gray-500">해당 카테고리에 배지가 없습니다.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 text-center">
            <p className="text-gray-600 text-sm">
              💡 더 많은 문제를 풀고 연속 학습을 이어가서 새로운 배지를 획득해보세요!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeCase;