// Phase 2: Motivation System Constants
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  streakRewards: StreakReward[];
}

export interface StreakReward {
  streakDay: number;
  reward: {
    type: 'stardust' | 'experience' | 'pokemon' | 'badge';
    amount?: number;
    pokemonId?: number;
    badgeId?: string;
  };
  claimed: boolean;
}

export interface StarDustTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent';
  source: 'problem_correct' | 'streak_bonus' | 'daily_bonus' | 'shop_purchase';
  timestamp: Date;
  description: string;
}

export interface BadgeShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'cosmetic' | 'functional' | 'collection';
  imageUrl: string;
  available: boolean;
  requirements?: {
    level?: number;
    completedTables?: number[];
    streakRequired?: number;
  };
}

// Streak System Configuration
export const STREAK_REWARDS: StreakReward[] = [
  { streakDay: 3, reward: { type: 'stardust', amount: 50 }, claimed: false },
  { streakDay: 7, reward: { type: 'stardust', amount: 100 }, claimed: false },
  { streakDay: 14, reward: { type: 'experience', amount: 200 }, claimed: false },
  { streakDay: 30, reward: { type: 'pokemon', pokemonId: 150 }, claimed: false }, // Mew
  { streakDay: 50, reward: { type: 'badge', badgeId: 'streak_master' }, claimed: false },
  { streakDay: 100, reward: { type: 'pokemon', pokemonId: 151 }, claimed: false } // Celebi
];

// Star Dust Earning Configuration
export const STARDUST_REWARDS = {
  CORRECT_ANSWER_BASIC: 10,
  CORRECT_ANSWER_FIRST_TRY: 15,
  PERFECT_STAGE: 25,
  DAILY_BONUS: 30,
  STREAK_MULTIPLIER: {
    3: 1.2,  // 20% bonus
    7: 1.5,  // 50% bonus
    14: 2.0, // 100% bonus
    30: 2.5  // 150% bonus
  }
};

// Badge Shop Items
export const BADGE_SHOP_ITEMS: BadgeShopItem[] = [
  {
    id: 'golden_pokeball',
    name: '황금 포켓볼',
    description: '포켓몬 포획 확률 10% 증가',
    price: 500,
    type: 'functional',
    imageUrl: '/images/badges/golden_pokeball.png',
    available: true,
    requirements: { level: 5 }
  },
  {
    id: 'experience_boost',
    name: '경험치 부스터',
    description: '경험치 획득량 25% 증가 (24시간)',
    price: 200,
    type: 'functional',
    imageUrl: '/images/badges/exp_boost.png',
    available: true
  },
  {
    id: 'rainbow_trainer_card',
    name: '무지개 트레이너 카드',
    description: '특별한 트레이너 카드 배경',
    price: 1000,
    type: 'cosmetic',
    imageUrl: '/images/badges/rainbow_card.png',
    available: true,
    requirements: { completedTables: [2, 3, 4, 5, 6, 7, 8, 9] }
  },
  {
    id: 'shiny_hunter',
    name: '색이 다른 포켓몬 헌터',
    description: '희귀 포켓몬 출현 확률 5% 증가',
    price: 750,
    type: 'functional',
    imageUrl: '/images/badges/shiny_hunter.png',
    available: true,
    requirements: { level: 10, streakRequired: 14 }
  },
  {
    id: 'legendary_collector',
    name: '전설의 수집가',
    description: '전설 포켓몬 수집 기념 배지',
    price: 2000,
    type: 'collection',
    imageUrl: '/images/badges/legendary_collector.png',
    available: true,
    requirements: { level: 20 }
  }
];

// Badge System
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'achievement' | 'progress' | 'special' | 'streak';
  requirements: {
    type: 'completion' | 'streak' | 'accuracy' | 'collection' | 'time';
    value: number;
    description: string;
  };
  earnedAt?: Date;
  progress?: number;
}

export const ACHIEVEMENT_BADGES: Badge[] = [
  {
    id: 'first_steps',
    name: '첫 걸음',
    description: '첫 번째 문제를 풀었습니다',
    imageUrl: '/images/badges/first_steps.png',
    category: 'achievement',
    requirements: {
      type: 'completion',
      value: 1,
      description: '문제 1개 풀기'
    }
  },
  {
    id: 'table_master_2',
    name: '2단 마스터',
    description: '2단 구구단을 완벽하게 마스터했습니다',
    imageUrl: '/images/badges/table_2.png',
    category: 'progress',
    requirements: {
      type: 'completion',
      value: 1,
      description: '2단 구구단 완료'
    }
  },
  {
    id: 'accuracy_master',
    name: '정확도의 달인',
    description: '100문제 연속 정답을 달성했습니다',
    imageUrl: '/images/badges/accuracy.png',
    category: 'achievement',
    requirements: {
      type: 'accuracy',
      value: 100,
      description: '100문제 연속 정답'
    }
  },
  {
    id: 'speed_demon',
    name: '번개같은 속도',
    description: '평균 5초 이내로 50문제를 풀었습니다',
    imageUrl: '/images/badges/speed.png',
    category: 'achievement',
    requirements: {
      type: 'time',
      value: 5,
      description: '평균 5초 이내로 50문제 풀기'
    }
  },
  {
    id: 'pokemon_collector',
    name: '포켓몬 컬렉터',
    description: '100마리의 포켓몬을 수집했습니다',
    imageUrl: '/images/badges/collector.png',
    category: 'achievement',
    requirements: {
      type: 'collection',
      value: 100,
      description: '포켓몬 100마리 수집'
    }
  },
  {
    id: 'dedication_streak',
    name: '끈기의 상징',
    description: '30일 연속 학습을 달성했습니다',
    imageUrl: '/images/badges/dedication.png',
    category: 'streak',
    requirements: {
      type: 'streak',
      value: 30,
      description: '30일 연속 학습'
    }
  }
];

// Daily Bonus System
export const DAILY_BONUS = {
  STARDUST_AMOUNT: 50,
  EXPERIENCE_AMOUNT: 100,
  CONSECUTIVE_MULTIPLIER: {
    3: 1.5,  // 3일 연속: 50% 보너스
    7: 2.0,  // 7일 연속: 100% 보너스
    14: 3.0  // 14일 연속: 200% 보너스
  }
};