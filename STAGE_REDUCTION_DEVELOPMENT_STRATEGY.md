# 스테이지 축소 개발 전략

## 🏗️ 개발 아키텍처

### 1. 현재 시스템 분석

#### 1.1 스테이지 데이터 구조
```typescript
// 현재 구조 (adventureMapConstants.ts)
export const ADVENTURE_REGIONS: RegionTheme[] = [
  { id: 2, stages: 5 },   // 유지
  { id: 3, stages: 6 },   // → 3개로 축소
  { id: 4, stages: 7 },   // → 3개로 축소
  { id: 5, stages: 5 },   // 유지
  { id: 6, stages: 8 },   // → 3개로 축소
  { id: 7, stages: 9 },   // → 3개로 축소
  { id: 8, stages: 8 },   // → 3개로 축소
  { id: 9, stages: 10 }   // 유지 (최종 지역)
];
```

#### 1.2 사용자 진행 데이터 분석
```typescript
// User 타입의 진행 관련 필드
interface User {
  completedTables: number[];      // 완료한 구구단
  totalExperience: number;        // 총 경험치
  level: number;                  // 현재 레벨
  // 스테이지 개별 진행률은 현재 추적하지 않음
}
```

### 2. 구현 전략

#### 2.1 하위 호환성 보장 전략
```typescript
// 새로운 스테이지 매핑 시스템
interface StageMigrationConfig {
  regionId: number;
  oldStageCount: number;
  newStageCount: number;
  selectedStages: number[];        // 유지할 스테이지 번호
  stageMapping: Record<number, number>; // 구→신 스테이지 매핑
}

const STAGE_MIGRATION_CONFIG: StageMigrationConfig[] = [
  {
    regionId: 3,
    oldStageCount: 6,
    newStageCount: 3,
    selectedStages: [1, 3, 6],      // 첫번째, 중간, 마지막
    stageMapping: { 1:1, 2:1, 3:2, 4:2, 5:3, 6:3 }
  },
  {
    regionId: 4,
    oldStageCount: 7,
    newStageCount: 3,
    selectedStages: [1, 4, 7],
    stageMapping: { 1:1, 2:1, 3:2, 4:2, 5:2, 6:3, 7:3 }
  },
  // ... 다른 지역들
];
```

#### 2.2 점진적 마이그레이션 방식
```typescript
// 1단계: Feature Flag로 제어
interface GameConfig {
  useReducedStages: boolean;
  migrationPhase: 'disabled' | 'beta' | 'full';
}

// 2단계: 사용자별 점진적 적용
class StageMigrationService {
  shouldUseReducedStages(userId: string): boolean {
    // 베타 그룹 확인 → 점진적 확대 → 전체 적용
  }
  
  migrateUserProgress(user: User): User {
    // 기존 진행률을 새로운 구조로 변환
  }
}
```

## 🔧 구현 단계별 상세 계획

### Phase 1: 기반 구조 구축 (1-2일)

#### 1.1 새로운 상수 정의
```typescript
// utils/adventureMapConstants.ts 수정
export const REDUCED_STAGE_NAME_TEMPLATES: Record<number, string[]> = {
  3: [
    "꼬부기의 물방울 모으기",      // 기존 1번
    "거북왕의 파도타기",           // 기존 3번  
    "샤미드의 물 정화"            // 기존 6번
  ],
  4: [
    "이상해씨의 씨앗 심기",        // 기존 1번
    "치코리타의 잎사귀 춤",        // 기존 4번
    "셀레비의 시간 여행"          // 기존 7번
  ],
  // ... 다른 지역들
};
```

#### 1.2 마이그레이션 유틸리티 함수
```typescript
// utils/stageMigration.ts (신규 파일)
export class StageMigrationUtils {
  static getReducedStageConfig(regionId: number): StageMigrationConfig | null {
    return STAGE_MIGRATION_CONFIG.find(config => config.regionId === regionId);
  }
  
  static mapOldStageToNew(regionId: number, oldStageNumber: number): number {
    const config = this.getReducedStageConfig(regionId);
    return config?.stageMapping[oldStageNumber] || oldStageNumber;
  }
  
  static isRegionAffected(regionId: number): boolean {
    return [3, 4, 6, 7, 8].includes(regionId);
  }
}
```

### Phase 2: 백엔드 로직 업데이트 (2-3일)

#### 2.1 API 응답 형식 조정
```typescript
// services/SupabaseGameService.ts
export class SupabaseGameService {
  async getUserProgress(userId: string, useReducedStages = false): Promise<UserProgress> {
    const user = await this.getUserById(userId);
    
    if (useReducedStages) {
      return this.convertToReducedStageProgress(user);
    }
    
    return this.getOriginalProgress(user);
  }
  
  private convertToReducedStageProgress(user: User): UserProgress {
    // 기존 진행률을 새로운 스테이지 구조로 변환
    const convertedProgress = {};
    
    user.completedTables.forEach(tableId => {
      if (StageMigrationUtils.isRegionAffected(tableId)) {
        // 완료된 지역은 모든 새로운 스테이지가 완료된 것으로 처리
        convertedProgress[tableId] = { completed: true, stagesCompleted: 3 };
      }
    });
    
    return convertedProgress;
  }
}
```

#### 2.2 Feature Flag 시스템
```typescript
// services/FeatureFlagService.ts (신규 파일)
export class FeatureFlagService {
  static async isReducedStagesEnabled(userId: string): Promise<boolean> {
    // 환경변수 체크
    if (process.env.REDUCED_STAGES_PHASE === 'disabled') return false;
    if (process.env.REDUCED_STAGES_PHASE === 'full') return true;
    
    // 베타 사용자 체크 (예: 사용자 ID 해시 기반)
    const userHash = this.getUserHash(userId);
    const betaPercentage = parseInt(process.env.BETA_PERCENTAGE || '10');
    return userHash % 100 < betaPercentage;
  }
}
```

### Phase 3: 프론트엔드 업데이트 (3-4일)

#### 3.1 AdventureMap 컴포넌트 수정
```typescript
// components/AdventureMap.tsx
const AdventureMap: React.FC<AdventureMapProps> = ({ user, onStageSelect }) => {
  const [useReducedStages, setUseReducedStages] = useState(false);
  
  useEffect(() => {
    // 백엔드에서 Feature Flag 확인
    checkReducedStagesFlag(user.id).then(setUseReducedStages);
  }, [user.id]);
  
  const stageData = useMemo(() => {
    const baseRegions = useReducedStages ? REDUCED_ADVENTURE_REGIONS : ADVENTURE_REGIONS;
    const stageTemplates = useReducedStages ? REDUCED_STAGE_NAME_TEMPLATES : STAGE_NAME_TEMPLATES;
    
    return baseRegions.map(region => {
      // 기존 로직에 조건부 스테이지 수 적용
      const stageCount = useReducedStages && StageMigrationUtils.isRegionAffected(region.id)
        ? 3
        : region.stages;
        
      // 스테이지 생성 로직...
    });
  }, [user, useReducedStages]);
};
```

#### 3.2 사용자 경험 개선
```typescript
// components/StageMigrationNotice.tsx (신규 컴포넌트)
const StageMigrationNotice: React.FC = () => {
  return (
    <motion.div className="migration-notice">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-bold text-blue-800 mb-2">
          🎮 게임 경험이 더욱 재미있어졌어요!
        </h3>
        <p className="text-blue-700">
          각 지역의 핵심 스테이지만 선별하여 더 집중적인 학습이 가능합니다. 
          기존 진행사항은 모두 보존됩니다!
        </p>
      </div>
    </motion.div>
  );
};
```

### Phase 4: 데이터 검증 및 QA (2-3일)

#### 4.1 자동화된 테스트
```typescript
// tests/stageMigration.test.ts
describe('Stage Migration', () => {
  test('기존 사용자 진행률이 올바르게 변환되는가', () => {
    const oldUser = createMockUser({ completedTables: [2, 3, 4] });
    const migratedUser = StageMigrationService.migrateUserProgress(oldUser);
    
    expect(migratedUser.completedTables).toEqual([2, 3, 4]);
    // 완료된 지역은 여전히 완료 상태 유지
  });
  
  test('부분 진행 사용자의 데이터가 안전하게 처리되는가', () => {
    // 테스트 케이스들...
  });
});
```

#### 4.2 사용자 시나리오 테스트
```typescript
// 테스트 시나리오
const TEST_SCENARIOS = [
  {
    name: '완전 신규 사용자',
    setup: () => createNewUser(),
    expected: '축소된 스테이지로 새로운 경험'
  },
  {
    name: '일부 지역 완료 사용자',
    setup: () => createUserWithProgress([2, 3]),
    expected: '완료 상태 유지, 미완료 지역은 축소된 구조'
  },
  {
    name: '전체 완료 사용자',
    setup: () => createCompleteUser(),
    expected: '모든 진행사항 100% 보존'
  }
];
```

## 🚀 배포 전략

### 1. 카나리 릴리즈 계획
```typescript
// 단계적 배포 전략
const ROLLOUT_PHASES = [
  { phase: 'alpha', userPercentage: 5, duration: '2일' },
  { phase: 'beta', userPercentage: 20, duration: '1주일' },
  { phase: 'gradual', userPercentage: 50, duration: '3일' },
  { phase: 'full', userPercentage: 100, duration: '즉시' }
];
```

### 2. 모니터링 지표
```typescript
interface MigrationMetrics {
  userRetentionRate: number;        // 사용자 유지율
  completionRate: number;           // 지역 완료율
  sessionDuration: number;          // 평균 세션 시간
  userSatisfactionScore: number;    // 만족도 점수
  errorRate: number;                // 오류 발생률
}
```

### 3. 롤백 계획
```typescript
// 긴급 롤백 시나리오
class EmergencyRollback {
  static async revertToOriginalStages(): Promise<void> {
    // 1. Feature Flag 즉시 비활성화
    await FeatureFlagService.setGlobalFlag('REDUCED_STAGES', false);
    
    // 2. 캐시 클리어
    await CacheService.clearStageConfigCache();
    
    // 3. 사용자 알림
    await NotificationService.sendMaintenanceNotice();
  }
}
```

## 📊 예상 효과 및 성공 지표

### 1. 정량적 목표
- **완주율 증가**: 현재 대비 25% ↑
- **평균 세션 시간**: 지역당 40% 단축
- **사용자 이탈률**: 중간 이탈 20% ↓

### 2. 정성적 개선
- 사용자 만족도 향상
- 학습 집중도 증가  
- 성취감 극대화

---
*이 개발 전략은 사용자 데이터 보존과 경험 개선을 동시에 달성하는 것을 목표로 합니다.*