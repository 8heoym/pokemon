/**
 * 스테이지 마이그레이션 유틸리티 테스트
 * PRD 요구사항 검증
 */

import { StageMigrationUtils, STAGE_MIGRATION_CONFIG } from '../stageMigration';

describe('StageMigrationUtils', () => {
  
  describe('isRegionAffected', () => {
    test('축소 대상 지역들이 올바르게 식별되는가', () => {
      // 축소 대상 지역들 (PRD 기준)
      expect(StageMigrationUtils.isRegionAffected(3)).toBe(true);  // 꼬부기의 연못
      expect(StageMigrationUtils.isRegionAffected(4)).toBe(true);  // 이상해씨의 정원
      expect(StageMigrationUtils.isRegionAffected(6)).toBe(true);  // 뮤츠의 동굴
      expect(StageMigrationUtils.isRegionAffected(7)).toBe(true);  // 파이리의 화산
      expect(StageMigrationUtils.isRegionAffected(8)).toBe(true);  // 갸라도스의 폭포
    });

    test('축소 대상이 아닌 지역들이 올바르게 식별되는가', () => {
      // 유지되는 지역들 (PRD 기준)
      expect(StageMigrationUtils.isRegionAffected(2)).toBe(false); // 피카츄의 풀숲 (5개, 유지)
      expect(StageMigrationUtils.isRegionAffected(5)).toBe(false); // 루카리오의 바다 (5개, 유지)
      expect(StageMigrationUtils.isRegionAffected(9)).toBe(false); // 뮤의 신전 (10개, 최종지역 유지)
    });
  });

  describe('getNewStageCount', () => {
    test('축소 대상 지역들의 새로운 스테이지 수가 3개인가', () => {
      expect(StageMigrationUtils.getNewStageCount(3)).toBe(3);
      expect(StageMigrationUtils.getNewStageCount(4)).toBe(3);
      expect(StageMigrationUtils.getNewStageCount(6)).toBe(3);
      expect(StageMigrationUtils.getNewStageCount(7)).toBe(3);
      expect(StageMigrationUtils.getNewStageCount(8)).toBe(3);
    });

    test('유지되는 지역들의 스테이지 수가 올바른가', () => {
      expect(StageMigrationUtils.getNewStageCount(2)).toBe(5);  // 피카츄의 풀숲
      expect(StageMigrationUtils.getNewStageCount(5)).toBe(5);  // 루카리오의 바다
      expect(StageMigrationUtils.getNewStageCount(9)).toBe(10); // 뮤의 신전
    });
  });

  describe('mapOldStageToNew', () => {
    test('꼬부기의 연못(6→3) 매핑이 올바른가', () => {
      // PRD 기준: 1,3,6번째 스테이지 선별
      expect(StageMigrationUtils.mapOldStageToNew(3, 1)).toBe(1); // 1→1
      expect(StageMigrationUtils.mapOldStageToNew(3, 2)).toBe(1); // 2→1
      expect(StageMigrationUtils.mapOldStageToNew(3, 3)).toBe(2); // 3→2
      expect(StageMigrationUtils.mapOldStageToNew(3, 4)).toBe(2); // 4→2
      expect(StageMigrationUtils.mapOldStageToNew(3, 5)).toBe(3); // 5→3
      expect(StageMigrationUtils.mapOldStageToNew(3, 6)).toBe(3); // 6→3
    });

    test('이상해씨의 정원(7→3) 매핑이 올바른가', () => {
      // PRD 기준: 1,4,7번째 스테이지 선별
      expect(StageMigrationUtils.mapOldStageToNew(4, 1)).toBe(1); // 1→1
      expect(StageMigrationUtils.mapOldStageToNew(4, 2)).toBe(1); // 2→1
      expect(StageMigrationUtils.mapOldStageToNew(4, 3)).toBe(2); // 3→2
      expect(StageMigrationUtils.mapOldStageToNew(4, 4)).toBe(2); // 4→2
      expect(StageMigrationUtils.mapOldStageToNew(4, 5)).toBe(2); // 5→2
      expect(StageMigrationUtils.mapOldStageToNew(4, 6)).toBe(3); // 6→3
      expect(StageMigrationUtils.mapOldStageToNew(4, 7)).toBe(3); // 7→3
    });

    test('축소 대상이 아닌 지역의 스테이지는 그대로 유지되는가', () => {
      expect(StageMigrationUtils.mapOldStageToNew(2, 1)).toBe(1);
      expect(StageMigrationUtils.mapOldStageToNew(2, 3)).toBe(3);
      expect(StageMigrationUtils.mapOldStageToNew(5, 2)).toBe(2);
    });
  });

  describe('migrateUserProgress', () => {
    test('완료된 구구단이 올바르게 보존되는가', () => {
      const completedTables = [2, 3, 4, 5];
      const { convertedProgress, migrationLog } = StageMigrationUtils.migrateUserProgress(completedTables);
      
      // 모든 완료된 구구단이 보존되어야 함
      expect(convertedProgress[2]).toBe(true);
      expect(convertedProgress[3]).toBe(true);
      expect(convertedProgress[4]).toBe(true);
      expect(convertedProgress[5]).toBe(true);
      
      // 로그가 생성되어야 함
      expect(migrationLog.length).toBeGreaterThan(0);
    });

    test('빈 진행률도 안전하게 처리되는가', () => {
      const { convertedProgress, migrationLog } = StageMigrationUtils.migrateUserProgress([]);
      
      expect(Object.keys(convertedProgress)).toHaveLength(0);
      expect(migrationLog).toHaveLength(0);
    });
  });

  describe('calculateTimeReduction', () => {
    test('시간 단축 계산이 정확한가', () => {
      const reduction = StageMigrationUtils.calculateTimeReduction(3); // 6→3개
      
      expect(reduction.originalTime).toBe(48); // 6 * 8분
      expect(reduction.reducedTime).toBe(24);  // 3 * 8분
      expect(reduction.reductionPercentage).toBe(50); // 50% 단축
    });

    test('축소 대상이 아닌 지역은 시간 단축이 없는가', () => {
      const reduction = StageMigrationUtils.calculateTimeReduction(2);
      
      expect(reduction.originalTime).toBe(0);
      expect(reduction.reducedTime).toBe(0);
      expect(reduction.reductionPercentage).toBe(0);
    });
  });

  describe('getMigrationStats', () => {
    test('전체 마이그레이션 통계가 올바른가', () => {
      const stats = StageMigrationUtils.getMigrationStats();
      
      expect(stats.totalAffectedRegions).toBe(5); // 3,4,6,7,8 지역
      expect(stats.totalStageReduction).toBeGreaterThan(0);
      expect(stats.avgReductionPercentage).toBeGreaterThan(0);
      expect(stats.avgReductionPercentage).toBeLessThan(100);
    });
  });

  describe('Configuration Validation', () => {
    test('모든 축소 대상 지역의 설정이 올바른가', () => {
      STAGE_MIGRATION_CONFIG.forEach(config => {
        // 새로운 스테이지 수는 반드시 3개
        expect(config.newStageCount).toBe(3);
        
        // 기존 스테이지 수가 5개 초과여야 함 (PRD 기준)
        expect(config.oldStageCount).toBeGreaterThan(5);
        
        // 선별된 스테이지 수가 3개여야 함
        expect(config.selectedStages).toHaveLength(3);
        
        // 첫 번째 스테이지는 반드시 1번이어야 함
        expect(config.selectedStages[0]).toBe(1);
        
        // 마지막 스테이지는 기존 마지막 스테이지여야 함
        expect(config.selectedStages[2]).toBe(config.oldStageCount);
        
        // 매핑이 모든 기존 스테이지를 포함해야 함
        const mappingKeys = Object.keys(config.stageMapping).map(Number).sort((a,b) => a-b);
        const expectedKeys = Array.from({length: config.oldStageCount}, (_, i) => i + 1);
        expect(mappingKeys).toEqual(expectedKeys);
      });
    });
  });
});