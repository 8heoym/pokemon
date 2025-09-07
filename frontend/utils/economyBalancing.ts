// PRD [F-2.2]: 게임 경제 밸런싱 시스템

interface EconomyConfig {
  starDustRewards: {
    base: number;
    noHints: number;
    streakBonus: {
      threshold: number;
      multiplier: number;
    }[];
    difficultyMultiplier: {
      easy: number;
      normal: number;
      hard: number;
    };
    regionBonus: {
      [key: number]: number; // 구구단 번호별 보너스
    };
  };
  dailyBonuses: {
    streakDays: number;
    baseReward: number;
    streakMultiplier: number;
  }[];
  priceAdjustments: {
    [itemId: string]: {
      originalPrice: number;
      adjustedPrice: number;
      reasoning: string;
    };
  };
}

export const ECONOMY_CONFIG: EconomyConfig = {
  // 별의모래 획득 시스템 최적화
  starDustRewards: {
    base: 10, // 기본 보상
    noHints: 15, // 힌트 없이 정답 시
    streakBonus: [
      { threshold: 3, multiplier: 1.1 }, // 3일 연속: 10% 추가
      { threshold: 7, multiplier: 1.2 }, // 7일 연속: 20% 추가
      { threshold: 14, multiplier: 1.3 }, // 14일 연속: 30% 추가
      { threshold: 30, multiplier: 1.5 } // 30일 연속: 50% 추가
    ],
    difficultyMultiplier: {
      easy: 1.0,
      normal: 1.2, // 20% 추가
      hard: 1.5 // 50% 추가
    },
    regionBonus: {
      2: 0, // 2단: 보너스 없음 (시작 지역)
      3: 2, // 3단: +2
      4: 3, // 4단: +3
      5: 4, // 5단: +4
      6: 5, // 6단: +5
      7: 6, // 7단: +6
      8: 8, // 8단: +8
      9: 10 // 9단: +10 (최고 난이도)
    }
  },

  // 일일 보너스 최적화
  dailyBonuses: [
    { streakDays: 1, baseReward: 20, streakMultiplier: 1.0 },
    { streakDays: 3, baseReward: 25, streakMultiplier: 1.5 },
    { streakDays: 7, baseReward: 35, streakMultiplier: 2.0 },
    { streakDays: 14, baseReward: 50, streakMultiplier: 2.5 },
    { streakDays: 30, baseReward: 75, streakMultiplier: 3.0 }
  ],

  // 아이템 가격 재조정
  priceAdjustments: {
    // 연속 학습 보호 아이템 - 접근성 개선
    'articuno_freeze_shield': {
      originalPrice: 600,
      adjustedPrice: 300, // 50% 할인
      reasoning: '연속 학습 동기부여를 위해 접근성 개선'
    },
    'zapdos_thunder_barrier': {
      originalPrice: 1500,
      adjustedPrice: 800, // 47% 할인
      reasoning: '장기 사용자를 위한 합리적 가격 조정'
    },

    // 특별 컬렉션 아이템 - 프리미엄 가격 조정
    'master_trainer_badge': {
      originalPrice: 5000,
      adjustedPrice: 3000, // 40% 할인
      reasoning: '최고 목표 달성 보상의 현실적 가격'
    },
    'pokemon_professor_lab_coat': {
      originalPrice: 3000,
      adjustedPrice: 2000, // 33% 할인
      reasoning: '고레벨 사용자 보상 접근성 개선'
    },

    // XP 부스터 - 사용빈도 고려 조정
    'rare_candy': {
      originalPrice: 2500,
      adjustedPrice: 1500, // 40% 할인
      reasoning: '레벨업 보상의 합리적 가격'
    }
  }
};

// 별의모래 계산 함수
export const calculateStarDustReward = (
  baseAmount: number,
  hintsUsed: number,
  userStreak: number,
  difficulty: 'easy' | 'normal' | 'hard',
  regionNumber: number
): number => {
  const config = ECONOMY_CONFIG.starDustRewards;
  
  // 기본 보상 (힌트 사용 여부에 따라)
  let reward = hintsUsed === 0 ? config.noHints : config.base;
  
  // 난이도 보너스
  reward *= config.difficultyMultiplier[difficulty];
  
  // 지역 보너스 (높은 구구단일수록 보너스)
  reward += config.regionBonus[regionNumber] || 0;
  
  // 스트릭 보너스
  const streakBonus = config.streakBonus
    .filter(bonus => userStreak >= bonus.threshold)
    .pop(); // 가장 높은 보너스 적용
    
  if (streakBonus) {
    reward *= streakBonus.multiplier;
  }
  
  return Math.floor(reward);
};

// 일일 보너스 계산 함수
export const calculateDailyBonus = (streakDays: number): number => {
  const config = ECONOMY_CONFIG.dailyBonuses;
  
  const bonus = config
    .filter(b => streakDays >= b.streakDays)
    .pop(); // 가장 높은 보너스 적용
    
  if (!bonus) return config[0].baseReward;
  
  return Math.floor(bonus.baseReward * bonus.streakMultiplier);
};

// 아이템 가격 조회 함수
export const getAdjustedPrice = (itemId: string, originalPrice: number): number => {
  const adjustment = ECONOMY_CONFIG.priceAdjustments[itemId];
  return adjustment ? adjustment.adjustedPrice : originalPrice;
};

// 경제 시스템 분석 함수
export const analyzeEconomy = (user: { 
  currentStreak: number; 
  starDust: number; 
  completedTables: number[]; 
}) => {
  const avgProblemsPerSession = 10;
  const avgStarDustPerProblem = calculateStarDustReward(10, 0, user.currentStreak, 'normal', 5);
  const dailyPotential = avgProblemsPerSession * avgStarDustPerProblem;
  
  return {
    avgRewardPerProblem: avgStarDustPerProblem,
    dailyPotential,
    daysForMostExpensiveItem: Math.ceil(3000 / dailyPotential), // 조정된 최고가 아이템
    currentBalance: user.starDust,
    streakBonus: user.currentStreak >= 3 ? '활성' : '비활성',
    economyHealth: dailyPotential > 100 ? '건강함' : '개선 필요'
  };
};