/**
 * 🗺️ 모험 지도 시스템 상수 정의
 * PRD [F-1.2-F-1.6] 요구사항에 따른 테마 지역 및 스테이지 시스템
 */

export interface RegionTheme {
  id: number;
  name: string;
  theme: string;
  color: string;
  bgGradient: string;
  emoji: string;
  stages: number;
  description: string;
  pokemonTypes: string[];
}

export interface Stage {
  id: string;
  regionId: number;
  stageNumber: number;
  name: string;
  description: string;
  problemCount: number;
  requiredProblems: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  completedProblems: number;
}

// PRD [F-1.3] 테마 지역 정의
export const ADVENTURE_REGIONS: RegionTheme[] = [
  {
    id: 2,
    name: "피카츄의 풀숲",
    theme: "grassland",
    color: "green",
    bgGradient: "from-green-400 via-green-500 to-green-600",
    emoji: "🌱",
    stages: 5,
    description: "전기 포켓몬들이 뛰노는 푸른 초원",
    pokemonTypes: ["electric", "grass"]
  },
  {
    id: 3,
    name: "꼬부기의 연못",
    theme: "water",
    color: "blue", 
    bgGradient: "from-blue-400 via-blue-500 to-blue-600",
    emoji: "💧",
    stages: 6,
    description: "맑은 물이 흐르는 평화로운 연못",
    pokemonTypes: ["water"]
  },
  {
    id: 4,
    name: "이상해씨의 정원",
    theme: "garden",
    color: "green",
    bgGradient: "from-emerald-400 via-emerald-500 to-emerald-600", 
    emoji: "🌺",
    stages: 7,
    description: "아름다운 꽃들이 피어난 마법의 정원",
    pokemonTypes: ["grass", "fairy"]
  },
  {
    id: 5,
    name: "루카리오의 바다",
    theme: "ocean",
    color: "cyan",
    bgGradient: "from-cyan-400 via-cyan-500 to-cyan-600",
    emoji: "🌊", 
    stages: 5,
    description: "끝없이 펼쳐진 푸른 바다",
    pokemonTypes: ["water", "fighting"]
  },
  {
    id: 6,
    name: "뮤츠의 동굴",
    theme: "cave",
    color: "purple",
    bgGradient: "from-purple-400 via-purple-500 to-purple-600",
    emoji: "🔮",
    stages: 8,
    description: "신비한 힘이 숨어있는 깊은 동굴",
    pokemonTypes: ["psychic", "rock"]
  },
  {
    id: 7,
    name: "파이리의 화산",
    theme: "volcano",
    color: "red",
    bgGradient: "from-red-400 via-red-500 to-red-600",
    emoji: "🌋",
    stages: 9,
    description: "용암이 흐르는 뜨거운 화산",
    pokemonTypes: ["fire", "ground"]
  },
  {
    id: 8,
    name: "갸라도스의 폭포",
    theme: "waterfall", 
    color: "indigo",
    bgGradient: "from-indigo-400 via-indigo-500 to-indigo-600",
    emoji: "💫",
    stages: 8,
    description: "거대한 폭포가 떨어지는 장엄한 계곡",
    pokemonTypes: ["water", "dragon"]
  },
  {
    id: 9,
    name: "뮤의 신전",
    theme: "temple",
    color: "pink",
    bgGradient: "from-pink-400 via-pink-500 to-pink-600", 
    emoji: "✨",
    stages: 10,
    description: "고대 포켓몬의 신비가 깃든 성스러운 신전",
    pokemonTypes: ["psychic", "fairy"]
  }
];

// PRD [F-1.4] 스테이지 이름 템플릿
export const STAGE_NAME_TEMPLATES: Record<number, string[]> = {
  2: [
    "피카츄의 번개 수집",
    "라이츄의 전기 저장",
    "볼트오브의 충전소",
    "일렉키드의 발전기",
    "썬더의 구름 여행"
  ],
  3: [
    "꼬부기의 물방울 모으기",
    "어니부기의 수영 교실", 
    "거북왕의 파도타기",
    "고래왕의 분수쇼",
    "라프라스의 바다 여행",
    "샤미드의 물 정화"
  ],
  4: [
    "이상해씨의 씨앗 심기",
    "이상해풀의 꽃밭 가꾸기",
    "이상해꽃의 향기 만들기",
    "치코리타의 잎사귀 춤",
    "베이리프의 꽃가루 수집",
    "메가니움의 정원 완성",
    "셀레비의 시간 여행"
  ],
  5: [
    "루카리오의 파동 훈련",
    "리오루의 감정 읽기",
    "마크탕의 거품 놀이",
    "골덕의 염력 수업",
    "스타미의 보석 찾기"
  ],
  6: [
    "뮤츠의 초능력 수업",
    "에스퍼의 미래 보기",
    "후딘의 스푼 굽히기",
    "크레세리아의 달빛 여행",
    "다크라이의 악몽 정화",
    "데오키시스의 형태 변환",
    "미뇽의 용의 춤",
    "망나뇽의 하늘 날기"
  ],
  7: [
    "파이리의 불꽃 연습",
    "리자드의 화염 조절",
    "리자몽의 하늘 비행",
    "마그마의 용암 수집",
    "마그카르고의 열기 방출",
    "부스터의 불꽃 점프",
    "윈디의 질주 훈련",
    "엔테이의 화산 정화",
    "호우오우의 성스러운 불꽃"
  ],
  8: [
    "갸라도스의 분노 다스리기",
    "잉어킹의 도약 연습",
    "수이쿤의 정화의 물",
    "루기아의 바람 일으키기", 
    "샤미드의 투명화 수업",
    "스타미의 보석 반짝이기",
    "라티오스의 마음 읽기",
    "라티아스의 투명 비행"
  ],
  9: [
    "뮤의 변신 연습",
    "셀레비의 시간 조작",
    "지라치의 소원 들어주기",
    "데오키시스의 우주 여행",
    "크레세리아의 좋은 꿈 선물",
    "다크라이의 악몽 봉인",
    "아르세우스의 창조 체험",
    "비크티니의 승리 에너지",
    "케르디오의 성수 찾기",
    "메로엣타의 노래 배우기"
  ]
};

// 스테이지 축소를 위한 선별된 이름 템플릿 (PRD F-1.3 기준)
export const REDUCED_STAGE_NAME_TEMPLATES: Record<number, string[]> = {
  3: [ // 6개 → 3개 (1, 3, 6번째 선별)
    "꼬부기의 물방울 모으기",    // 기존 1번째
    "거북왕의 파도타기",         // 기존 3번째  
    "샤미드의 물 정화"           // 기존 6번째
  ],
  4: [ // 7개 → 3개 (1, 4, 7번째 선별)
    "이상해씨의 씨앗 심기",      // 기존 1번째
    "치코리타의 잎사귀 춤",      // 기존 4번째
    "셀레비의 시간 여행"        // 기존 7번째
  ],
  6: [ // 8개 → 3개 (1, 4, 8번째 선별)
    "뮤츠의 초능력 수업",        // 기존 1번째
    "크레세리아의 달빛 여행",    // 기존 4번째
    "망나뇽의 하늘 날기"        // 기존 8번째
  ],
  7: [ // 9개 → 3개 (1, 5, 9번째 선별)
    "파이리의 불꽃 연습",        // 기존 1번째
    "마그카르고의 열기 방출",    // 기존 5번째
    "호우오우의 성스러운 불꽃"  // 기존 9번째
  ],
  8: [ // 8개 → 3개 (1, 4, 8번째 선별)
    "갸라도스의 분노 다스리기",  // 기존 1번째
    "루기아의 바람 일으키기",    // 기존 4번째
    "라티아스의 투명 비행"      // 기존 8번째
  ]
};

// PRD [F-1.5] 시각적 상태 정의
export const STAGE_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available', 
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const;

export type StageStatus = typeof STAGE_STATUS[keyof typeof STAGE_STATUS];

// 스테이지 상태별 시각적 스타일
export const STAGE_VISUAL_CONFIG = {
  [STAGE_STATUS.LOCKED]: {
    bgColor: 'bg-gray-300',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-300',
    icon: '🔒',
    glow: false,
    glowColor: ''
  },
  [STAGE_STATUS.AVAILABLE]: {
    bgColor: 'bg-white',
    textColor: 'text-gray-700', 
    borderColor: 'border-blue-300',
    icon: '📚',
    glow: false,
    glowColor: ''
  },
  [STAGE_STATUS.IN_PROGRESS]: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-400',
    icon: '⚡',
    glow: true,
    glowColor: 'shadow-yellow-200'
  },
  [STAGE_STATUS.COMPLETED]: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800', 
    borderColor: 'border-green-400',
    icon: '✅',
    glow: true,
    glowColor: 'shadow-green-200'
  }
};