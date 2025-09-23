const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const createStageProgressTable = async () => {
  try {
    console.log('스테이지 진행도 테이블 생성 중...');
    
    const { data, error } = await supabase.rpc('create_stage_progress_table', {});
    
    if (error) {
      console.error('Error creating table:', error);
      
      // 직접 SQL 실행 시도
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

        -- Row Level Security (RLS) 정책
        ALTER TABLE stage_progress ENABLE ROW LEVEL SECURITY;

        -- 사용자는 자신의 스테이지 진행도만 조회/수정 가능
        CREATE POLICY IF NOT EXISTS "Users can only access their own stage progress" ON stage_progress
          FOR ALL USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

        -- public 역할에 대한 권한 부여 (임시 - 개발용)
        GRANT ALL ON stage_progress TO anon;
        GRANT ALL ON stage_progress TO authenticated;
      `;
      
      // SQL을 직접 실행하는 것은 Supabase client로는 제한적이므로 로그만 출력
      console.log('다음 SQL을 Supabase 대시보드에서 실행해주세요:');
      console.log(createTableSQL);
      return;
    }
    
    console.log('스테이지 진행도 테이블이 성공적으로 생성되었습니다.');
    console.log('데이터:', data);
    
  } catch (err) {
    console.error('테이블 생성 중 오류 발생:', err);
  }
};

createStageProgressTable();