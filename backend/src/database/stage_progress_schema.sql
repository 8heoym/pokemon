-- Stage Progress Tracking Schema
-- 스테이지별 진행도 추적을 위한 테이블

CREATE TABLE IF NOT EXISTS stage_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    region_id INTEGER NOT NULL CHECK (region_id >= 2 AND region_id <= 9),
    stage_number INTEGER NOT NULL CHECK (stage_number >= 1),
    completed_problems INTEGER DEFAULT 0 CHECK (completed_problems >= 0 AND completed_problems <= 5),
    total_problems INTEGER DEFAULT 5 CHECK (total_problems > 0),
    is_completed BOOLEAN GENERATED ALWAYS AS (completed_problems >= 5) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 사용자별, 지역별, 스테이지별 유니크 제약
    UNIQUE(user_id, region_id, stage_number)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_stage_progress_user_id ON stage_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_stage_progress_region_id ON stage_progress(region_id);
CREATE INDEX IF NOT EXISTS idx_stage_progress_completed ON stage_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_stage_progress_user_region ON stage_progress(user_id, region_id);

-- Updated_at 트리거 생성
CREATE TRIGGER update_stage_progress_updated_at 
    BEFORE UPDATE ON stage_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE stage_progress ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 스테이지 진행도만 읽고 쓸 수 있음
CREATE POLICY "Users can read own stage progress" 
    ON stage_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stage progress" 
    ON stage_progress FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stage progress" 
    ON stage_progress FOR UPDATE 
    USING (auth.uid() = user_id);