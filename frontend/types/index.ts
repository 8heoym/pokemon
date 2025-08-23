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