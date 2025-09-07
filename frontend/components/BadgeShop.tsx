import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShopItem } from '@/types';
import { getAdjustedPrice } from '@/utils/economyBalancing';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // PRD [F-2.2]: 카테고리 정의
  const categories = [
    { id: 'all', name: '전체', emoji: '🛍️' },
    { id: 'pokemon_accessory', name: '포켓몬 액세서리', emoji: '👑' },
    { id: 'streak_protection', name: '연속 학습 보호', emoji: '🛡️' },
    { id: 'xp_booster', name: 'XP 부스터', emoji: '⚡' },
    { id: 'special_collection', name: '특별 컬렉션', emoji: '💎' },
    { id: 'functional', name: '기능성 아이템', emoji: '🔧' },
    { id: 'cosmetic', name: '장식용 아이템', emoji: '✨' }
  ];

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

    // PRD [F-2.2]: 포켓몬 액세서리 확장
    {
      id: 'pikachu_thunder_headband',
      name: '피카츄의 번개 머리띠',
      description: '2단 문제 정답 시 추가 별의모래 +5',
      price: 300,
      type: 'pokemon_accessory',
      imageUrl: '/images/items/pikachu_headband.png',
      available: user.completedTables.includes(2),
      purchasedAt: user.purchasedItems?.includes('pikachu_thunder_headband') ? new Date() : undefined
    },
    {
      id: 'eevee_ribbon',
      name: '이브이의 리본',
      description: '파트너 포켓몬 감정 표현이 더 생생해집니다',
      price: 400,
      type: 'pokemon_accessory',
      imageUrl: '/images/items/eevee_ribbon.png',
      available: user.currentStreak >= 3,
      purchasedAt: user.purchasedItems?.includes('eevee_ribbon') ? new Date() : undefined
    },
    {
      id: 'squirtle_cool_sunglasses',
      name: '꼬부기의 멋진 선글라스',
      description: '3단 문제 풀이 시 힌트 사용 횟수 +1',
      price: 250,
      type: 'pokemon_accessory',
      imageUrl: '/images/items/squirtle_sunglasses.png',
      available: user.completedTables.includes(3),
      purchasedAt: user.purchasedItems?.includes('squirtle_cool_sunglasses') ? new Date() : undefined
    },
    {
      id: 'bulbasaur_flower_crown',
      name: '이상해씨의 꽃 왕관',
      description: '4단 지역에서 포켓몬 포획 확률 15% 증가',
      price: 350,
      type: 'pokemon_accessory',
      imageUrl: '/images/items/bulbasaur_crown.png',
      available: user.completedTables.includes(4),
      purchasedAt: user.purchasedItems?.includes('bulbasaur_flower_crown') ? new Date() : undefined
    },
    {
      id: 'charmander_fire_cape',
      name: '파이리의 불꽃 망토',
      description: '연속 정답 시 경험치 보너스 10% 추가',
      price: 450,
      type: 'pokemon_accessory',
      imageUrl: '/images/items/charmander_cape.png',
      available: user.completedTables.includes(5),
      purchasedAt: user.purchasedItems?.includes('charmander_fire_cape') ? new Date() : undefined
    },

    // PRD [F-2.2]: 연속 학습 보호 아이템 - Phase 2.3 가격 조정
    {
      id: 'articuno_freeze_shield',
      name: '프리저의 얼음 방패',
      description: '연속 학습 기록 1일 보호 (1회용)',
      price: getAdjustedPrice('articuno_freeze_shield', 600),
      type: 'streak_protection',
      imageUrl: '/images/items/freeze_shield.png',
      available: user.currentStreak >= 7,
      purchasedAt: user.purchasedItems?.includes('articuno_freeze_shield') ? new Date() : undefined
    },
    {
      id: 'zapdos_thunder_barrier',
      name: '썬더의 번개 장벽',
      description: '연속 학습 기록 3일 보호 (1회용)',
      price: getAdjustedPrice('zapdos_thunder_barrier', 1500),
      type: 'streak_protection',
      imageUrl: '/images/items/thunder_barrier.png',
      available: user.currentStreak >= 14,
      purchasedAt: user.purchasedItems?.includes('zapdos_thunder_barrier') ? new Date() : undefined
    },

    // PRD [F-2.2]: XP 부스터 확장
    {
      id: 'lucky_egg',
      name: '럭키의 경험의 알',
      description: '2시간 동안 경험치 2배 획득',
      price: 800,
      type: 'xp_booster',
      imageUrl: '/images/items/lucky_egg.png',
      available: user.trainerLevel >= 8,
      purchasedAt: user.purchasedItems?.includes('lucky_egg') ? new Date() : undefined
    },
    {
      id: 'rare_candy',
      name: '이상한 사탕',
      description: '즉시 레벨업 (레벨당 1회 제한)',
      price: getAdjustedPrice('rare_candy', 2500),
      type: 'xp_booster', 
      imageUrl: '/images/items/rare_candy.png',
      available: user.trainerLevel >= 15 && user.completedTables.length >= 5,
      purchasedAt: user.purchasedItems?.includes('rare_candy') ? new Date() : undefined
    },

    // 특별 컬렉션 아이템
    {
      id: 'master_trainer_badge',
      name: '마스터 트레이너 배지',
      description: '모든 구구단 완료 시 특별 배지',
      price: getAdjustedPrice('master_trainer_badge', 5000),
      type: 'special_collection',
      imageUrl: '/images/items/master_badge.png',
      available: user.completedTables.length >= 8,
      purchasedAt: user.purchasedItems?.includes('master_trainer_badge') ? new Date() : undefined
    },
    {
      id: 'pokemon_professor_lab_coat',
      name: '포켓몬 박사 실험복',
      description: '모든 포켓몬과의 친밀도 상승 효과',
      price: 3000,
      type: 'special_collection',
      imageUrl: '/images/items/lab_coat.png',
      available: user.trainerLevel >= 25,
      purchasedAt: user.purchasedItems?.includes('pokemon_professor_lab_coat') ? new Date() : undefined
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

  // 필터된 아이템 목록
  const filteredItems = shopItems.filter(item => 
    selectedCategory === 'all' || item.type === selectedCategory
  );

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
      case 'pokemon_accessory': return '👑';
      case 'streak_protection': return '🛡️';
      case 'xp_booster': return '⚡';
      case 'special_collection': return '💎';
      default: return '🎁';
    }
  };

  const getItemTypeColor = (type: ShopItem['type']) => {
    switch (type) {
      case 'functional': return 'from-blue-500 to-blue-600';
      case 'cosmetic': return 'from-purple-500 to-purple-600';
      case 'collection': return 'from-yellow-500 to-yellow-600';
      case 'pokemon_accessory': return 'from-pink-500 to-pink-600';
      case 'streak_protection': return 'from-green-500 to-green-600';
      case 'xp_booster': return 'from-orange-500 to-orange-600';
      case 'special_collection': return 'from-indigo-500 to-indigo-600';
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

          {/* PRD [F-2.2]: 카테고리 탭 */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
                    ${selectedCategory === category.id 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs bg-black bg-opacity-20 px-2 py-1 rounded-full">
                    {category.id === 'all' ? shopItems.length : shopItems.filter(item => item.type === category.id).length}
                  </span>
                </button>
              ))}
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
                {filteredItems.map((item) => (
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