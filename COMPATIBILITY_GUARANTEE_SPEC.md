# 호환성 보장 상세 명세서

## 🛡️ 데이터 보존 전략

### 1. 기존 사용자 데이터 분석

#### 1.1 현재 데이터 구조
```typescript
interface User {
  id: string;
  nickname: string;
  completedTables: number[];      // [2, 3, 4] = 2,3,4단 완료
  totalExperience: number;        // 누적 경험치
  level: number;                  // 현재 레벨
  caughtPokemon: string[];        // 잡은 포켓몬 ID 목록
  createdAt: Date;
  lastActiveDate: Date;
}
```

#### 1.2 스테이지 진행률 추론 로직
```typescript
// 현재는 개별 스테이지 진행률을 저장하지 않으므로
// completedTables 배열로부터 진행률 추론
class ProgressInference {
  static getRegionProgress(user: User, regionId: number): RegionProgress {
    const isCompleted = user.completedTables.includes(regionId);
    const experienceThreshold = (regionId - 2) * 100; // 지역별 경험치 임계값
    
    return {
      regionId,
      isCompleted,
      hasStarted: user.totalExperience >= experienceThreshold,
      estimatedProgress: isCompleted ? 100 : 
        Math.min((user.totalExperience - experienceThreshold) / 100 * 100, 90)
    };
  }
}
```

### 2. 마이그레이션 매핑 시스템

#### 2.1 스테이지 매핑 정의
```typescript
interface StageMappingRule {
  regionId: number;
  oldConfig: {
    stageCount: number;
    stageNames: string[];
  };
  newConfig: {
    stageCount: number;
    selectedStages: number[];        // 유지할 기존 스테이지 번호
    stageNames: string[];
  };
  mappingFunction: (oldStage: number) => number;
}

const STAGE_MAPPING_RULES: StageMappingRule[] = [
  {
    regionId: 3, // 꼬부기의 연못
    oldConfig: {
      stageCount: 6,
      stageNames: [
        "꼬부기의 물방울 모으기",
        "어니부기의 수영 교실", 
        "거북왕의 파도타기",
        "고래왕의 분수쇼",
        "라프라스의 바다 여행",
        "샤미드의 물 정화"
      ]
    },
    newConfig: {
      stageCount: 3,
      selectedStages: [1, 3, 6],
      stageNames: [
        "꼬부기의 물방울 모으기",     // 기존 1번 → 신규 1번
        "거북왕의 파도타기",          // 기존 3번 → 신규 2번
        "샤미드의 물 정화"            // 기존 6번 → 신규 3번
      ]
    },
    mappingFunction: (oldStage: number) => {
      const mapping = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3 };
      return mapping[oldStage] || 1;
    }
  }
  // ... 다른 지역들
];
```

#### 2.2 보상 시스템 재계산
```typescript
class RewardMigration {
  static calculatePreservedRewards(user: User, regionId: number): RewardSummary {
    const rule = STAGE_MAPPING_RULES.find(r => r.regionId === regionId);
    if (!rule) return { preserved: true, adjustmentNeeded: false };
    
    const isRegionCompleted = user.completedTables.includes(regionId);
    if (!isRegionCompleted) {
      return { preserved: true, adjustmentNeeded: false };
    }
    
    // 완료된 지역의 경우, 기존 보상량과 신규 보상량 비교
    const oldTotalReward = rule.oldConfig.stageCount * BASE_STAGE_REWARD;
    const newTotalReward = rule.newConfig.stageCount * ENHANCED_STAGE_REWARD;
    
    return {
      preserved: true,
      adjustmentNeeded: oldTotalReward !== newTotalReward,
      compensationRequired: Math.max(0, oldTotalReward - newTotalReward)
    };
  }
}
```

### 3. 점진적 전환 시스템

#### 3.1 Feature Flag 기반 제어
```typescript
enum MigrationPhase {
  DISABLED = 'disabled',
  BETA_5 = 'beta_5',      // 5% 사용자
  BETA_20 = 'beta_20',    // 20% 사용자  
  GRADUAL_50 = 'gradual_50', // 50% 사용자
  FULL = 'full'           // 100% 사용자
}

class MigrationController {
  static async shouldApplyReducedStages(userId: string): Promise<boolean> {
    const phase = await this.getCurrentPhase();
    const userSegment = this.getUserSegment(userId);
    
    switch (phase) {
      case MigrationPhase.DISABLED:
        return false;
      case MigrationPhase.BETA_5:
        return userSegment < 5;
      case MigrationPhase.BETA_20:
        return userSegment < 20;
      case MigrationPhase.GRADUAL_50:
        return userSegment < 50;
      case MigrationPhase.FULL:
        return true;
    }
  }
  
  private static getUserSegment(userId: string): number {
    // 사용자 ID 해시를 기반으로 0-99 세그먼트 배정
    const hash = this.hashUserId(userId);
    return hash % 100;
  }
}
```

#### 3.2 실시간 A/B 테스트 시스템
```typescript
interface ABTestMetrics {
  userId: string;
  variant: 'original' | 'reduced';
  metrics: {
    sessionDuration: number;
    stagesCompleted: number;
    retentionRate: number;
    satisfactionScore?: number;
  };
  timestamp: Date;
}

class ABTestTracker {
  static async recordUserMetrics(userId: string, metrics: ABTestMetrics['metrics']): Promise<void> {
    const variant = await MigrationController.shouldApplyReducedStages(userId) 
      ? 'reduced' : 'original';
      
    await this.logMetrics({
      userId,
      variant,
      metrics,
      timestamp: new Date()
    });
  }
  
  static async getPerformanceComparison(): Promise<ABTestResults> {
    const results = await this.aggregateMetrics();
    return {
      originalVariant: results.original,
      reducedVariant: results.reduced,
      statisticalSignificance: this.calculateSignificance(results),
      recommendation: this.generateRecommendation(results)
    };
  }
}
```

### 4. 데이터 무결성 보장

#### 4.1 마이그레이션 검증 시스템
```typescript
class DataIntegrityValidator {
  static async validateUserMigration(userId: string): Promise<ValidationResult> {
    const originalUser = await this.getUserData(userId, { useCache: false });
    const migratedUser = await this.getMigratedUserData(userId);
    
    return {
      userDataPreserved: this.compareUserData(originalUser, migratedUser),
      progressPreserved: this.validateProgressPreservation(originalUser, migratedUser),
      rewardsPreserved: this.validateRewardPreservation(originalUser, migratedUser),
      pokemonPreserved: originalUser.caughtPokemon.length === migratedUser.caughtPokemon.length,
      errors: this.collectValidationErrors()
    };
  }
  
  private static validateProgressPreservation(original: User, migrated: User): boolean {
    // 완료된 구구단이 동일한지 확인
    const originalCompleted = new Set(original.completedTables);
    const migratedCompleted = new Set(migrated.completedTables);
    
    return originalCompleted.size === migratedCompleted.size &&
           [...originalCompleted].every(table => migratedCompleted.has(table));
  }
}
```

#### 4.2 자동 롤백 시스템
```typescript
class AutoRollbackSystem {
  static async monitorMigrationHealth(): Promise<void> {
    const healthMetrics = await this.collectHealthMetrics();
    
    if (this.detectCriticalIssues(healthMetrics)) {
      console.warn('🚨 Critical migration issues detected, initiating rollback');
      await this.executeEmergencyRollback();
    }
  }
  
  private static detectCriticalIssues(metrics: HealthMetrics): boolean {
    return (
      metrics.errorRate > 0.05 ||          // 5% 이상 에러율
      metrics.dataLossIncidents > 0 ||      // 데이터 손실 사건
      metrics.userComplaints > 10           // 사용자 불만 10건 이상
    );
  }
  
  private static async executeEmergencyRollback(): Promise<void> {
    // 1. Feature Flag 즉시 비활성화
    await FeatureFlagService.setFlag(MigrationPhase.DISABLED);
    
    // 2. 영향받은 사용자들의 캐시 클리어
    await CacheService.clearMigrationCache();
    
    // 3. 사용자 알림 발송
    await NotificationService.sendRollbackNotice();
    
    // 4. 개발팀 긴급 알림
    await AlertingService.notifyDevelopmentTeam('MIGRATION_ROLLBACK');
  }
}
```

### 5. 사용자 커뮤니케이션 전략

#### 5.1 마이그레이션 안내 시스템
```typescript
interface MigrationNotice {
  type: 'info' | 'success' | 'warning';
  title: string;
  description: string;
  actionRequired: boolean;
  ctaText?: string;
  ctaAction?: () => void;
}

const MIGRATION_NOTICES: Record<string, MigrationNotice> = {
  first_login_after_migration: {
    type: 'info',
    title: '🎮 더 재미있어진 모험이 기다려요!',
    description: '각 지역의 핵심 스테이지만 선별하여 더욱 집중적인 학습을 제공합니다. 기존 진행사항은 모두 안전하게 보존됩니다.',
    actionRequired: false
  },
  
  progress_preserved: {
    type: 'success',
    title: '✅ 모든 진행사항이 안전하게 보존되었습니다',
    description: '완료하신 구구단, 잡은 포켓몬, 획득한 보상이 모두 그대로 유지됩니다.',
    actionRequired: false
  },
  
  enhanced_rewards: {
    type: 'info',
    title: '🎁 스테이지 보상이 더욱 풍성해졌어요',
    description: '선별된 스테이지에서 더 큰 보상을 받을 수 있습니다.',
    actionRequired: false
  }
};
```

#### 5.2 피드백 수집 시스템
```typescript
interface UserFeedback {
  userId: string;
  feedbackType: 'satisfaction' | 'bug_report' | 'suggestion';
  rating: number; // 1-5
  comment: string;
  beforeMigration: boolean;
  timestamp: Date;
}

class FeedbackCollectionService {
  static async collectMigrationFeedback(userId: string): Promise<void> {
    // 마이그레이션 후 첫 로그인 시 피드백 요청
    const shouldRequestFeedback = await this.shouldRequestFeedback(userId);
    
    if (shouldRequestFeedback) {
      await this.showFeedbackModal(userId, {
        title: '새로워진 게임 경험은 어떠세요?',
        questions: [
          '스테이지 수가 줄어든 것에 대해 어떻게 생각하시나요?',
          '게임이 더 재미있어졌나요?',
          '학습에 더 집중할 수 있게 되었나요?'
        ]
      });
    }
  }
}
```

### 6. 성능 최적화 및 모니터링

#### 6.1 성능 지표 추적
```typescript
interface PerformanceMetrics {
  loadTime: {
    adventureMapRender: number;
    stageDataFetch: number;
    userProgressCalculation: number;
  };
  memoryUsage: {
    stageDataSize: number;
    userProgressCacheSize: number;
  };
  apiCalls: {
    stageConfigRequests: number;
    migrationStatusChecks: number;
  };
}

class PerformanceMonitor {
  static trackMigrationPerformance(userId: string): void {
    const startTime = performance.now();
    
    // 마이그레이션 관련 작업 수행...
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.recordMetric({
      type: 'migration_duration',
      userId,
      duration,
      timestamp: new Date()
    });
  }
}
```

#### 6.2 실시간 대시보드
```typescript
interface MigrationDashboard {
  activeUsers: {
    originalStages: number;
    reducedStages: number;
  };
  performanceMetrics: {
    avgSessionDuration: number;
    completionRates: Record<number, number>; // 지역별 완료율
    errorRates: Record<string, number>;
  };
  userSatisfaction: {
    avgRating: number;
    feedbackCount: number;
    issueReports: number;
  };
}
```

## 🔧 구현 체크리스트

### Phase 1: 준비 단계
- [ ] 현재 사용자 데이터 백업
- [ ] 스테이지 매핑 규칙 정의
- [ ] Feature Flag 시스템 구축
- [ ] A/B 테스트 인프라 준비

### Phase 2: 개발 단계
- [ ] 마이그레이션 로직 구현
- [ ] 데이터 검증 시스템 구축
- [ ] 자동 롤백 시스템 구현
- [ ] 사용자 알림 시스템 준비

### Phase 3: 테스트 단계
- [ ] 단위 테스트 작성 및 실행
- [ ] 통합 테스트 수행
- [ ] 사용자 시나리오 테스트
- [ ] 성능 테스트 및 최적화

### Phase 4: 배포 단계
- [ ] 베타 그룹 배포 (5%)
- [ ] 모니터링 및 피드백 수집
- [ ] 점진적 확대 (20% → 50% → 100%)
- [ ] 전체 배포 완료

---
*이 명세서는 사용자 데이터의 완전한 보존과 매끄러운 전환 경험을 보장하기 위한 상세한 구현 방안을 제시합니다.*