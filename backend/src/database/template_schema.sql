-- 포켓몬 교체형 문제 템플릿 시스템 스키마

-- 문제 템플릿 테이블
CREATE TABLE IF NOT EXISTS problem_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 템플릿 정보
    name VARCHAR(100) NOT NULL,  -- '그룹 세기', '아이템 배분' 등
    category VARCHAR(50) NOT NULL, -- 'GROUP_COUNT', 'ITEM_DISTRIBUTION' 등
    
    -- 템플릿 구조 (포켓몬 교체 가능)
    story_template TEXT NOT NULL,  -- "{pokemon}가 {a}{unit}씩 {b}그룹에 있어요..."
    hint_template TEXT NOT NULL,   -- "{a} × {b}를 계산해보세요!"
    equation_template VARCHAR(255) NOT NULL, -- "{a} × {b}"
    
    -- 변수 정의
    variables JSONB NOT NULL, -- {"a": {"min": 1, "max": 9}, "b": {"min": 1, "max": 9}}
    units JSONB DEFAULT '[]', -- ["마리", "개", "명"]
    
    -- 적용 범위
    applicable_tables INTEGER[] NOT NULL, -- [2,3,4,5,6,7,8,9]
    difficulty INTEGER CHECK (difficulty IN (1, 2, 3)) NOT NULL,
    
    -- 교육적 메타데이터
    educational_concept VARCHAR(100), -- '반복덧셈', '배열개념'
    visual_elements_template JSONB,
    
    -- 품질 및 사용 관리
    usage_count INTEGER DEFAULT 0,
    quality_score DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 생성된 문제 인스턴스 테이블 (세션 관리용)
CREATE TABLE IF NOT EXISTS problem_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 원본 정보
    template_id UUID REFERENCES problem_templates(id),
    pokemon_id INTEGER REFERENCES pokemon(id),
    
    -- 렌더링된 실제 문제
    story TEXT NOT NULL,
    hint TEXT NOT NULL,
    equation VARCHAR(255) NOT NULL,
    answer INTEGER NOT NULL,
    
    -- 생성 정보
    variables_used JSONB NOT NULL, -- {"a": 2, "b": 3}
    multiplication_table INTEGER NOT NULL,
    difficulty INTEGER NOT NULL,
    
    -- 세션 관리
    is_answered BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 30분 TTL
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자-템플릿 사용 이력 (재활용 관리)
CREATE TABLE IF NOT EXISTS user_template_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES problem_templates(id) ON DELETE CASCADE,
    multiplication_table INTEGER NOT NULL,
    
    -- 사용 통계
    times_used INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 성능 통계
    correct_answers INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    average_time_spent DECIMAL(5,2) DEFAULT 0.0,
    
    -- 중복 방지
    UNIQUE(user_id, template_id, multiplication_table)
);

-- 향상된 사용자 답안 테이블 (기존 확장)
ALTER TABLE user_answers ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES problem_templates(id);
ALTER TABLE user_answers ADD COLUMN IF NOT EXISTS pokemon_id INTEGER REFERENCES pokemon(id);
ALTER TABLE user_answers ADD COLUMN IF NOT EXISTS mistake_pattern VARCHAR(50);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_problem_templates_table_difficulty 
    ON problem_templates(applicable_tables, difficulty) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_problem_instances_user_active 
    ON problem_instances(user_id, expires_at) 
    WHERE is_answered = false;

CREATE INDEX IF NOT EXISTS idx_user_template_history_usage 
    ON user_template_history(user_id, multiplication_table, last_used_at);

CREATE INDEX IF NOT EXISTS idx_user_template_history_performance 
    ON user_template_history(template_id, correct_answers, total_attempts);

-- 자동 만료 처리를 위한 함수
CREATE OR REPLACE FUNCTION cleanup_expired_instances()
RETURNS void AS $$
BEGIN
    DELETE FROM problem_instances 
    WHERE expires_at < NOW() AND is_answered = false;
END;
$$ LANGUAGE plpgsql;

-- Updated_at 트리거
CREATE TRIGGER update_problem_templates_updated_at 
    BEFORE UPDATE ON problem_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();