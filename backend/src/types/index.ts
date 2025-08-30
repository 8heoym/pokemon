// 공통 타입 정의
export interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  imageUrl: string;
  region: string;
  multiplicationTable: number; // 연관된 구구단 (2-9)
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  characteristics: string[];
}

export interface User {
  id: string;
  nickname: string;
  trainerLevel: number;
  currentRegion: string;
  completedTables: number[]; // 완료한 구구단들
  caughtPokemon: number[]; // 잡은 포켓몬 ID들
  totalExperience: number;
  createdAt: Date;
}

export interface MathProblem {
  id: string;
  story: string;
  hint: string;
  equation: string;
  answer: number;
  multiplicationTable: number;
  pokemonId: number;
  difficulty: 1 | 2 | 3;
  visualElements?: {
    pokemonCount: number;
    itemsPerPokemon: number;
    totalItems: number;
  };
}

export interface UserAnswer {
  id: string;
  userId: string;
  problemId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // 초 단위
  hintsUsed: number;
  attemptedAt: Date;
}

export interface LearningAnalysis {
  userId: string;
  multiplicationTable: number;
  correctAnswers: number;
  totalAttempts: number;
  averageTime: number;
  commonMistakes: string[];
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
  recommendedActions: string[];
}