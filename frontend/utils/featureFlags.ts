/**
 * Feature Flag 시스템 - 스테이지 축소 기능 제어
 * PRD 요구사항: A/B 테스트 없이 환경변수 기반 점진적 적용
 */

export enum StageMigrationPhase {
  DISABLED = 'disabled',     // 기능 비활성화
  BETA = 'beta',            // 베타 테스트 (환경변수 제어)  
  FULL = 'full'             // 전체 적용
}

export interface FeatureFlagConfig {
  reducedStages: {
    enabled: boolean;
    phase: StageMigrationPhase;
    reason: string;
  };
}

class FeatureFlagService {
  private static instance: FeatureFlagService;
  private config: FeatureFlagConfig;

  private constructor() {
    this.config = this.initializeConfig();
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  private initializeConfig(): FeatureFlagConfig {
    // 환경변수 기반 설정 (개발전략에서 명시한 대로)
    const phase = (process.env.NEXT_PUBLIC_STAGE_REDUCTION_PHASE as StageMigrationPhase) || StageMigrationPhase.DISABLED;
    
    return {
      reducedStages: {
        enabled: phase !== StageMigrationPhase.DISABLED,
        phase,
        reason: this.getPhaseReason(phase)
      }
    };
  }

  private getPhaseReason(phase: StageMigrationPhase): string {
    switch (phase) {
      case StageMigrationPhase.DISABLED:
        return '스테이지 축소 기능이 비활성화되어 있습니다';
      case StageMigrationPhase.BETA:
        return '베타 테스트 단계: 제한된 환경에서 스테이지 축소 기능 테스트 중';
      case StageMigrationPhase.FULL:
        return '전체 적용: 모든 사용자에게 축소된 스테이지 제공';
      default:
        return '알 수 없는 단계';
    }
  }

  /**
   * 축소된 스테이지 기능 사용 여부 확인
   * A/B 테스트 없이 환경변수만으로 제어
   */
  public shouldUseReducedStages(): boolean {
    return this.config.reducedStages.enabled;
  }

  /**
   * 현재 마이그레이션 단계 반환
   */
  public getCurrentPhase(): StageMigrationPhase {
    return this.config.reducedStages.phase;
  }

  /**
   * Feature Flag 정보 반환 (디버깅용)
   */
  public getFeatureFlagInfo(): FeatureFlagConfig {
    return { ...this.config };
  }

  /**
   * 런타임에 설정 업데이트 (개발/테스트용)
   */
  public updateConfig(phase: StageMigrationPhase): void {
    this.config.reducedStages.phase = phase;
    this.config.reducedStages.enabled = phase !== StageMigrationPhase.DISABLED;
    this.config.reducedStages.reason = this.getPhaseReason(phase);
    
    console.log(`🚀 Feature Flag 업데이트: ${phase} - ${this.config.reducedStages.reason}`);
  }

  /**
   * 로컬스토리지를 통한 개발자 오버라이드 (개발용)
   */
  public getDevOverride(): StageMigrationPhase | null {
    if (typeof window === 'undefined') return null;
    
    const override = localStorage.getItem('dev_stage_reduction_override');
    if (override && Object.values(StageMigrationPhase).includes(override as StageMigrationPhase)) {
      return override as StageMigrationPhase;
    }
    return null;
  }

  /**
   * 개발자 오버라이드 적용 (개발용)
   */
  public setDevOverride(phase: StageMigrationPhase | null): void {
    if (typeof window === 'undefined') return;
    
    if (phase === null) {
      localStorage.removeItem('dev_stage_reduction_override');
    } else {
      localStorage.setItem('dev_stage_reduction_override', phase);
    }
    
    console.log(`🛠️ 개발자 오버라이드 설정: ${phase}`);
  }

  /**
   * 최종 사용 여부 결정 (오버라이드 포함)
   */
  public shouldUseReducedStagesWithOverride(): boolean {
    const devOverride = this.getDevOverride();
    
    if (devOverride !== null) {
      return devOverride !== StageMigrationPhase.DISABLED;
    }
    
    return this.shouldUseReducedStages();
  }
}

// 싱글톤 인스턴스 export
export const featureFlagService = FeatureFlagService.getInstance();

// 편의 함수들
export const useReducedStages = (): boolean => {
  return featureFlagService.shouldUseReducedStagesWithOverride();
};

export const getCurrentMigrationPhase = (): StageMigrationPhase => {
  return featureFlagService.getCurrentPhase();
};

export const getFeatureFlagInfo = (): FeatureFlagConfig => {
  return featureFlagService.getFeatureFlagInfo();
};

// 개발용 헬퍼 함수
export const enableReducedStagesForDev = (): void => {
  featureFlagService.setDevOverride(StageMigrationPhase.FULL);
};

export const disableReducedStagesForDev = (): void => {
  featureFlagService.setDevOverride(StageMigrationPhase.DISABLED);
};

export const clearDevOverride = (): void => {
  featureFlagService.setDevOverride(null);
};