import { supabase } from '../config/supabase';
import { StageProgress, StageProgressUpdate } from '../../../shared/types';
import { StageMigrationUtils } from '../utils/stageMigration';

export class StageProgressService {
  /**
   * 사용자의 모든 스테이지 진행도 조회
   */
  async getUserStageProgress(userId: string): Promise<StageProgress[]> {
    const { data, error } = await supabase
      .from('stage_progress')
      .select('*')
      .eq('user_id', userId)
      .order('region_id, stage_number');

    if (error) {
      throw new Error(`Failed to get stage progress: ${error.message}`);
    }

    return this.mapToStageProgress(data || []);
  }

  /**
   * 특정 지역의 스테이지 진행도 조회
   */
  async getRegionStageProgress(userId: string, regionId: number): Promise<StageProgress[]> {
    const { data, error } = await supabase
      .from('stage_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('region_id', regionId)
      .order('stage_number');

    if (error) {
      throw new Error(`Failed to get region stage progress: ${error.message}`);
    }

    return this.mapToStageProgress(data || []);
  }

  /**
   * 스테이지 진행도 업데이트 (문제 정답시 호출)
   */
  async updateStageProgress(update: StageProgressUpdate): Promise<StageProgress> {
    const { userId, regionId, stageNumber, completedProblems } = update;

    // 먼저 현재 진행도 확인
    const { data: existing } = await supabase
      .from('stage_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('region_id', regionId)
      .eq('stage_number', stageNumber)
      .single();

    let result;

    if (existing) {
      // 기존 레코드 업데이트
      const { data, error } = await supabase
        .from('stage_progress')
        .update({
          completed_problems: Math.max(existing.completed_problems, completedProblems),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('region_id', regionId)
        .eq('stage_number', stageNumber)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update stage progress: ${error.message}`);
      }
      result = data;
    } else {
      // 새 레코드 생성
      const { data, error } = await supabase
        .from('stage_progress')
        .insert({
          user_id: userId,
          region_id: regionId,
          stage_number: stageNumber,
          completed_problems: completedProblems,
          total_problems: 5
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create stage progress: ${error.message}`);
      }
      result = data;
    }

    const updatedProgress = this.mapToStageProgress([result])[0];

    // 스테이지 완료시 다음 스테이지 자동 생성
    if (updatedProgress.isCompleted) {
      await this.unlockNextStage(userId, regionId, stageNumber);
    }

    return updatedProgress;
  }

  /**
   * 다음 스테이지 자동 해금 (스테이지 완료시 호출)
   */
  private async unlockNextStage(userId: string, regionId: number, completedStageNumber: number): Promise<void> {
    try {
      const nextStageNumber = completedStageNumber + 1;
      const expectedStageCount = StageMigrationUtils.getNewStageCount(regionId);

      // 다음 스테이지가 이 지역의 마지막 스테이지를 초과하는지 확인
      if (nextStageNumber > expectedStageCount) {
        console.log(`Region ${regionId} completed. Unlocking next region...`);
        await this.unlockNextRegion(userId, regionId);
        return;
      }

      // 다음 스테이지가 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('stage_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('region_id', regionId)
        .eq('stage_number', nextStageNumber)
        .single();

      if (!existing) {
        // 다음 스테이지 레코드 생성 (자동 해금)
        const { error } = await supabase
          .from('stage_progress')
          .insert({
            user_id: userId,
            region_id: regionId,
            stage_number: nextStageNumber,
            completed_problems: 0,
            total_problems: 5
          });

        if (error) {
          console.error('Failed to unlock next stage:', error);
        } else {
          console.log(`✅ Stage ${nextStageNumber} in Region ${regionId} unlocked for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error in unlockNextStage:', error);
    }
  }

  /**
   * 다음 지역 자동 해금 (지역 완료시 호출)
   */
  private async unlockNextRegion(userId: string, completedRegionId: number): Promise<void> {
    try {
      const nextRegionId = completedRegionId + 1;

      // 다음 지역이 유효한지 확인 (Region 2-9)
      if (nextRegionId > 9) {
        console.log('All regions completed! 🎉');
        return;
      }

      // 다음 지역의 첫 번째 스테이지가 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('stage_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('region_id', nextRegionId)
        .eq('stage_number', 1)
        .single();

      if (!existing) {
        // 다음 지역의 첫 번째 스테이지 생성 (자동 해금)
        const { error } = await supabase
          .from('stage_progress')
          .insert({
            user_id: userId,
            region_id: nextRegionId,
            stage_number: 1,
            completed_problems: 0,
            total_problems: 5
          });

        if (error) {
          console.error('Failed to unlock next region:', error);
        } else {
          console.log(`✅ Region ${nextRegionId} unlocked for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error in unlockNextRegion:', error);
    }
  }

  /**
   * 사용자의 스테이지 진행도 초기화 (신규 사용자용)
   */
  async initializeUserStageProgress(userId: string): Promise<void> {
    // 스테이지 축소가 적용된 지역들의 스테이지만 생성
    const initData = [];

    for (let regionId = 2; regionId <= 9; regionId++) {
      const stageCount = StageMigrationUtils.getNewStageCount(regionId);
      
      for (let stageNumber = 1; stageNumber <= stageCount; stageNumber++) {
        initData.push({
          user_id: userId,
          region_id: regionId,
          stage_number: stageNumber,
          completed_problems: 0,
          total_problems: 5
        });
      }
    }

    const { error } = await supabase
      .from('stage_progress')
      .insert(initData);

    if (error) {
      throw new Error(`Failed to initialize stage progress: ${error.message}`);
    }
  }

  /**
   * 지역 완료 여부 확인 (모든 스테이지 완료)
   */
  async isRegionCompleted(userId: string, regionId: number): Promise<boolean> {
    const regionProgress = await this.getRegionStageProgress(userId, regionId);
    return regionProgress.length > 0 && regionProgress.every(stage => stage.isCompleted);
  }

  /**
   * 완료된 지역 목록 조회
   */
  async getCompletedRegions(userId: string): Promise<number[]> {
    const allProgress = await this.getUserStageProgress(userId);
    const completedRegions: number[] = [];

    // 지역별로 그룹화하여 모든 스테이지가 완료되었는지 확인
    const groupedByRegion = allProgress.reduce((acc, progress) => {
      if (!acc[progress.regionId]) {
        acc[progress.regionId] = [];
      }
      acc[progress.regionId].push(progress);
      return acc;
    }, {} as Record<number, StageProgress[]>);

    for (const [regionId, stages] of Object.entries(groupedByRegion)) {
      if (stages.every(stage => stage.isCompleted)) {
        completedRegions.push(parseInt(regionId));
      }
    }

    return completedRegions;
  }

  /**
   * 데이터베이스 응답을 StageProgress 타입으로 변환
   */
  private mapToStageProgress(data: any[]): StageProgress[] {
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      regionId: item.region_id,
      stageNumber: item.stage_number,
      completedProblems: item.completed_problems,
      totalProblems: item.total_problems,
      isCompleted: item.is_completed,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  }
}