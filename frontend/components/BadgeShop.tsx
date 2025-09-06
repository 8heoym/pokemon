import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShopItem } from '@/types';
import { PokemonCard, PokemonButton } from './ui';

interface BadgeShopProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (itemId: string) => Promise<{ success: boolean; message: string }>;
}

const BadgeShop: React.FC<BadgeShopProps> = ({ user, isOpen, onClose, onPurchase }) => {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock shop items (in real app, fetch from API)
  const mockShopItems: ShopItem[] = [
    {
      id: 'golden_pokeball',
      name: '황금 포켓볼',
      description: '포켓몬 포획 확률 10% 증가',
      price: 500,
      type: 'functional',
      imageUrl: '/images/items/golden_pokeball.png',
      available: user.trainerLevel >= 5,
      purchasedAt: user.purchasedItems?.includes('golden_pokeball') ? new Date() : undefined
    },
    {
      id: 'experience_boost',
      name: '경험치 부스터',
      description: '경험치 획득량 25% 증가 (24시간)',
      price: 200,
      type: 'functional',
      imageUrl: '/images/items/exp_boost.png',
      available: true,
      purchasedAt: user.purchasedItems?.includes('experience_boost') ? new Date() : undefined
    },
    {
      id: 'rainbow_trainer_card',
      name: '무지개 트레이너 카드',
      description: '특별한 트레이너 카드 배경',
      price: 1000,
      type: 'cosmetic',
      imageUrl: '/images/items/rainbow_card.png',
      available: user.completedTables.length >= 8,
      purchasedAt: user.purchasedItems?.includes('rainbow_trainer_card') ? new Date() : undefined
    },
    {
      id: 'shiny_hunter',
      name: '색이 다른 포켓몬 헌터',
      description: '희귀 포켓몬 출현 확률 5% 증가',
      price: 750,
      type: 'functional',
      imageUrl: '/images/items/shiny_hunter.png',
      available: user.trainerLevel >= 10 && user.currentStreak >= 14,
      purchasedAt: user.purchasedItems?.includes('shiny_hunter') ? new Date() : undefined
    },
    {
      id: 'legendary_collector',
      name: '전설의 수집가',
      description: '전설 포켓몬 수집 기념 배지',
      price: 2000,
      type: 'cosmetic',
      imageUrl: '/images/items/legendary_collector.png',
      available: user.trainerLevel >= 20,
      purchasedAt: user.purchasedItems?.includes('legendary_collector') ? new Date() : undefined
    },
    {
      id: 'streak_protector',
      name: '연속 학습 보호막',
      description: '하루 놓쳐도 연속 기록이 끊어지지 않음 (1회용)',
      price: 300,
      type: 'functional',
      imageUrl: '/images/items/streak_protector.png',
      available: user.currentStreak >= 7,
      purchasedAt: user.purchasedItems?.includes('streak_protector') ? new Date() : undefined
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setShopItems(mockShopItems);
        setLoading(false);
      }, 500);
    }
  }, [isOpen, user]);

  const handlePurchase = async (item: ShopItem) => {
    if (!item.available || item.purchasedAt || user.starDust < item.price) {
      return;
    }

    setPurchasing(item.id);
    try {
      const result = await onPurchase(item.id);
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      
      if (result.success) {
        // Update local state to reflect purchase
        setShopItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, purchasedAt: new Date() } : i
        ));
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '구매 처리 중 오류가 발생했습니다.' 
      });
    } finally {
      setPurchasing(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getItemTypeIcon = (type: ShopItem['type']) => {
    switch (type) {
      case 'functional': return '⚡';
      case 'cosmetic': return '🎨';
      case 'collection': return '🏆';
      default: return '🎁';
    }
  };

  const getItemTypeColor = (type: ShopItem['type']) => {
    switch (type) {
      case 'functional': return 'from-blue-500 to-blue-600';
      case 'cosmetic': return 'from-purple-500 to-purple-600';
      case 'collection': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const canAfford = (price: number) => user.starDust >= price;

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
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🏪</div>
                <div>
                  <h2 className="text-2xl font-bold">포켓몬 상점</h2>
                  <p className="text-purple-200">별의모래로 특별한 아이템을 구매하세요!</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <div className="text-sm text-purple-200">보유 별의모래</div>
                  <div className="text-xl font-bold">✨ {user.starDust.toLocaleString()}</div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-purple-200 text-2xl p-2"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <motion.div
              className={`p-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <p className="text-center font-medium">{message.text}</p>
            </motion.div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">상점 정보를 불러오는 중...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PokemonCard className="h-full">
                      {/* Item Type Badge */}
                      <div className={`absolute top-2 right-2 bg-gradient-to-r ${getItemTypeColor(item.type)} text-white text-xs px-2 py-1 rounded-full`}>
                        {getItemTypeIcon(item.type)} {item.type}
                      </div>

                      {/* Item Image Placeholder */}
                      <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-4xl">
                        {getItemTypeIcon(item.type)}
                      </div>

                      {/* Item Info */}
                      <div className="mb-4">
                        <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-purple-600 font-bold text-lg">✨ {item.price}</span>
                          </div>
                          {!canAfford(item.price) && !item.purchasedAt && (
                            <span className="text-red-500 text-xs">별의모래 부족</span>
                          )}
                        </div>
                      </div>

                      {/* Purchase Button */}
                      <div className="mt-auto">
                        {item.purchasedAt ? (
                          <PokemonButton
                            variant="success"
                            size="sm"
                            className="w-full"
                            disabled
                          >
                            ✓ 구매완료
                          </PokemonButton>
                        ) : !item.available ? (
                          <div>
                            <PokemonButton
                              variant="outline"
                              size="sm"
                              className="w-full"
                              disabled
                            >
                              🔒 조건 미달성
                            </PokemonButton>
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              {user.trainerLevel < 5 && item.id === 'golden_pokeball' && '레벨 5 필요'}
                              {user.trainerLevel < 10 && item.id === 'shiny_hunter' && '레벨 10 필요'}
                              {user.trainerLevel < 20 && item.id === 'legendary_collector' && '레벨 20 필요'}
                              {user.completedTables.length < 8 && item.id === 'rainbow_trainer_card' && '모든 구구단 완료 필요'}
                              {user.currentStreak < 7 && item.id === 'streak_protector' && '7일 연속 학습 필요'}
                              {user.currentStreak < 14 && item.id === 'shiny_hunter' && '14일 연속 학습 필요'}
                            </div>
                          </div>
                        ) : (
                          <PokemonButton
                            variant={canAfford(item.price) ? "primary" : "outline"}
                            size="sm"
                            className="w-full"
                            disabled={!canAfford(item.price) || purchasing === item.id}
                            onClick={() => handlePurchase(item)}
                          >
                            {purchasing === item.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                구매 중...
                              </>
                            ) : canAfford(item.price) ? (
                              '구매하기 💳'
                            ) : (
                              '별의모래 부족'
                            )}
                          </PokemonButton>
                        )}
                      </div>
                    </PokemonCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 text-center">
            <p className="text-gray-600 text-sm">
              💡 정답을 맞혀서 별의모래를 모으고, 연속 학습으로 더 많은 보너스를 받아보세요!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeShop;