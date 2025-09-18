/**
 * 백엔드용 스테이지 축소 마이그레이션 유틸리티
 * 프론트엔드와 동일한 로직으로 일관성 유지
 */

export interface StageMigrationConfig {
  regionId: number;
  oldStageCount: number;
  newStageCount: number;
  selectedStages: number[];
  stageMapping: Record<number, number>;
  reason: string;
}

// 프론트엔드와 동일한 매핑 설정
export const STAGE_MIGRATION_CONFIG: StageMigrationConfig[] = [
  {
    regionId: 2, // 피카츄의 풀숲 (5개 → 3개)
    oldStageCount: 5,
    newStageCount: 3,
    selectedStages: [1, 3, 5],
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 3, 5: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  },
  {
    regionId: 3, // 꼬부기의 연못 (6개 → 3개)
    oldStageCount: 6,
    newStageCount: 3,
    selectedStages: [1, 3, 6],
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  },
  {
    regionId: 4, // 이상해씨의 정원 (7개 → 3개)
    oldStageCount: 7,
    newStageCount: 3,
    selectedStages: [1, 4, 7],
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  },
  {
    regionId: 6, // 뮤츠의 동굴 (8개 → 3개)
    oldStageCount: 8,
    newStageCount: 3,
    selectedStages: [1, 4, 8],
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  },
  {
    regionId: 7, // 파이리의 화산 (9개 → 3개)
    oldStageCount: 9,
    newStageCount: 3,
    selectedStages: [1, 5, 9],
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 3, 9: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  },
  {
    regionId: 8, // 갸라도스의 폭포 (8개 → 3개)
    oldStageCount: 8,
    newStageCount: 3,
    selectedStages: [1, 4, 8],
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  }
];

export class StageMigrationUtils {
  /**
   * 해당 지역이 스테이지 축소 대상인지 확인
   */
  static isRegionAffected(regionId: number): boolean {
    return STAGE_MIGRATION_CONFIG.some(config => config.regionId === regionId);
  }

  /**
   * 특정 지역의 스테이지 축소 설정 가져오기
   */
  static getReducedStageConfig(regionId: number): StageMigrationConfig | null {
    return STAGE_MIGRATION_CONFIG.find(config => config.regionId === regionId) || null;
  }

  /**
   * 기존 스테이지 번호를 새로운 스테이지 번호로 매핑
   */
  static mapOldStageToNew(regionId: number, oldStageNumber: number): number {
    const config = this.getReducedStageConfig(regionId);
    if (!config) {
      return oldStageNumber;
    }
    
    return config.stageMapping[oldStageNumber] || 1;
  }

  /**
   * 새로운 스테이지 구조에서의 총 스테이지 수 반환
   */
  static getNewStageCount(regionId: number): number {
    const config = this.getReducedStageConfig(regionId);
    if (!config) {
      // 축소 대상이 아닌 지역들의 원래 스테이지 수
      const originalCounts: Record<number, number> = {
        2: 5,  // 피카츄의 풀숲 (유지)
        5: 5,  // 루카리오의 바다 (유지)
        9: 10  // 뮤의 신전 (최종 지역, 유지)
      };
      return originalCounts[regionId] || 5;
    }
    
    return config.newStageCount;
  }

  /**
   * 사용자 진행률 마이그레이션 (백엔드용)
   */
  static migrateUserProgress(completedTables: number[]): {
    convertedProgress: Record<number, boolean>;
    migrationSummary: {
      totalRegions: number;
      affectedRegions: number;
      preservedRegions: number;
    };
  } {
    const convertedProgress: Record<number, boolean> = {};
    let affectedRegions = 0;

    completedTables.forEach(regionId => {
      convertedProgress[regionId] = true;
      
      if (this.isRegionAffected(regionId)) {
        affectedRegions++;
      }
    });

    return {
      convertedProgress,
      migrationSummary: {
        totalRegions: completedTables.length,
        affectedRegions,
        preservedRegions: completedTables.length - affectedRegions
      }
    };
  }

  /**
   * Feature Flag 환경변수 확인
   */
  static shouldUseReducedStages(): boolean {
    const phase = process.env.STAGE_REDUCTION_PHASE || 'disabled';
    return phase !== 'disabled';
  }

  /**
   * API 응답용 스테이지 정보 생성
   */
  static generateStageInfo(regionId: number, useReducedStages: boolean = false): {
    stageCount: number;
    isReduced: boolean;
    originalCount?: number;
    reductionPercentage?: number;
  } {
    if (!useReducedStages || !this.isRegionAffected(regionId)) {
      return {
        stageCount: this.getOriginalStageCount(regionId),
        isReduced: false
      };
    }

    const config = this.getReducedStageConfig(regionId)!;
    const reductionPercentage = Math.round(((config.oldStageCount - config.newStageCount) / config.oldStageCount) * 100);

    return {
      stageCount: config.newStageCount,
      isReduced: true,
      originalCount: config.oldStageCount,
      reductionPercentage
    };
  }

  /**
   * 원래 스테이지 수 반환
   */
  private static getOriginalStageCount(regionId: number): number {
    const originalCounts: Record<number, number> = {
      2: 5,  // 피카츄의 풀숲
      3: 6,  // 꼬부기의 연못
      4: 7,  // 이상해씨의 정원
      5: 5,  // 루카리오의 바다
      6: 8,  // 뮤츠의 동굴
      7: 9,  // 파이리의 화산
      8: 8,  // 갸라도스의 폭포
      9: 10  // 뮤의 신전
    };
    return originalCounts[regionId] || 5;
  }
}