// Frontend specific types (importing from shared types)
export interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  imageUrl: string;
  region: string;
  multiplicationTable: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  characteristics: string[];
}

export interface User {
  id: string;
  nickname: string;
  trainerLevel: number;
  currentRegion: string;
  completedTables: number[];
  caughtPokemon: number[];
  totalExperience: number;
  createdAt: Date;
  // Phase 2: Motivation System
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  starDust: number;
  earnedBadges: string[];
  purchasedItems: string[];
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
  timeSpent: number;
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

// Frontend specific interfaces
export interface GameState {
  currentUser: User | null;
  currentProblem: MathProblem | null;
  currentPokemon: Pokemon | null;
  isLoading: boolean;
  showConfetti: boolean;
  selectedTable: number;
}

export interface PokemonCatchResult {
  success: boolean;
  pokemon?: Pokemon;
  message: string;
  levelUp?: boolean;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  mistakeAnalysis?: string;
  improvedHint?: string;
  pokemonCaught?: PokemonCatchResult;
}

export interface PokedexEntry extends Pokemon {
  isCaught: boolean;
}

export interface RegionData {
  name: string;
  tables: number[];
  backgroundColor: string;
  isUnlocked: boolean;
  completionRate: number;
}

// Phase 2: Motivation System Types
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  dailyGoalMet: boolean;
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

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'achievement' | 'progress' | 'special' | 'streak';
  earnedAt?: Date;
  progress?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'cosmetic' | 'functional' | 'collection' | 'pokemon_accessory' | 'streak_protection' | 'xp_booster' | 'special_collection';
  imageUrl: string;
  available: boolean;
  purchasedAt?: Date;
}