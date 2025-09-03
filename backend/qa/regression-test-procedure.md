# 템플릿 시스템 리그레션 테스트 절차

## 목적
기존 AI 생성 시스템에서 새로운 템플릿 기반 하이브리드 시스템으로의 전환이 기존 기능을 손상시키지 않고 품질을 향상시켰는지 검증

## 테스트 환경 설정

### 1. 환경 준비
```bash
# 테스트 환경 변수 설정
export NODE_ENV=test
export SUPABASE_URL=<테스트_SUPABASE_URL>
export ANTHROPIC_API_KEY=<테스트_API_KEY>

# 테스트 데이터베이스 초기화
curl -X POST http://localhost:3001/api/templates/initialize
curl -X POST http://localhost:3001/api/pokemon/initialize
```

### 2. 기준 데이터 준비
- 테스트 사용자 10명 생성 (신규 사용자 5명, 숙련 사용자 5명)
- 기본 템플릿 3개 활성화
- 포켓몬 데이터 최소 50개 준비

## 리그레션 테스트 매트릭스

### Phase 1: 기본 기능 호환성 검증

#### 테스트 절차 1-1: API 응답 형식 호환성
```bash
# 구 시스템 응답 형식 기록
OLD_RESPONSE=$(curl -X POST http://localhost:3001/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"old_test_user","multiplicationTable":3,"difficulty":1}')

# 신 시스템 응답 형식 비교
NEW_RESPONSE=$(curl -X POST http://localhost:3001/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"new_test_user","multiplicationTable":3,"difficulty":1}')

# 필수 필드 존재 검증
echo $NEW_RESPONSE | jq '.problem.id, .problem.story, .problem.equation, .problem.answer'
```

**검증 기준**: 모든 필수 API 필드가 기존과 동일하게 존재

#### 테스트 절차 1-2: 수학적 정확성 검증
```bash
# 100개 문제 생성하여 정확성 검증
for i in {1..100}; do
  RESULT=$(curl -s -X POST http://localhost:3001/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"test_user_$i\",\"multiplicationTable\":$((RANDOM%8+2)),\"difficulty\":1}")
  
  # 정답 검증 로직 실행
  EQUATION=$(echo $RESULT | jq -r '.problem.equation')
  ANSWER=$(echo $RESULT | jq '.problem.answer')
  CALCULATED=$(echo "$EQUATION" | bc)
  
  if [ "$ANSWER" != "$CALCULATED" ]; then
    echo "오류 발견: $EQUATION = $ANSWER, 계산값: $CALCULATED"
  fi
done
```

**검증 기준**: 100% 수학적 정확성

### Phase 2: 전략 선택 로직 검증

#### 테스트 절차 2-1: 신규 사용자 → AI 전략
```bash
# 신규 사용자 생성
USER_ID="regression_test_user_1"

# 문제 생성 및 로그 확인
curl -X POST http://localhost:3001/api/problems/generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"multiplicationTable\":3,\"difficulty\":1}" | \
  grep -o "AI_PERSONALIZED"
```

**검증 기준**: 신규 사용자는 AI_PERSONALIZED 전략 사용

#### 테스트 절차 2-2: 숙련 사용자 → 하이브리드 전략
```bash
# 숙련 사용자 이력 생성
USER_ID="regression_test_user_2"

# 11개 정답 이력 생성
for i in {1..11}; do
  curl -X POST http://localhost:3001/api/user_answers \
    -H "Content-Type: application/json" \
    -d "{\"user_id\":\"$USER_ID\",\"is_correct\":true,\"multiplication_table\":3}"
done

# 전략 확인
curl -X POST http://localhost:3001/api/problems/generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"multiplicationTable\":3,\"difficulty\":1}" | \
  grep -o "HYBRID_ENHANCED"
```

**검증 기준**: 숙련 사용자는 HYBRID_ENHANCED 전략 사용

### Phase 3: 세션 관리 리그레션

#### 테스트 절차 3-1: 세션 지속성 검증
```bash
USER_ID="session_test_user"

# 1. 문제 생성
PROBLEM_RESPONSE=$(curl -X POST http://localhost:3001/api/problems/generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"multiplicationTable\":3,\"difficulty\":1}")

PROBLEM_ID=$(echo $PROBLEM_RESPONSE | jq -r '.problem.id')

# 2. 즉시 답안 제출 (정상 동작 확인)
curl -X POST http://localhost:3001/api/problems/submit \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"problemId\":\"$PROBLEM_ID\",\"answer\":12}"

# 3. 동일 문제 재제출 (세션 만료 확인)
curl -X POST http://localhost:3001/api/problems/submit \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"problemId\":\"$PROBLEM_ID\",\"answer\":12}"
```

**검증 기준**: 두 번째 제출은 404 오류 반환

#### 테스트 절차 3-2: 세션 TTL 검증
```bash
# 세션 만료 시뮬레이션을 위한 타임스탬프 조작
# (실제로는 테스트 DB에서 expires_at을 과거로 수정)
```

### Phase 4: 성능 리그레션 테스트

#### 테스트 절차 4-1: 응답 시간 비교
```bash
# 기존 AI 생성 시스템 성능 측정 (AI 전략 강제)
time_ai=$(curl -w "@curl-format.txt" -o /dev/null -s \
  -X POST http://localhost:3001/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"ai_user","multiplicationTable":3,"difficulty":1}')

# 새 템플릿 시스템 성능 측정 (템플릿 전략 강제)  
time_template=$(curl -w "@curl-format.txt" -o /dev/null -s \
  -X POST http://localhost:3001/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"template_user","multiplicationTable":3,"difficulty":1}')

echo "AI 생성 시간: $time_ai"
echo "템플릿 생성 시간: $time_template"
```

**검증 기준**: 템플릿 생성이 AI 생성보다 빨라야 함

## 품질 비교 테스트

### 테스트 절차 Q-1: 문제 품질 일관성
```bash
# 동일 구구단, 동일 난이도로 각각 10개씩 생성
# AI 전략 (신규 사용자)
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"ai_user_$i\",\"multiplicationTable\":3,\"difficulty\":1}" \
    >> ai_problems.json
done

# 템플릿 전략 (충분한 템플릿 보유 사용자)
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"template_user_$i\",\"multiplicationTable\":3,\"difficulty\":1}" \
    >> template_problems.json
done
```

**수동 검증 항목**:
1. 문제 문장의 자연스러움
2. 포켓몬-문제 맥락의 적절성  
3. 힌트의 교육적 효과
4. 시각적 요소의 일관성

### 테스트 절차 Q-2: 다양성 검증
```bash
# 동일 조건으로 50개 문제 생성하여 다양성 분석
PROBLEMS=$(curl -X POST http://localhost:3001/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"diversity_test","multiplicationTable":3,"difficulty":1}' \
  | jq '.problem.story')

# 문제 패턴 분석
echo $PROBLEMS | sed 's/피카츄/POKEMON/g' | sed 's/[0-9]/NUM/g' | sort | uniq -c
```

**검증 기준**: 최소 3가지 이상의 서로 다른 문제 패턴

## 장애 복구 시나리오 테스트

### 테스트 절차 F-1: 데이터베이스 장애 시뮬레이션
```bash
# 1. Supabase 연결 차단 (방화벽 규칙 또는 잘못된 URL)
export SUPABASE_URL="https://invalid-url.supabase.co"

# 2. 문제 생성 시도
curl -X POST http://localhost:3001/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"failure_test","multiplicationTable":3,"difficulty":1}'

# 3. AI 폴백 동작 확인
```

**검증 기준**: 템플릿 시스템 실패 시 AI 생성으로 자동 전환

### 테스트 절차 F-2: 템플릿 데이터 부족 시나리오
```sql
-- 모든 템플릿 비활성화
UPDATE problem_templates SET is_active = false;

-- 문제 생성 요청
-- 결과: AI_PERSONALIZED 전략으로 전환되어야 함
```

## 데이터 정합성 검증

### 테스트 절차 D-1: 세션 데이터 정합성
```sql
-- 만료되지 않은 세션 수 확인
SELECT COUNT(*) FROM problem_instances 
WHERE expires_at > NOW() AND is_answered = false;

-- 사용자별 활성 세션 수 (각 사용자당 최대 1개)
SELECT user_id, COUNT(*) as active_sessions 
FROM problem_instances 
WHERE expires_at > NOW() AND is_answered = false 
GROUP BY user_id 
HAVING COUNT(*) > 1;
```

**검증 기준**: 사용자당 최대 1개의 활성 세션만 존재

### 테스트 절차 D-2: 사용자 이력 정합성
```sql
-- 모든 답안이 user_answers에 기록되었는지 확인
SELECT 
  pi.id as problem_id,
  ua.problem_id as answer_record_id,
  CASE WHEN ua.problem_id IS NULL THEN 'MISSING' ELSE 'OK' END as status
FROM problem_instances pi
LEFT JOIN user_answers ua ON pi.id = ua.problem_id
WHERE pi.is_answered = true;
```

**검증 기준**: 답변 완료된 모든 문제가 user_answers에 기록됨

## 자동화 테스트 스크립트

### 리그레션 테스트 실행 스크립트
```bash
#!/bin/bash
# regression-test.sh

echo "=== 템플릿 시스템 리그레션 테스트 시작 ==="

# 1. 환경 초기화
./scripts/setup-test-env.sh

# 2. 기본 기능 테스트
./scripts/test-basic-functionality.sh

# 3. 성능 비교 테스트  
./scripts/test-performance-comparison.sh

# 4. 데이터 정합성 테스트
./scripts/test-data-integrity.sh

# 5. 장애 복구 테스트
./scripts/test-failure-recovery.sh

# 6. 결과 리포트 생성
./scripts/generate-test-report.sh

echo "=== 리그레션 테스트 완료 ==="
```

## 테스트 결과 기준

### Pass 기준
- ✅ **API 호환성**: 기존 API 형식 100% 유지
- ✅ **수학적 정확성**: 생성 문제 정답 100% 정확
- ✅ **성능 개선**: 템플릿 생성 시간 < AI 생성 시간  
- ✅ **세션 관리**: TTL, 중복 방지, 정리 기능 정상
- ✅ **전략 선택**: 사용자 조건에 따른 정확한 전략 선택
- ✅ **폴백 동작**: 장애 시 AI 생성으로 안정적 전환

### Fail 기준  
- ❌ **API 비호환**: 기존 필드 누락 또는 형식 변경
- ❌ **수학 오류**: 잘못된 정답 또는 계산 오류
- ❌ **성능 저하**: 템플릿 생성이 AI보다 느림
- ❌ **세션 오류**: 세션 누락, 중복, 만료 처리 실패
- ❌ **전략 오류**: 잘못된 조건에서 잘못된 전략 선택
- ❌ **폴백 실패**: 장애 시 시스템 완전 중단

## 테스트 실행 일정

### Phase 1: 기본 호환성 (1일차)
- API 응답 형식 검증
- 수학적 정확성 검증
- 기본 세션 관리 테스트

### Phase 2: 전략 로직 (2일차)  
- 사용자 조건별 전략 선택 테스트
- 하이브리드 비율 검증
- 템플릿 재활용 방지 테스트

### Phase 3: 성능 및 안정성 (3일차)
- 응답 시간 비교
- 부하 테스트
- 장애 복구 시나리오

### Phase 4: 종합 검증 (4일차)
- 데이터 정합성 검증  
- 사용자 시나리오 End-to-End 테스트
- 최종 리포트 작성

## 롤백 기준

다음 중 하나라도 실패 시 즉시 구 시스템으로 롤백:
1. **Critical API 기능 실패**: 문제 생성 또는 답안 제출 완전 실패
2. **데이터 손실**: 사용자 답안 기록 누락
3. **성능 심각 저하**: 응답 시간 3배 이상 증가
4. **보안 이슈**: 세션 누출 또는 권한 오류

## 테스트 도구

### 자동화 도구
- **Jest**: 단위 테스트 프레임워크
- **Supertest**: API 통합 테스트
- **curl**: HTTP API 요청 테스트
- **jq**: JSON 응답 분석
- **bc**: 수학 계산 검증

### 모니터링 도구
- **htop**: 시스템 리소스 모니터링
- **pgAdmin**: 데이터베이스 상태 모니터링  
- **서버 로그**: 전략 선택 및 오류 로그 분석

## 테스트 결과 문서화

### 테스트 실행 로그 형식
```
[2025-01-XX 10:30:15] [REGRESSION] Test ID: RT-001
[2025-01-XX 10:30:15] [REGRESSION] Scenario: API 응답 형식 호환성
[2025-01-XX 10:30:16] [REGRESSION] Result: PASS - 모든 필드 존재 확인
[2025-01-XX 10:30:16] [REGRESSION] Performance: 응답시간 0.8s (이전: 2.1s)
```

### 최종 리포트 구조
1. **Executive Summary**: 전체 테스트 결과 요약
2. **Compatibility Analysis**: API 및 기능 호환성 분석
3. **Performance Comparison**: 성능 개선 정량적 분석  
4. **Quality Assessment**: 문제 품질 비교 분석
5. **Risk Assessment**: 식별된 리스크 및 완화 방안
6. **Recommendation**: 배포 권장사항

## 승인 기준

### 배포 승인 조건
- [ ] Critical 테스트 100% 통과
- [ ] High 우선순위 테스트 95% 이상 통과  
- [ ] 성능 저하 없음 (동등 이상)
- [ ] 장애 시나리오 안정적 처리
- [ ] 데이터 정합성 100% 유지

### 조건부 승인
- Medium 우선순위 테스트 85% 이상 통과 시 조건부 승인
- 모니터링 강화 조건으로 점진적 배포

### 배포 거부
- Critical 테스트 1개라도 실패
- 데이터 정합성 위반
- 보안 취약점 발견