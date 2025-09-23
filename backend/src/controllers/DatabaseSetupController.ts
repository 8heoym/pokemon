import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class DatabaseSetupController {
  async createStageProgressTable(req: Request, res: Response) {
    try {
      console.log('스테이지 진행도 테이블 생성 시작...');

      // SQL 스크립트 실행
      const createTableSQL = `
        -- 스테이지 진행도 테이블 생성
        CREATE TABLE IF NOT EXISTS stage_progress (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          region_id INTEGER NOT NULL CHECK (region_id >= 2 AND region_id <= 9),
          stage_number INTEGER NOT NULL CHECK (stage_number >= 1),
          completed_problems INTEGER DEFAULT 0 CHECK (completed_problems >= 0 AND completed_problems <= 5),
          total_problems INTEGER DEFAULT 5 CHECK (total_problems > 0),
          is_completed BOOLEAN GENERATED ALWAYS AS (completed_problems >= 4) STORED,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, region_id, stage_number)
        );

        -- 스테이지 진행도 테이블 인덱스
        CREATE INDEX IF NOT EXISTS idx_stage_progress_user_id ON stage_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_stage_progress_region_id ON stage_progress(region_id);
        CREATE INDEX IF NOT EXISTS idx_stage_progress_user_region ON stage_progress(user_id, region_id);
      `;

      // 테이블 생성 시도
      const { data, error } = await supabase.from('stage_progress').select('id').limit(1);
      
      if (error && error.code === 'PGRST116') {
        // 테이블이 존재하지 않음 - 생성 필요
        console.log('테이블이 존재하지 않습니다. 수동 생성이 필요합니다.');
        return res.status(200).json({
          success: false,
          message: '테이블 생성이 필요합니다. 다음 SQL을 Supabase 대시보드에서 실행해주세요.',
          sql: createTableSQL
        });
      } else if (error) {
        console.error('테이블 확인 중 오류:', error);
        return res.status(500).json({
          success: false,
          error: '테이블 확인 중 오류가 발생했습니다.',
          details: error.message
        });
      } else {
        // 테이블이 이미 존재
        console.log('스테이지 진행도 테이블이 이미 존재합니다.');
        return res.json({
          success: true,
          message: '스테이지 진행도 테이블이 이미 존재합니다.',
          data: data
        });
      }

    } catch (error) {
      console.error('테이블 생성 중 오류:', error);
      res.status(500).json({
        success: false,
        error: '테이블 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async testStageProgressTable(req: Request, res: Response) {
    try {
      // 테이블 존재 확인
      const { data, error } = await supabase
        .from('stage_progress')
        .select('id')
        .limit(1);

      if (error) {
        return res.status(500).json({
          success: false,
          error: '테이블에 접근할 수 없습니다.',
          details: error.message
        });
      }

      res.json({
        success: true,
        message: '스테이지 진행도 테이블이 정상적으로 작동합니다.',
        data: data
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: '테이블 테스트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
}