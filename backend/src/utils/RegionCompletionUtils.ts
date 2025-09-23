import { StageProgress } from '../../../shared/types';

/**
 * 지역 완료 상태 계산 유틸리티
 * Phase 2: 실제 스테이지 완료 기반 지역 해금 시스템
 */
export class RegionCompletionUtils {
  /**
   * 지역이 완료되었는지 확인
   * @param regionId 지역 ID (2-9)
   * @param stageProgressData 사용자의 스테이지 진행도 데이터
   * @returns 지역 완료 여부
   */
  static isRegionCompleted(regionId: number, stageProgressData: StageProgress[]): boolean {
    const regionStages = stageProgressData.filter(stage => stage.regionId === regionId);
    
    if (regionStages.length === 0) {
      return false;
    }

    // 해당 지역의 모든 스테이지가 완료되었는지 확인
    return regionStages.every(stage => stage.isCompleted);
  }

  /**
   * 지역이 해금되었는지 확인
   * @param regionId 지역 ID (2-9)
   * @param stageProgressData 사용자의 스테이지 진행도 데이터
   * @returns 지역 해금 여부
   */
  static isRegionUnlocked(regionId: number, stageProgressData: StageProgress[]): boolean {
    // Region 2 (피카츄의 풀숲)는 항상 해금
    if (regionId === 2) {
      return true;
    }

    // Region 3 (꼬부기의 연못)는 Region 2 완료 후 해금
    if (regionId === 3) {
      return this.isRegionCompleted(2, stageProgressData);
    }

    // 나머지 지역들은 이전 지역 완료 후 해금
    return this.isRegionCompleted(regionId - 1, stageProgressData);
  }

  /**
   * 완료된 지역 목록 반환
   * @param stageProgressData 사용자의 스테이지 진행도 데이터
   * @returns 완료된 지역 ID 배열
   */
  static getCompletedRegions(stageProgressData: StageProgress[]): number[] {
    const completedRegions: number[] = [];
    
    for (let regionId = 2; regionId <= 9; regionId++) {
      if (this.isRegionCompleted(regionId, stageProgressData)) {
        completedRegions.push(regionId);
      }
    }

    return completedRegions;
  }

  /**
   * 해금된 지역 목록 반환
   * @param stageProgressData 사용자의 스테이지 진행도 데이터
   * @returns 해금된 지역 ID 배열
   */
  static getUnlockedRegions(stageProgressData: StageProgress[]): number[] {
    const unlockedRegions: number[] = [];
    
    for (let regionId = 2; regionId <= 9; regionId++) {
      if (this.isRegionUnlocked(regionId, stageProgressData)) {
        unlockedRegions.push(regionId);
      }
    }

    return unlockedRegions;
  }

  /**
   * 지역의 완료율 계산
   * @param regionId 지역 ID
   * @param stageProgressData 사용자의 스테이지 진행도 데이터
   * @returns 완료율 (0-100)
   */
  static getRegionCompletionRate(regionId: number, stageProgressData: StageProgress[]): number {
    const regionStages = stageProgressData.filter(stage => stage.regionId === regionId);
    
    if (regionStages.length === 0) {
      return 0;
    }

    const completedStages = regionStages.filter(stage => stage.isCompleted).length;
    return Math.round((completedStages / regionStages.length) * 100);
  }

  /**
   * 전체 게임 진행률 계산
   * @param stageProgressData 사용자의 스테이지 진행도 데이터
   * @returns 전체 진행률 (0-100)
   */
  static getOverallProgress(stageProgressData: StageProgress[]): {
    completedStages: number;
    totalStages: number;
    progressPercentage: number;
    completedRegions: number;
    totalRegions: number;
  } {
    const totalStages = stageProgressData.length;
    const completedStages = stageProgressData.filter(stage => stage.isCompleted).length;
    const completedRegions = this.getCompletedRegions(stageProgressData).length;
    
    return {
      completedStages,
      totalStages,
      progressPercentage: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0,
      completedRegions,
      totalRegions: 8 // Region 2-9
    };
  }

  /**
   * 다음 해금 가능한 지역 반환
   * @param stageProgressData 사용자의 스테이지 진행도 데이터
   * @returns 다음 해금 가능한 지역 ID (없으면 null)
   */
  static getNextUnlockableRegion(stageProgressData: StageProgress[]): number | null {
    for (let regionId = 2; regionId <= 9; regionId++) {
      if (!this.isRegionUnlocked(regionId, stageProgressData)) {
        return regionId;
      }
    }
    return null; // 모든 지역이 해금됨
  }
}