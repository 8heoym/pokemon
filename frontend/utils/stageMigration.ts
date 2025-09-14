/**
 * 스테이지 축소 마이그레이션 유틸리티
 * PRD F-1.3 스테이지 선별 기준: 첫 번째, 중간, 마지막 스테이지를 대표 스테이지로 선별
 */

export interface StageMigrationConfig {
  regionId: number;
  oldStageCount: number;
  newStageCount: number;
  selectedStages: number[];        // 유지할 스테이지 번호 (기존 번호 기준)
  stageMapping: Record<number, number>; // 기존 스테이지 → 새 스테이지 매핑
  reason: string; // 변경 이유 (로깅용)
}

// PRD 요구사항에 따른 스테이지 매핑 설정
export const STAGE_MIGRATION_CONFIG: StageMigrationConfig[] = [
  {
    regionId: 3, // 꼬부기의 연못 (6개 → 3개)
    oldStageCount: 6,
    newStageCount: 3,
    selectedStages: [1, 3, 6], // 첫째, 중간(6/2=3), 마지막
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  },
  {
    regionId: 4, // 이상해씨의 정원 (7개 → 3개)
    oldStageCount: 7,
    newStageCount: 3,
    selectedStages: [1, 4, 7], // 첫째, 중간(7/2≈4), 마지막
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  },
  {
    regionId: 6, // 뮤츠의 동굴 (8개 → 3개)
    oldStageCount: 8,
    newStageCount: 3,
    selectedStages: [1, 4, 8], // 첫째, 중간(8/2=4), 마지막
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  },
  {
    regionId: 7, // 파이리의 화산 (9개 → 3개)
    oldStageCount: 9,
    newStageCount: 3,
    selectedStages: [1, 5, 9], // 첫째, 중간(9/2≈5), 마지막
    stageMapping: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 3, 9: 3 },
    reason: "사용자 피로도 감소를 위한 핵심 스테이지 선별"
  },
  {
    regionId: 8, // 갸라도스의 폭포 (8개 → 3개)
    oldStageCount: 8,
    newStageCount: 3,
    selectedStages: [1, 4, 8], // 첫째, 중간(8/2=4), 마지막
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
      return oldStageNumber; // 축소 대상이 아닌 경우 그대로 반환
    }
    
    return config.stageMapping[oldStageNumber] || 1; // 매핑 실패시 기본값 1
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
   * 기존 사용자 진행률을 새로운 구조로 변환
   * PRD F-1.2: 기존 사용자 호환성 보장
   */
  static migrateUserProgress(completedTables: number[]): {
    convertedProgress: Record<number, boolean>;
    migrationLog: string[];
  } {
    const convertedProgress: Record<number, boolean> = {};
    const migrationLog: string[] = [];

    completedTables.forEach(regionId => {
      if (this.isRegionAffected(regionId)) {
        // 축소 대상 지역: 완료된 경우 새로운 구조에서도 완료로 처리
        convertedProgress[regionId] = true;
        migrationLog.push(`지역 ${regionId}: 완료된 구구단 → 새로운 3단계 구조에서도 완료 처리`);
      } else {
        // 축소 대상이 아닌 지역: 그대로 유지
        convertedProgress[regionId] = true;
        migrationLog.push(`지역 ${regionId}: 기존 구조 유지`);
      }
    });

    return { convertedProgress, migrationLog };
  }

  /**
   * 스테이지 축소로 인한 예상 완주 시간 단축 계산
   * PRD 목표: 지역당 평균 40-60% 플레이타임 단축
   */
  static calculateTimeReduction(regionId: number): {
    originalTime: number;
    reducedTime: number;
    reductionPercentage: number;
  } {
    const config = this.getReducedStageConfig(regionId);
    if (!config) {
      return { originalTime: 0, reducedTime: 0, reductionPercentage: 0 };
    }

    const avgMinutesPerStage = 8; // 스테이지당 평균 8분 소요
    const originalTime = config.oldStageCount * avgMinutesPerStage;
    const reducedTime = config.newStageCount * avgMinutesPerStage;
    const reductionPercentage = Math.round(((originalTime - reducedTime) / originalTime) * 100);

    return { originalTime, reducedTime, reductionPercentage };
  }

  /**
   * 마이그레이션 통계 정보
   */
  static getMigrationStats(): {
    totalAffectedRegions: number;
    totalStageReduction: number;
    avgReductionPercentage: number;
  } {
    const totalAffectedRegions = STAGE_MIGRATION_CONFIG.length;
    const totalOldStages = STAGE_MIGRATION_CONFIG.reduce((sum, config) => sum + config.oldStageCount, 0);
    const totalNewStages = STAGE_MIGRATION_CONFIG.reduce((sum, config) => sum + config.newStageCount, 0);
    const totalStageReduction = totalOldStages - totalNewStages;
    const avgReductionPercentage = Math.round((totalStageReduction / totalOldStages) * 100);

    return {
      totalAffectedRegions,
      totalStageReduction,
      avgReductionPercentage
    };
  }
}