-- Pokemon Math Adventure - Performance Optimization Indexes
-- 성능 분석 결과에 따른 핵심 인덱스 추가

-- 1. user_answers 테이블 최적화
-- 사용자별 정답 통계 조회 최적화 (getUserSolvedCount)
CREATE INDEX IF NOT EXISTS idx_user_answers_user_correct 
ON user_answers(user_id, is_correct);

-- 사용자별 구구단 통계 조회 최적화
CREATE INDEX IF NOT EXISTS idx_user_answers_user_table 
ON user_answers(user_id, multiplication_table) 
WHERE multiplication_table IS NOT NULL;

-- 최근 답변 이력 조회 최적화
CREATE INDEX IF NOT EXISTS idx_user_answers_user_recent 
ON user_answers(user_id, attempted_at DESC);

-- 2. problem_templates 테이블 최적화
-- 구구단별 템플릿 조회 최적화 (getAvailableTemplates)
CREATE INDEX IF NOT EXISTS idx_problem_templates_table_difficulty 
ON problem_templates(applicable_tables, difficulty, is_active) 
WHERE is_active = true;

-- 템플릿 품질 점수 정렬 최적화
CREATE INDEX IF NOT EXISTS idx_problem_templates_quality_active 
ON problem_templates(quality_score DESC, is_active) 
WHERE is_active = true;

-- 3. pokemon 테이블 최적화
-- 구구단별 포켓몬 조회 최적화 (getRandomPokemonByTable)
CREATE INDEX IF NOT EXISTS idx_pokemon_table_rarity 
ON pokemon(multiplication_table, rarity);

-- 지역별 포켓몬 조회 최적화
CREATE INDEX IF NOT EXISTS idx_pokemon_region 
ON pokemon(region);

-- 4. problem_instances 테이블 최적화 (세션 관리)
-- 활성 세션 조회 최적화 (getProblemFromSession)
CREATE INDEX IF NOT EXISTS idx_problem_instances_user_active 
ON problem_instances(user_id, is_answered, expires_at) 
WHERE is_answered = false;

-- 만료된 세션 정리 최적화
CREATE INDEX IF NOT EXISTS idx_problem_instances_cleanup 
ON problem_instances(expires_at) 
WHERE is_answered = false;

-- 5. user_template_history 테이블 최적화
-- 최근 사용 템플릿 필터링 최적화 (filterRecentlyUsedTemplates)
CREATE INDEX IF NOT EXISTS idx_user_template_history_recent 
ON user_template_history(user_id, multiplication_table, last_used_at DESC);

-- 템플릿 사용 통계 업데이트 최적화
CREATE INDEX IF NOT EXISTS idx_user_template_history_upsert 
ON user_template_history(user_id, template_id, multiplication_table);

-- 6. users 테이블 최적화
-- 닉네임 검색 최적화 (getUserByNickname)
CREATE INDEX IF NOT EXISTS idx_users_nickname 
ON users(nickname);

-- 리더보드 조회 최적화 (getLeaderboard)
CREATE INDEX IF NOT EXISTS idx_users_leaderboard 
ON users(total_experience DESC, trainer_level DESC);

-- 7. 복합 쿼리 최적화를 위한 추가 인덱스
-- 포켓몬 ID 배치 조회 최적화 (getBatch)
CREATE INDEX IF NOT EXISTS idx_pokemon_id_name 
ON pokemon(id, name, korean_name);

-- 템플릿 성능 분석을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_user_answers_template_performance 
ON user_answers(template_id, is_correct, attempted_at) 
WHERE template_id IS NOT NULL;

-- 인덱스 생성 완료 로그
-- SELECT 'Performance indexes created successfully' AS status;