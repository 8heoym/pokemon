import { Request, Response } from 'express';
import { StageProgressService } from '../services/StageProgressService';
import { StageProgressUpdate } from '../../../shared/types';
import { RegionCompletionUtils } from '../utils/RegionCompletionUtils';

export class StageProgressController {
  private stageProgressService: StageProgressService;

  constructor() {
    this.stageProgressService = new StageProgressService();
  }

  /**
   * GET /api/users/:userId/stage-progress
   * 사용자의 모든 스테이지 진행도 조회
   */
  async getUserStageProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const stageProgress = await this.stageProgressService.getUserStageProgress(userId);
      
      res.json({
        success: true,
        data: stageProgress,
        message: 'Stage progress retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting user stage progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get stage progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/users/:userId/stage-progress/region/:regionId
   * 특정 지역의 스테이지 진행도 조회
   */
  async getRegionStageProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId, regionId } = req.params;

      if (!userId || !regionId) {
        res.status(400).json({ error: 'User ID and Region ID are required' });
        return;
      }

      const regionIdNum = parseInt(regionId);
      if (isNaN(regionIdNum) || regionIdNum < 2 || regionIdNum > 9) {
        res.status(400).json({ error: 'Invalid region ID. Must be between 2 and 9.' });
        return;
      }

      const stageProgress = await this.stageProgressService.getRegionStageProgress(userId, regionIdNum);
      
      res.json({
        success: true,
        data: stageProgress,
        message: `Region ${regionIdNum} stage progress retrieved successfully`
      });
    } catch (error) {
      console.error('Error getting region stage progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get region stage progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/users/:userId/stage-progress/update
   * 스테이지 진행도 업데이트
   */
  async updateStageProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { regionId, stageNumber, completedProblems }: StageProgressUpdate = req.body;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // 입력 값 검증
      if (!regionId || !stageNumber || completedProblems === undefined) {
        res.status(400).json({ 
          error: 'regionId, stageNumber, and completedProblems are required' 
        });
        return;
      }

      if (regionId < 2 || regionId > 9) {
        res.status(400).json({ error: 'Invalid region ID. Must be between 2 and 9.' });
        return;
      }

      if (stageNumber < 1) {
        res.status(400).json({ error: 'Invalid stage number. Must be at least 1.' });
        return;
      }

      if (completedProblems < 0 || completedProblems > 5) {
        res.status(400).json({ error: 'Invalid completed problems. Must be between 0 and 5.' });
        return;
      }

      const updateData: StageProgressUpdate = {
        userId,
        regionId,
        stageNumber,
        completedProblems
      };

      const updatedProgress = await this.stageProgressService.updateStageProgress(updateData);
      
      res.json({
        success: true,
        data: updatedProgress,
        message: 'Stage progress updated successfully'
      });
    } catch (error) {
      console.error('Error updating stage progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update stage progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/users/:userId/stage-progress/initialize
   * 신규 사용자의 스테이지 진행도 초기화
   */
  async initializeStageProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      await this.stageProgressService.initializeUserStageProgress(userId);
      
      res.json({
        success: true,
        message: 'Stage progress initialized successfully'
      });
    } catch (error) {
      console.error('Error initializing stage progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize stage progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/users/:userId/completed-regions
   * 완료된 지역 목록 조회
   */
  async getCompletedRegions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const completedRegions = await this.stageProgressService.getCompletedRegions(userId);
      
      res.json({
        success: true,
        data: completedRegions,
        message: 'Completed regions retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting completed regions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get completed regions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/users/:userId/stage-progress/region/:regionId/completion
   * 특정 지역 완료 여부 확인
   */
  async checkRegionCompletion(req: Request, res: Response): Promise<void> {
    try {
      const { userId, regionId } = req.params;

      if (!userId || !regionId) {
        res.status(400).json({ error: 'User ID and Region ID are required' });
        return;
      }

      const regionIdNum = parseInt(regionId);
      if (isNaN(regionIdNum) || regionIdNum < 2 || regionIdNum > 9) {
        res.status(400).json({ error: 'Invalid region ID. Must be between 2 and 9.' });
        return;
      }

      const isCompleted = await this.stageProgressService.isRegionCompleted(userId, regionIdNum);
      
      res.json({
        success: true,
        data: { 
          regionId: regionIdNum, 
          isCompleted 
        },
        message: `Region ${regionIdNum} completion status retrieved successfully`
      });
    } catch (error) {
      console.error('Error checking region completion:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check region completion',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/users/:userId/region-status
   * Phase 2: 스테이지 기반 지역 상태 조회 (완료/해금 상태)
   */
  async getRegionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // 사용자의 모든 스테이지 진행도 가져오기
      const stageProgressData = await this.stageProgressService.getUserStageProgress(userId);
      
      // 스테이지 진행도가 없어도 기본 상태를 반환하도록 수정
      const progressData = stageProgressData || [];

      // 지역별 상태 계산
      const regionStatuses = [];
      for (let regionId = 2; regionId <= 9; regionId++) {
        const isUnlocked = RegionCompletionUtils.isRegionUnlocked(regionId, progressData);
        const isCompleted = RegionCompletionUtils.isRegionCompleted(regionId, progressData);
        const completionRate = RegionCompletionUtils.getRegionCompletionRate(regionId, progressData);
        
        regionStatuses.push({
          regionId,
          isUnlocked,
          isCompleted,
          completionRate
        });
      }

      // 전체 진행 상태
      const overallProgress = RegionCompletionUtils.getOverallProgress(progressData);
      const completedRegions = RegionCompletionUtils.getCompletedRegions(progressData);
      const unlockedRegions = RegionCompletionUtils.getUnlockedRegions(progressData);
      const nextUnlockableRegion = RegionCompletionUtils.getNextUnlockableRegion(progressData);

      res.json({
        success: true,
        data: {
          regionStatuses,
          overallProgress,
          completedRegions,
          unlockedRegions,
          nextUnlockableRegion
        },
        message: 'Region status retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting region status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get region status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/users/:userId/game-progress
   * Phase 2: 전체 게임 진행 상태 조회 (배지 시스템용)
   */
  async getGameProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // 사용자의 모든 스테이지 진행도 가져오기
      const stageProgressData = await this.stageProgressService.getUserStageProgress(userId);
      
      if (!stageProgressData || stageProgressData.length === 0) {
        res.status(404).json({
          success: false,
          error: 'No stage progress found for user'
        });
        return;
      }

      // 새로운 배지 시스템을 위한 데이터 계산
      const overallProgress = RegionCompletionUtils.getOverallProgress(stageProgressData);
      const completedRegions = RegionCompletionUtils.getCompletedRegions(stageProgressData);
      
      // 실제 스테이지 완료 기반 "completedTables" 계산
      // Phase 2에서는 지역 완료시 해당 구구단을 완료한 것으로 간주
      const stageBasedCompletedTables = completedRegions;

      res.json({
        success: true,
        data: {
          // 기존 시스템과 호환성을 위한 필드들
          completedTables: stageBasedCompletedTables,
          totalBadges: completedRegions.length,
          
          // 새로운 시스템 필드들
          overallProgress,
          completedRegions,
          stageProgressSummary: {
            totalStages: overallProgress.totalStages,
            completedStages: overallProgress.completedStages,
            progressPercentage: overallProgress.progressPercentage
          }
        },
        message: 'Game progress retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting game progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get game progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}