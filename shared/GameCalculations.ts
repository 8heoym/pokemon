import { EXPERIENCE_CONFIG, GAME_CONFIG } from './gameConstants';

/**
 * 🎯 GameCalculations 클래스 - 게임 계산 로직 통합
 * 
 * 기존에 3개 파일에 중복 구현된 계산 로직을 하나로 통합:
 * - backend/src/services/GameService.ts
 * - backend/src/services/SupabaseGameService.ts  
 * - frontend/utils/gameUtils.ts
 * - backend/src/services/HybridProblemService.ts
 */

export interface PokemonRarity {
  common: 'common';
  uncommon: 'uncommon';
  rare: 'rare';
  legendary: 'legendary';
}

export interface DifficultyLevel {
  easy: 1;
  medium: 2;
  hard: 3;
}

export class GameCalculations {
  // 🎯 상수는 gameConstants.ts에서 중앙 관리

  /**
   * 🧮 레벨 계산 - 총 경험치에서 트레이너 레벨 계산
   * 공식: √(총경험치 / 100) + 1
   */
  static calculateLevel(totalExperience: number): number {
    if (totalExperience < 0) return 1;
    return Math.floor(Math.sqrt(totalExperience / EXPERIENCE_CONFIG.BASE)) + 1;
  }

  /**
   * 🎁 희귀도별 경험치 획득량 계산
   */
  static calculateExperienceGain(rarity: string): number {
    return EXPERIENCE_CONFIG.RARITY_MAP[rarity.toLowerCase() as keyof typeof EXPERIENCE_CONFIG.RARITY_MAP] || EXPERIENCE_CONFIG.RARITY_MAP.common;
  }

  /**
   * ⏱️ 문제 해결 경험치 계산 (난이도 + 시간 보너스)
   */
  static calculateProblemExperience(difficulty: 1 | 2 | 3, timeSpent: number): number {
    const baseExp = EXPERIENCE_CONFIG.DIFFICULTY_BASE[difficulty] || EXPERIENCE_CONFIG.DIFFICULTY_BASE[1];
    const timeBonus = Math.max(0, EXPERIENCE_CONFIG.TIME_BONUS.MAX_BONUS - timeSpent);
    return baseExp + timeBonus;
  }

  /**
   * 📈 다음 레벨까지 필요한 경험치 계산
   */
  static getExpToNextLevel(currentExp: number): number {
    const currentLevel = this.calculateLevel(currentExp);
    const nextLevelExp = Math.pow(currentLevel, 2) * EXPERIENCE_CONFIG.BASE;
    return Math.max(0, nextLevelExp - currentExp);
  }

  /**
   * 📊 현재 레벨에서의 진행도 계산 (0-100%)
   */
  static getLevelProgress(currentExp: number): number {
    const currentLevel = this.calculateLevel(currentExp);
    const currentLevelExp = Math.pow(currentLevel - 1, 2) * EXPERIENCE_CONFIG.BASE;
    const nextLevelExp = Math.pow(currentLevel, 2) * EXPERIENCE_CONFIG.BASE;
    
    if (nextLevelExp === currentLevelExp) return 100;
    
    const progress = ((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  /**
   * 🎯 포켓몬 포획 확률 계산 (희귀도 + 사용자 레벨)
   */
  static calculateCatchProbability(rarity: string, userLevel: number): number {
    const baseRates: Record<string, number> = {
      common: 0.8,     // 80% 기본 확률
      uncommon: 0.6,   // 60% 기본 확률
      rare: 0.4,       // 40% 기본 확률
      legendary: 0.2   // 20% 기본 확률
    };

    const baseRate = baseRates[rarity.toLowerCase()] || baseRates.common;
    const levelBonus = Math.min(userLevel * 0.01, 0.3); // 레벨당 1%, 최대 30% 보너스
    
    return Math.min(baseRate + levelBonus, 0.95); // 최대 95% 제한
  }

  /**
   * 🏆 리더보드 점수 계산 (경험치 + 포켓몬 수 + 완료 단수)
   */
  static calculateLeaderboardScore(
    totalExperience: number, 
    caughtPokemonCount: number, 
    completedTables: number[]
  ): number {
    const expScore = totalExperience * 1.0;
    const pokemonScore = caughtPokemonCount * 10;
    const tableScore = completedTables.length * 100;
    
    return Math.floor(expScore + pokemonScore + tableScore);
  }

  /**
   * 🎮 구구단 난이도 결정 (사용자 레벨 기반)
   */
  static recommendDifficulty(userLevel: number, tableNumber: number): 1 | 2 | 3 {
    // 기본 난이도
    if (userLevel <= 5) return 1;
    if (userLevel <= 15) return 2;
    
    // 어려운 구구단 (6, 7, 8, 9단)은 추가 고려
    const hardTables = [6, 7, 8, 9];
    if (hardTables.includes(tableNumber)) {
      if (userLevel <= 10) return 1;
      if (userLevel <= 20) return 2;
    }
    
    return 3;
  }

  /**
   * 💎 포켓몬 희귀도 가중치 계산 (지역별 보정)
   */
  static calculateRarityWeight(rarity: string, region: string): number {
    const baseWeights: Record<string, number> = {
      common: 1.0,
      uncommon: 0.6,
      rare: 0.3,
      legendary: 0.1
    };

    // 지역별 희귀도 보정 (후기 지역일수록 희귀 포켓몬 확률 증가)
    const regionMultipliers: Record<string, number> = {
      '관동지방': 1.0,
      '성도지방': 1.1,
      '호연지방': 1.2,
      '신오지방': 1.3,
      '하나지방': 1.4,
      '칼로스지방': 1.5,
      '알로라지방': 1.6,
      '가라르지방': 1.7,
      '팔데아지방': 1.8
    };

    const baseWeight = baseWeights[rarity.toLowerCase()] || baseWeights.common;
    const regionMultiplier = regionMultipliers[region] || 1.0;
    
    return baseWeight * regionMultiplier;
  }

  /**
   * 📚 구구단 마스터리 계산 (정답률 + 속도)
   */
  static calculateTableMastery(
    correctAnswers: number, 
    totalAnswers: number, 
    averageTime: number
  ): number {
    if (totalAnswers === 0) return 0;
    
    const accuracy = correctAnswers / totalAnswers;
    const speedBonus = Math.max(0, (60 - averageTime) / 60); // 60초 기준 속도 보너스
    
    return Math.min((accuracy * 0.7 + speedBonus * 0.3) * 100, 100);
  }

  /**
   * 🎖️ 업적 체크 (특정 조건 달성 확인)
   */
  static checkAchievements(userStats: {
    totalExperience: number;
    caughtPokemon: number[];
    completedTables: number[];
    correctAnswers: number;
  }): string[] {
    const achievements: string[] = [];
    
    // 레벨 기반 업적
    const level = this.calculateLevel(userStats.totalExperience);
    if (level >= 10) achievements.push('트레이너 레벨 10 달성');
    if (level >= 25) achievements.push('포켓몬 마스터');
    if (level >= 50) achievements.push('전설의 트레이너');
    
    // 포켓몬 수집 업적
    if (userStats.caughtPokemon.length >= 50) achievements.push('포켓몬 수집가');
    if (userStats.caughtPokemon.length >= 150) achievements.push('포켓몬 박사');
    
    // 구구단 마스터 업적
    if (userStats.completedTables.length >= 4) achievements.push('구구단 마스터 브론즈');
    if (userStats.completedTables.length >= 8) achievements.push('구구단 마스터 골드');
    
    // 정답 수 업적
    if (userStats.correctAnswers >= 100) achievements.push('수학 천재');
    if (userStats.correctAnswers >= 500) achievements.push('계산 마스터');
    
    return achievements;
  }

  /**
   * 🔍 통계 계산 유틸리티
   */
  static calculateStats(answers: Array<{
    isCorrect: boolean;
    timeSpent: number;
    multiplicationTable: number;
  }>) {
    if (answers.length === 0) {
      return {
        totalAnswers: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        tableStats: {}
      };
    }

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    
    // 구구단별 통계
    const tableStats: Record<number, {
      total: number;
      correct: number;
      accuracy: number;
      averageTime: number;
    }> = {};

    for (let table = 2; table <= 9; table++) {
      const tableAnswers = answers.filter(a => a.multiplicationTable === table);
      const tableCorrect = tableAnswers.filter(a => a.isCorrect).length;
      const tableTime = tableAnswers.reduce((sum, a) => sum + a.timeSpent, 0);

      tableStats[table] = {
        total: tableAnswers.length,
        correct: tableCorrect,
        accuracy: tableAnswers.length > 0 ? (tableCorrect / tableAnswers.length) * 100 : 0,
        averageTime: tableAnswers.length > 0 ? tableTime / tableAnswers.length : 0
      };
    }

    return {
      totalAnswers: answers.length,
      correctAnswers,
      accuracy: (correctAnswers / answers.length) * 100,
      averageTime: totalTime / answers.length,
      tableStats
    };
  }
}