import { Request, Response } from 'express';
import { StageMigrationUtils } from '../utils/stageMigration';

/**
 * 스테이지 축소 기능 관련 API 컨트롤러
 * PRD 요구사항에 따른 마이그레이션 정보 제공
 */
export class StageMigrationController {

  /**
   * Feature Flag 상태 및 스테이지 설정 정보 반환
   * GET /api/stages/config
   */
  getStageConfig = async (req: Request, res: Response) => {
    try {
      const useReducedStages = StageMigrationUtils.shouldUseReducedStages();
      const phase = process.env.STAGE_REDUCTION_PHASE || 'disabled';
      
      // 모든 지역의 스테이지 정보 생성
      const regionConfigs = [2, 3, 4, 5, 6, 7, 8, 9].map(regionId => ({
        regionId,
        ...StageMigrationUtils.generateStageInfo(regionId, useReducedStages)
      }));

      res.json({
        success: true,
        data: {
          featureEnabled: useReducedStages,
          currentPhase: phase,
          regions: regionConfigs,
          summary: {
            totalRegions: regionConfigs.length,
            reducedRegions: regionConfigs.filter(r => r.isReduced).length,
            originalRegions: regionConfigs.filter(r => !r.isReduced).length
          }
        }
      });

    } catch (error: any) {
      console.error('스테이지 설정 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '스테이지 설정 정보를 불러오는데 실패했습니다.',
        error: error.message
      });
    }
  };

  /**
   * 특정 지역의 상세 스테이지 정보 반환
   * GET /api/stages/region/:regionId
   */
  getRegionStageInfo = async (req: Request, res: Response) => {
    try {
      const regionId = parseInt(req.params.regionId);
      
      if (isNaN(regionId) || regionId < 2 || regionId > 9) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 지역 ID입니다. (2-9 사이의 숫자여야 합니다)'
        });
      }

      const useReducedStages = StageMigrationUtils.shouldUseReducedStages();
      const stageInfo = StageMigrationUtils.generateStageInfo(regionId, useReducedStages);
      const config = StageMigrationUtils.getReducedStageConfig(regionId);

      const result = {
        regionId,
        ...stageInfo,
        migrationDetails: config ? {
          selectedStages: config.selectedStages,
          stageMapping: config.stageMapping,
          reason: config.reason
        } : null
      };

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('지역 스테이지 정보 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '지역 스테이지 정보를 불러오는데 실패했습니다.',
        error: error.message
      });
    }
  };

  /**
   * 사용자 진행률 마이그레이션 시뮬레이션
   * POST /api/stages/migrate-simulation
   */
  simulateUserMigration = async (req: Request, res: Response) => {
    try {
      const { completedTables } = req.body;

      if (!Array.isArray(completedTables)) {
        return res.status(400).json({
          success: false,
          message: 'completedTables는 배열이어야 합니다.'
        });
      }

      // 마이그레이션 시뮬레이션 수행
      const { convertedProgress, migrationSummary } = StageMigrationUtils.migrateUserProgress(completedTables);

      // 각 지역별 세부 정보
      const regionDetails = completedTables.map(regionId => {
        const isAffected = StageMigrationUtils.isRegionAffected(regionId);
        const config = StageMigrationUtils.getReducedStageConfig(regionId);
        
        return {
          regionId,
          isCompleted: true,
          wasAffected: isAffected,
          newStageCount: StageMigrationUtils.getNewStageCount(regionId),
          originalStageCount: config?.oldStageCount || StageMigrationUtils.getNewStageCount(regionId),
          preserved: true // 완료된 지역은 항상 보존됨
        };
      });

      res.json({
        success: true,
        data: {
          originalProgress: completedTables,
          convertedProgress,
          migrationSummary,
          regionDetails,
          message: '모든 진행사항이 안전하게 보존됩니다.'
        }
      });

    } catch (error: any) {
      console.error('마이그레이션 시뮬레이션 실패:', error);
      res.status(500).json({
        success: false,
        message: '마이그레이션 시뮬레이션에 실패했습니다.',
        error: error.message
      });
    }
  };

  /**
   * 스테이지 축소 통계 정보
   * GET /api/stages/stats
   */
  getMigrationStats = async (req: Request, res: Response) => {
    try {
      const useReducedStages = StageMigrationUtils.shouldUseReducedStages();
      
      if (!useReducedStages) {
        return res.json({
          success: true,
          data: {
            enabled: false,
            message: '스테이지 축소 기능이 비활성화되어 있습니다.'
          }
        });
      }

      // 각 축소 대상 지역의 상세 통계
      const regionStats = [3, 4, 6, 7, 8].map(regionId => {
        const config = StageMigrationUtils.getReducedStageConfig(regionId)!;
        const reductionPercentage = Math.round(((config.oldStageCount - config.newStageCount) / config.oldStageCount) * 100);
        const timeReduction = this.calculateTimeReduction(config.oldStageCount, config.newStageCount);

        return {
          regionId,
          oldStageCount: config.oldStageCount,
          newStageCount: config.newStageCount,
          stageReduction: config.oldStageCount - config.newStageCount,
          reductionPercentage,
          selectedStages: config.selectedStages,
          estimatedTimeReduction: timeReduction
        };
      });

      const totalOldStages = regionStats.reduce((sum, stat) => sum + stat.oldStageCount, 0);
      const totalNewStages = regionStats.reduce((sum, stat) => sum + stat.newStageCount, 0);
      const totalReduction = totalOldStages - totalNewStages;
      const avgReductionPercentage = Math.round((totalReduction / totalOldStages) * 100);

      res.json({
        success: true,
        data: {
          enabled: true,
          summary: {
            affectedRegions: regionStats.length,
            totalOldStages,
            totalNewStages,
            totalReduction,
            avgReductionPercentage
          },
          regionStats,
          benefits: {
            expectedCompletionRateIncrease: '20-30%',
            expectedPlaytimeReduction: '40-60%',
            expectedUserSatisfactionImprovement: 'High'
          }
        }
      });

    } catch (error: any) {
      console.error('마이그레이션 통계 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '통계 정보를 불러오는데 실패했습니다.',
        error: error.message
      });
    }
  };

  /**
   * 시간 단축 계산 헬퍼
   */
  private calculateTimeReduction(oldStageCount: number, newStageCount: number): {
    originalMinutes: number;
    reducedMinutes: number;
    reductionMinutes: number;
    reductionPercentage: number;
  } {
    const avgMinutesPerStage = 8;
    const originalMinutes = oldStageCount * avgMinutesPerStage;
    const reducedMinutes = newStageCount * avgMinutesPerStage;
    const reductionMinutes = originalMinutes - reducedMinutes;
    const reductionPercentage = Math.round((reductionMinutes / originalMinutes) * 100);

    return {
      originalMinutes,
      reducedMinutes,
      reductionMinutes,
      reductionPercentage
    };
  }
}