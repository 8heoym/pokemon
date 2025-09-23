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

    return this.mapToStageProgress([result])[0];
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