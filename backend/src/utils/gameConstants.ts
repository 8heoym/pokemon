/**
 * 🎮 포켓몬 수학 모험 - 게임 상수 중앙 관리
 * 
 * 모든 하드코딩된 매직넘버와 설정값을 중앙에서 관리하여
 * 유지보수성 향상 및 설정 변경 용이성 제공
 */

// 🔢 구구단 및 수학 설정
export const GAME_CONFIG = {
  // 구구단 학습 순서 (난이도순)
  MULTIPLICATION_ORDER: [2, 5, 3, 6, 4, 8, 7, 9, 1, 0],
  
  // 지원하는 구구단 범위
  TABLES: [2, 3, 4, 5, 6, 7, 8, 9],
  
  // 문제 난이도 설정
  DIFFICULTY: {
    DEFAULT: 1 as const,
    MIN: 1 as const,
    MAX: 3 as const,
    LABELS: {
      1: '쉬움',
      2: '보통', 
      3: '어려움'
    } as const
  },

  // 힌트 시스템
  HINTS: {
    MAX_COUNT: 3,
    PENALTY_PERCENTAGE: 10 // 힌트 사용 시 경험치 감소율
  }
} as const;

// 💰 경험치 및 레벨링 시스템
export const EXPERIENCE_CONFIG = {
  // 기본 경험치 계산 베이스
  BASE: 100,
  
  // 포켓몬 희귀도별 경험치
  RARITY_MAP: {
    common: 10,
    uncommon: 20,
    rare: 50,
    epic: 100,
    legendary: 200
  } as const,

  // 문제 난이도별 기본 경험치
  DIFFICULTY_BASE: {
    1: 10,
    2: 20,
    3: 30
  } as const,

  // 시간 보너스 설정
  TIME_BONUS: {
    MAX_BONUS: 30,        // 최대 보너스 점수
    THRESHOLD_SECONDS: 30  // 이 시간 이내 완료 시 보너스
  }
} as const;

// 🎯 레벨 시스템
export const LEVEL_CONFIG = {
  MAX_LEVEL: 100,
  
  // 레벨업 메시지
  LEVEL_UP_MESSAGES: [
    '레벨 업! 훌륭해요!',
    '새로운 레벨에 도달했습니다!',
    '포켓몬 트레이너로 성장하고 있어요!',
    '수학 실력이 향상되었습니다!'
  ]
} as const;

// 🌍 지역 시스템
export const REGION_CONFIG = {
  // 지역별 해금 조건 (완료해야 할 구구단)
  UNLOCK_REQUIREMENTS: {
    '관동지방': [2, 5],
    '성도지방': [3, 6],
    '호연지방': [4, 8],
    '신오지방': [7, 9],
    '하나지방': [1, 0],
    '칼로스지방': [2, 3],
    '알로라지방': [4, 5],
    '가라르지방': [6, 7],
    '팔데아지방': [8, 9]
  } as const,

  // 지역 순서
  ORDER: [
    '관동지방', '성도지방', '호연지방', '신오지방',
    '하나지방', '칼로스지방', '알로라지방', '가라르지방', '팔데아지방'
  ] as const,

  // 지역별 설명
  DESCRIPTIONS: {
    '관동지방': '포켓몬 여행의 시작점! 기초 구구단을 마스터하세요.',
    '성도지방': '새로운 포켓몬들이 기다리고 있어요!',
    '호연지방': '더욱 다양한 포켓몬을 만날 수 있습니다.',
    '신오지방': '전설의 포켓몬에 한 걸음 더 가까워집니다.',
    '하나지방': '고급 수학 기술을 배울 수 있는 곳!',
    '칼로스지방': '아름다운 포켓몬들의 고향입니다.',
    '알로라지방': '열대 지역의 특별한 포켓몬들!',
    '가라르지방': '새로운 도전이 기다립니다.',
    '팔데아지방': '최고의 포켓몬 트레이너가 되는 곳!'
  } as const
} as const;

// 🎮 세션 및 캐시 설정
export const SESSION_CONFIG = {
  // 문제 캐시 TTL (밀리초)
  DEFAULT_TTL: 60 * 60 * 1000, // 1시간
  
  // 사용자당 최대 문제 저장 수
  MAX_PROBLEMS_PER_USER: 5,
  
  // 리더보드 캐시 시간
  LEADERBOARD_CACHE_TTL: 5 * 60 * 1000, // 5분
  
  // 포켓몬 데이터 캐시 시간
  POKEMON_CACHE_TTL: 24 * 60 * 60 * 1000 // 24시간
} as const;

// 🎨 UI 상수
export const UI_CONFIG = {
  // 애니메이션 지속 시간 (초)
  ANIMATION_DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5,
    CONFETTI: 5
  },

  // 컴포넌트 크기
  SIZES: {
    XS: 'xs',
    SM: 'sm', 
    MD: 'md',
    LG: 'lg',
    XL: 'xl'
  } as const,

  // 색상 변형
  VARIANTS: {
    PRIMARY: 'primary',
    SUCCESS: 'success',
    WARNING: 'warning', 
    DANGER: 'danger',
    OUTLINE: 'outline',
    GHOST: 'ghost',
    LEGENDARY: 'legendary'
  } as const
} as const;

// 🏆 도전 과제 설정
export const ACHIEVEMENT_CONFIG = {
  TYPES: {
    FIRST_CATCH: 'first_catch',
    SPEED_DEMON: 'speed_demon',
    ACCURACY_MASTER: 'accuracy_master',
    TABLE_MASTER: 'table_master',
    REGION_EXPLORER: 'region_explorer'
  } as const,

  REQUIREMENTS: {
    SPEED_DEMON_TIME: 10, // 10초 이내 정답
    ACCURACY_MASTER_STREAK: 10, // 연속 10개 정답
    TABLE_MASTER_COUNT: 50 // 한 구구단 50개 문제 완료
  }
} as const;

// 🔊 사운드 및 피드백
export const FEEDBACK_CONFIG = {
  MESSAGES: {
    CORRECT: [
      '정답입니다! 훌륭해요!',
      '맞았어요! 계속 도전하세요!',
      '완벽합니다!',
      '잘했어요!'
    ],
    INCORRECT: [
      '다시 한번 생각해보세요!',
      '거의 다 왔어요! 조금만 더!',
      '힌트를 사용해보세요!',
      '천천히 다시 계산해보세요!'
    ],
    POKEMON_CAUGHT: [
      '새로운 포켓몬을 잡았어요!',
      '포켓몬이 동료가 되었습니다!',
      '도감에 새로운 친구가 추가되었어요!',
      '훌륭한 포켓몬 트레이너네요!'
    ]
  } as const,

  EMOJIS: {
    CORRECT: ['🎉', '✅', '⭐', '🏆'],
    INCORRECT: ['🤔', '💭', '📚', '🎯'],
    POKEMON_CAUGHT: ['🔴', '⚡', '✨', '🎊'],
    LEVEL_UP: ['🌟', '🚀', '💫', '🎆']
  } as const
} as const;

// 🌐 API 설정
export const API_CONFIG = {
  TIMEOUT: 10000, // 10초
  RETRY_ATTEMPTS: 3,
  
  ENDPOINTS: {
    PROBLEMS: '/api/problems',
    USERS: '/api/users',
    POKEMON: '/api/pokemon',
    LEADERBOARD: '/api/leaderboard'
  } as const
} as const;

// ⚙️ 개발 모드 설정
export const DEV_CONFIG = {
  ENABLE_CONSOLE_LOGS: process.env.NODE_ENV === 'development',
  MOCK_DATA_ENABLED: false,
  PERFORMANCE_MONITORING: true
} as const;

// 📱 반응형 브레이크포인트
export const BREAKPOINTS = {
  MOBILE: '(max-width: 767px)',
  TABLET: '(min-width: 768px) and (max-width: 1023px)',
  DESKTOP: '(min-width: 1024px)'
} as const;

// 🎪 특별 이벤트 설정
export const EVENT_CONFIG = {
  SPECIAL_EVENTS: {
    DOUBLE_EXP_WEEKENDS: false,
    RARE_POKEMON_EVENT: false,
    SPEED_CHALLENGE: false
  },
  
  EVENT_MULTIPLIERS: {
    EXPERIENCE: 2.0,
    RARE_POKEMON_CHANCE: 1.5
  }
} as const;

// 🔒 보안 설정
export const SECURITY_CONFIG = {
  MAX_API_CALLS_PER_MINUTE: 60,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30분
  RATE_LIMIT_WINDOW: 60 * 1000 // 1분
} as const;

// 📊 분석 및 메트릭
export const ANALYTICS_CONFIG = {
  TRACK_USER_PROGRESS: true,
  TRACK_PROBLEM_DIFFICULTY: true,
  TRACK_POKEMON_CATCH_RATES: true,
  
  METRICS: {
    PROBLEM_GENERATION_TIME: 'problem_generation_ms',
    ANSWER_SUBMISSION_TIME: 'answer_submission_ms',
    POKEMON_CATCH_SUCCESS_RATE: 'pokemon_catch_rate'
  } as const
} as const;

export default {
  GAME_CONFIG,
  EXPERIENCE_CONFIG,
  LEVEL_CONFIG,
  REGION_CONFIG,
  SESSION_CONFIG,
  UI_CONFIG,
  ACHIEVEMENT_CONFIG,
  FEEDBACK_CONFIG,
  API_CONFIG,
  DEV_CONFIG,
  BREAKPOINTS,
  EVENT_CONFIG,
  SECURITY_CONFIG,
  ANALYTICS_CONFIG
} as const;