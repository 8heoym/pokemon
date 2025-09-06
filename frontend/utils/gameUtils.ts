import { Pokemon, RegionData } from '@/types';
import { GameCalculations } from './GameCalculations';
import { GAME_CONFIG, REGION_CONFIG, UI_CONFIG } from './gameConstants';

// 구구단별 지역 매핑 (gameConstants.ts에서 중앙 관리)
export const REGION_TABLE_MAP = REGION_CONFIG.UNLOCK_REQUIREMENTS;

// 지역 배경색 매핑
export const REGION_COLORS: { [key: string]: string } = {
  '관동지방': 'from-green-400 to-blue-500',
  '성도지방': 'from-yellow-400 to-red-500',
  '호연지방': 'from-blue-400 to-green-500',
  '신오지방': 'from-purple-400 to-pink-500',
  '하나지방': 'from-gray-400 to-blue-400',
  '칼로스지방': 'from-pink-400 to-purple-500',
  '알로라지방': 'from-orange-400 to-yellow-500',
  '가라르지방': 'from-indigo-400 to-purple-500',
  '팔데아지방': 'from-red-400 to-orange-500'
};

// 구구단 학습 순서 (gameConstants.ts에서 중앙 관리)
export const MULTIPLICATION_ORDER = GAME_CONFIG.MULTIPLICATION_ORDER;

// 희귀도별 색상
export const RARITY_COLORS = {
  common: 'text-gray-600 border-gray-300',
  uncommon: 'text-green-600 border-green-300',
  rare: 'text-blue-600 border-blue-300',
  legendary: 'text-yellow-600 border-yellow-300'
};

// 희귀도별 배경색
export const RARITY_BG_COLORS = {
  common: 'from-gray-100 to-gray-200',
  uncommon: 'from-green-100 to-green-200', 
  rare: 'from-blue-100 to-blue-200',
  legendary: 'from-yellow-100 to-yellow-200'
};


// 레벨 계산 함수 (GameCalculations 위임)
export const calculateLevel = (experience: number): number => {
  return GameCalculations.calculateLevel(experience);
};

// 다음 레벨까지 필요한 경험치 계산 (GameCalculations 위임)
export const getExpToNextLevel = (currentExp: number): number => {
  return GameCalculations.getExpToNextLevel(currentExp);
};

// 레벨 진행률 계산 (GameCalculations 위임)
export const getLevelProgress = (currentExp: number): number => {
  return GameCalculations.getLevelProgress(currentExp);
};

// 포켓몬 포획 확률 계산
export const calculateCatchRate = (userAnswer: number, correctAnswer: number): number => {
  if (userAnswer === correctAnswer) return 0.7; // 정답시 70%
  return 0; // 오답시 0%
};

// 경험치 획득량 계산
export const calculateExpGain = (rarity: string, isCorrect: boolean): number => {
  const baseExp = isCorrect ? 20 : 5;
  const rarityMultiplier: { [key: string]: number } = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    legendary: 3
  };
  return Math.floor(baseExp * (rarityMultiplier[rarity] || 1));
};

// 문제 난이도별 점수 계산
export const calculateScore = (
  difficulty: number,
  timeSpent: number,
  hintsUsed: number,
  isCorrect: boolean
): number => {
  if (!isCorrect) return 0;
  
  const baseScore = difficulty * 100;
  const timeBonus = Math.max(0, 50 - timeSpent); // 빠를수록 보너스
  const hintPenalty = hintsUsed * 10; // 힌트 사용시 감점
  
  return Math.max(10, baseScore + timeBonus - hintPenalty);
};

// 지역 데이터 생성 함수
export const createRegionData = (
  regionName: string,
  completedTables: number[],
  currentRegion: string
): RegionData => {
  const regionTables = [...(REGION_TABLE_MAP[regionName as keyof typeof REGION_TABLE_MAP] || [])];
  const completedInRegion = regionTables.filter(table => completedTables.includes(table));
  const completionRate = regionTables.length > 0 ? 
    (completedInRegion.length / regionTables.length) * 100 : 0;

  // 이전 지역들이 모두 완료되었는지 확인하여 해금 여부 결정
  const regionOrder = Object.keys(REGION_TABLE_MAP);
  const currentRegionIndex = regionOrder.indexOf(currentRegion);
  const thisRegionIndex = regionOrder.indexOf(regionName);
  const isUnlocked = thisRegionIndex <= currentRegionIndex;

  return {
    name: regionName,
    tables: regionTables,
    backgroundColor: REGION_COLORS[regionName] || 'from-gray-400 to-gray-600',
    isUnlocked,
    completionRate
  };
};


// 숫자 포맷팅 (천 단위 콤마)
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

// 성취 뱃지 계산
export const calculateAchievements = (
  level: number,
  caughtPokemon: number,
  completedTables: number[],
  regionCompletionRate: number
): string[] => {
  const achievements = [];

  // 레벨 관련
  if (level >= 5) achievements.push('🎓 신입 트레이너');
  if (level >= 10) achievements.push('⭐ 베테랑 트레이너');
  if (level >= 20) achievements.push('👑 마스터 트레이너');

  // 포켓몬 수집 관련
  if (caughtPokemon >= 10) achievements.push('📱 포켓몬 수집가');
  if (caughtPokemon >= 50) achievements.push('🔥 포켓몬 헌터');
  if (caughtPokemon >= 100) achievements.push('⚡ 포켓몬 마스터');

  // 구구단 관련
  if (completedTables.length >= 1) achievements.push('🧮 곱셈 입문');
  if (completedTables.length >= 3) achievements.push('📚 곱셈 학습자');
  if (completedTables.length >= 5) achievements.push('🎯 곱셈 전문가');
  if (completedTables.length >= 8) achievements.push('🏆 구구단 마스터');

  // 지역 관련
  if (regionCompletionRate >= 50) achievements.push('🗺️ 지역 탐험가');
  if (regionCompletionRate >= 100) achievements.push('🌟 지역 정복자');

  return achievements;
};

// 답안 검증 함수
export const validateAnswer = (userAnswer: any, correctAnswer: any): boolean => {
  const user = Number(userAnswer);
  const correct = Number(correctAnswer);
  if (isNaN(user) || isNaN(correct)) return false;
  return user === correct;
};

// 레벨별 필요 경험치 계산
export const getRequiredExperience = (level: number): number => {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
};

// 시간을 mm:ss 형식으로 포맷
export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 정확도 계산 (0-100)
export const calculateAccuracy = (correctAnswers: number, totalQuestions: number): number => {
  if (totalQuestions === 0) return 0;
  if (correctAnswers > totalQuestions) return 100;
  return Math.round((correctAnswers / totalQuestions) * 100);
};

// 레벨에 따른 포켓몬 희귀도 결정
export const getPokemonRarity = (level: number): string => {
  if (level <= 0) return 'common';
  if (level < 5) return 'common';
  if (level < 10) return 'uncommon';
  if (level < 15) return 'rare';
  if (level < 20) return 'epic';
  return 'legendary';
};

// 랜덤 격려 메시지
export const getEncouragementMessage = (isCorrect: boolean): string => {
  if (isCorrect) {
    const correctMessages = [
      '정답이에요! 훌륭해요! 🎉',
      '맞았어요! 너무 잘하네요! ⭐',
      '정확해요! 포켓몬도 기뻐하고 있어요! 😊',
      '완벽해요! 다음 문제도 화이팅! 💪',
      '대단해요! 곱셈 실력이 늘고 있어요! 🚀'
    ];
    return correctMessages[Math.floor(Math.random() * correctMessages.length)];
  } else {
    const wrongMessages = [
      '아쉬워요! 다시 한번 생각해봐요! 🤔',
      '틀렸지만 괜찮아요! 다시 도전해봐요! 💪',
      '조금 더 천천히 계산해봐요! 😊',
      '힌트를 보고 다시 시도해봐요! 💡',
      '포기하지 마세요! 곧 잘하게 될 거예요! 🌟'
    ];
    return wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
  }
};