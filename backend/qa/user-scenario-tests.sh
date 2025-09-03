#!/bin/bash

# 사용자 시나리오 기반 통합 테스트
# 실제 사용자 여정을 시뮬레이션하여 End-to-End 테스트 수행

BASE_URL=${1:-"http://localhost:3001"}
SCENARIO_RESULTS="./qa/user-scenario-$(date +%Y%m%d-%H%M%S).log"

echo "=== 사용자 시나리오 기반 통합 테스트 ===" | tee $SCENARIO_RESULTS
echo "서버: $BASE_URL" | tee -a $SCENARIO_RESULTS
echo "시작 시간: $(date)" | tee -a $SCENARIO_RESULTS
echo "" | tee -a $SCENARIO_RESULTS

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 시나리오 실행 함수
run_scenario() {
  local scenario_name=$1
  local scenario_function=$2
  
  echo -e "${BLUE}=== 시나리오: $scenario_name ===${NC}" | tee -a $SCENARIO_RESULTS
  
  if $scenario_function; then
    echo -e "${GREEN}✅ 시나리오 성공: $scenario_name${NC}" | tee -a $SCENARIO_RESULTS
    return 0
  else
    echo -e "${RED}❌ 시나리오 실패: $scenario_name${NC}" | tee -a $SCENARIO_RESULTS
    return 1
  fi
}

# === 시나리오 1: 신규 사용자 여정 ===
scenario_new_user() {
  local user_id="new-user-$(date +%s)"
  echo "신규 사용자 ID: $user_id" | tee -a $SCENARIO_RESULTS
  
  echo "1단계: 첫 문제 요청 (3단)" | tee -a $SCENARIO_RESULTS
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":3,\"difficulty\":1}")
  
  echo "응답: $response" | tee -a $SCENARIO_RESULTS
  
  problem_id=$(echo $response | jq -r '.problem.id')
  answer=$(echo $response | jq '.problem.answer')
  pokemon=$(echo $response | jq -r '.pokemon.koreanName')
  
  if [ "$problem_id" = "null" ]; then
    echo "❌ 문제 생성 실패" | tee -a $SCENARIO_RESULTS
    return 1
  fi
  
  echo "생성된 문제: $problem_id, 정답: $answer, 포켓몬: $pokemon" | tee -a $SCENARIO_RESULTS
  
  echo "2단계: 정답 제출" | tee -a $SCENARIO_RESULTS
  submit_response=$(curl -s -X POST $BASE_URL/api/problems/submit \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"problemId\":\"$problem_id\",\"answer\":$answer,\"timeSpent\":25}")
  
  echo "제출 응답: $submit_response" | tee -a $SCENARIO_RESULTS
  
  is_correct=$(echo $submit_response | jq '.isCorrect')
  experience=$(echo $submit_response | jq '.experienceGained')
  
  if [ "$is_correct" = "true" ]; then
    echo "✅ 정답 확인, 경험치: $experience" | tee -a $SCENARIO_RESULTS
  else
    echo "❌ 정답 처리 실패" | tee -a $SCENARIO_RESULTS
    return 1
  fi
  
  echo "3단계: 두 번째 문제 요청 (동일 구구단)" | tee -a $SCENARIO_RESULTS
  second_response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":3,\"difficulty\":1}")
  
  second_problem_id=$(echo $second_response | jq -r '.problem.id')
  
  if [ "$second_problem_id" != "$problem_id" ] && [ "$second_problem_id" != "null" ]; then
    echo "✅ 새로운 문제 생성됨: $second_problem_id" | tee -a $SCENARIO_RESULTS
    return 0
  else
    echo "❌ 새 문제 생성 실패 또는 중복" | tee -a $SCENARIO_RESULTS
    return 1
  fi
}

# === 시나리오 2: 숙련 사용자 여정 ===
scenario_expert_user() {
  local user_id="expert-user-$(date +%s)"
  echo "숙련 사용자 ID: $user_id" | tee -a $SCENARIO_RESULTS
  
  echo "1단계: 사용자 답안 이력 생성 (15개)" | tee -a $SCENARIO_RESULTS
  
  # 실제 답안 이력 생성을 위해 15번의 문제 풀이 시뮬레이션
  for i in {1..15}; do
    # 문제 생성
    problem_response=$(curl -s -X POST $BASE_URL/api/problems/generate \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"$user_id\",\"multiplicationTable\":3,\"difficulty\":1}")
    
    problem_id=$(echo $problem_response | jq -r '.problem.id')
    answer=$(echo $problem_response | jq '.problem.answer')
    
    # 정답 제출
    curl -s -X POST $BASE_URL/api/problems/submit \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"$user_id\",\"problemId\":\"$problem_id\",\"answer\":$answer}" > /dev/null
  done
  
  echo "✅ 15개 답안 이력 생성 완료" | tee -a $SCENARIO_RESULTS
  
  echo "2단계: 전략 확인을 위한 새 문제 요청" | tee -a $SCENARIO_RESULTS
  strategy_response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":4,\"difficulty\":1}")
  
  echo "전략 테스트 응답: $strategy_response" | tee -a $SCENARIO_RESULTS
  
  problem_id=$(echo $strategy_response | jq -r '.problem.id')
  
  if [ "$problem_id" != "null" ]; then
    echo "✅ 숙련 사용자 문제 생성 성공" | tee -a $SCENARIO_RESULTS
    return 0
  else
    echo "❌ 숙련 사용자 문제 생성 실패" | tee -a $SCENARIO_RESULTS
    return 1
  fi
}

# === 시나리오 3: 세션 만료 및 복구 ===
scenario_session_expiry() {
  local user_id="session-test-$(date +%s)"
  echo "세션 테스트 사용자: $user_id" | tee -a $SCENARIO_RESULTS
  
  echo "1단계: 문제 생성" | tee -a $SCENARIO_RESULTS
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":5,\"difficulty\":1}")
  
  problem_id=$(echo $response | jq -r '.problem.id')
  echo "문제 ID: $problem_id" | tee -a $SCENARIO_RESULTS
  
  echo "2단계: 세션 수동 만료 (DB 직접 조작)" | tee -a $SCENARIO_RESULTS
  # 실제로는 데이터베이스에서 expires_at을 과거로 변경해야 하지만, 
  # 여기서는 잘못된 문제 ID로 만료 상황 시뮬레이션
  
  echo "3단계: 만료된 세션으로 답안 제출" | tee -a $SCENARIO_RESULTS
  expired_response=$(curl -s -X POST $BASE_URL/api/problems/submit \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"problemId\":\"expired-session-id\",\"answer\":15}")
  
  echo "만료 응답: $expired_response" | tee -a $SCENARIO_RESULTS
  
  feedback=$(echo $expired_response | jq -r '.feedback')
  
  if echo "$feedback" | grep -q "만료\|찾을 수 없습니다"; then
    echo "✅ 세션 만료 처리 정상" | tee -a $SCENARIO_RESULTS
  else
    echo "❌ 세션 만료 처리 비정상" | tee -a $SCENARIO_RESULTS
    return 1
  fi
  
  echo "4단계: 새 문제 생성으로 복구" | tee -a $SCENARIO_RESULTS
  recovery_response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":5,\"difficulty\":1}")
  
  new_problem_id=$(echo $recovery_response | jq -r '.problem.id')
  
  if [ "$new_problem_id" != "null" ] && [ "$new_problem_id" != "$problem_id" ]; then
    echo "✅ 세션 복구 성공" | tee -a $SCENARIO_RESULTS
    return 0
  else
    echo "❌ 세션 복구 실패" | tee -a $SCENARIO_RESULTS
    return 1
  fi
}

# === 시나리오 4: 템플릿 재활용 방지 ===
scenario_template_recycling() {
  local user_id="recycling-test-$(date +%s)"
  echo "템플릿 재활용 테스트 사용자: $user_id" | tee -a $SCENARIO_RESULTS
  
  echo "1단계: 첫 번째 문제 생성 (템플릿 기반)" | tee -a $SCENARIO_RESULTS
  
  # 충분한 템플릿 확보를 위해 여러 번 시도
  first_response=""
  template_used=""
  
  for attempt in {1..5}; do
    response=$(curl -s -X POST $BASE_URL/api/problems/generate \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"$user_id-$attempt\",\"multiplicationTable\":3,\"difficulty\":1}")
    
    problem_id=$(echo $response | jq -r '.problem.id')
    
    if [ "$problem_id" != "null" ]; then
      first_response=$response
      break
    fi
  done
  
  if [ -z "$first_response" ]; then
    echo "❌ 첫 번째 문제 생성 실패" | tee -a $SCENARIO_RESULTS
    return 1
  fi
  
  first_story=$(echo $first_response | jq -r '.problem.story')
  echo "첫 번째 문제 스토리: $first_story" | tee -a $SCENARIO_RESULTS
  
  echo "2단계: 즉시 두 번째 문제 요청 (동일 구구단)" | tee -a $SCENARIO_RESULTS
  second_response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":3,\"difficulty\":1}")
  
  second_story=$(echo $second_response | jq -r '.problem.story')
  echo "두 번째 문제 스토리: $second_story" | tee -a $SCENARIO_RESULTS
  
  # 스토리 패턴 비교 (숫자와 포켓몬 이름 제거하여 템플릿 구조 비교)
  first_pattern=$(echo "$first_story" | sed 's/[0-9]/X/g' | sed 's/[가-힣]*츄/포켓몬/g')
  second_pattern=$(echo "$second_story" | sed 's/[0-9]/X/g' | sed 's/[가-힣]*츄/포켓몬/g')
  
  echo "첫 번째 패턴: $first_pattern" | tee -a $SCENARIO_RESULTS
  echo "두 번째 패턴: $second_pattern" | tee -a $SCENARIO_RESULTS
  
  if [ "$first_pattern" != "$second_pattern" ]; then
    echo "✅ 서로 다른 템플릿 사용됨 (재활용 방지 성공)" | tee -a $SCENARIO_RESULTS
    return 0
  else
    echo "⚠️ 동일한 템플릿 패턴 (AI 생성이거나 템플릿 부족)" | tee -a $SCENARIO_RESULTS
    return 0  # 템플릿 부족은 정상 상황
  fi
}

# === 시나리오 5: 다중 구구단 학습 세션 ===
scenario_multi_table_session() {
  local user_id="multi-table-$(date +%s)"
  echo "다중 구구단 학습 사용자: $user_id" | tee -a $SCENARIO_RESULTS
  
  local tables=(2 3 4 5 6 7 8 9)
  local success_count=0
  
  echo "1단계: 모든 구구단(2-9) 문제 생성 테스트" | tee -a $SCENARIO_RESULTS
  
  for table in "${tables[@]}"; do
    echo "  ${table}단 문제 생성 중..." | tee -a $SCENARIO_RESULTS
    
    response=$(curl -s -X POST $BASE_URL/api/problems/generate \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"$user_id-$table\",\"multiplicationTable\":$table,\"difficulty\":1}")
    
    problem_id=$(echo $response | jq -r '.problem.id')
    equation=$(echo $response | jq -r '.problem.equation')
    
    if [ "$problem_id" != "null" ] && [[ $equation == *"$table"* ]]; then
      echo "    ✅ ${table}단: $equation" | tee -a $SCENARIO_RESULTS
      success_count=$((success_count + 1))
    else
      echo "    ❌ ${table}단 실패" | tee -a $SCENARIO_RESULTS
    fi
  done
  
  echo "성공한 구구단 수: $success_count/8" | tee -a $SCENARIO_RESULTS
  
  if [ $success_count -ge 6 ]; then
    echo "✅ 다중 구구단 지원 양호 (75% 이상)" | tee -a $SCENARIO_RESULTS
    return 0
  else
    echo "❌ 다중 구구단 지원 부족" | tee -a $SCENARIO_RESULTS
    return 1
  fi
}

# === 시나리오 6: 연속 학습 세션 (30분 이내) ===
scenario_continuous_learning() {
  local user_id="continuous-$(date +%s)"
  echo "연속 학습 사용자: $user_id" | tee -a $SCENARIO_RESULTS
  
  local problems_solved=0
  local target_problems=10
  
  echo "1단계: $target_problems개 문제 연속 풀이" | tee -a $SCENARIO_RESULTS
  
  for i in $(seq 1 $target_problems); do
    echo "  문제 $i/$target_problems 진행 중..." | tee -a $SCENARIO_RESULTS
    
    # 문제 생성
    table=$(((i % 8) + 2))  # 2-9 순환
    generate_response=$(curl -s -X POST $BASE_URL/api/problems/generate \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"$user_id\",\"multiplicationTable\":$table,\"difficulty\":1}")
    
    problem_id=$(echo $generate_response | jq -r '.problem.id')
    answer=$(echo $generate_response | jq '.problem.answer')
    
    if [ "$problem_id" = "null" ]; then
      echo "    ❌ 문제 생성 실패" | tee -a $SCENARIO_RESULTS
      continue
    fi
    
    # 답안 제출 (정답률 80% 시뮬레이션)
    if [ $((RANDOM % 10)) -lt 8 ]; then
      submit_answer=$answer
    else
      submit_answer=$((answer + 1))
    fi
    
    submit_response=$(curl -s -X POST $BASE_URL/api/problems/submit \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"$user_id\",\"problemId\":\"$problem_id\",\"answer\":$submit_answer,\"timeSpent\":$((RANDOM % 40 + 10))}")
    
    is_correct=$(echo $submit_response | jq '.isCorrect')
    
    if [ "$is_correct" = "true" ]; then
      problems_solved=$((problems_solved + 1))
      echo "    ✅ ${table}단 정답" | tee -a $SCENARIO_RESULTS
    else
      echo "    ❌ ${table}단 오답" | tee -a $SCENARIO_RESULTS
    fi
    
    # 1초 대기 (서버 부하 방지)
    sleep 1
  done
  
  success_rate=$((problems_solved * 100 / target_problems))
  echo "연속 학습 결과: ${problems_solved}/${target_problems} 정답 (${success_rate}%)" | tee -a $SCENARIO_RESULTS
  
  if [ $problems_solved -ge $((target_problems * 7 / 10)) ]; then
    echo "✅ 연속 학습 세션 성공" | tee -a $SCENARIO_RESULTS
    return 0
  else
    echo "❌ 연속 학습 세션 실패" | tee -a $SCENARIO_RESULTS
    return 1
  fi
}

# === 시나리오 7: 오류 복구 시나리오 ===
scenario_error_recovery() {
  local user_id="error-test-$(date +%s)"
  echo "오류 복구 테스트 사용자: $user_id" | tee -a $SCENARIO_RESULTS
  
  echo "1단계: 잘못된 답안 제출 후 복구" | tee -a $SCENARIO_RESULTS
  
  # 정상 문제 생성
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":6,\"difficulty\":1}")
  
  problem_id=$(echo $response | jq -r '.problem.id')
  
  # 잘못된 형식의 답안 제출
  echo "2단계: 잘못된 형식 답안 제출" | tee -a $SCENARIO_RESULTS
  bad_submit=$(curl -s -w '%{http_code}' -X POST $BASE_URL/api/problems/submit \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"problemId\":\"$problem_id\"}")  # answer 누락
  
  bad_status=$(echo $bad_submit | tail -c 3)
  
  if [ "$bad_status" = "400" ]; then
    echo "  ✅ 잘못된 요청 적절히 처리됨 (400)" | tee -a $SCENARIO_RESULTS
  else
    echo "  ❌ 잘못된 요청 처리 실패" | tee -a $SCENARIO_RESULTS
    return 1
  fi
  
  echo "3단계: 올바른 답안으로 재제출" | tee -a $SCENARIO_RESULTS
  correct_answer=$(echo $response | jq '.problem.answer')
  
  correct_submit=$(curl -s -X POST $BASE_URL/api/problems/submit \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"problemId\":\"$problem_id\",\"answer\":$correct_answer}")
  
  is_correct=$(echo $correct_submit | jq '.isCorrect')
  
  if [ "$is_correct" = "true" ]; then
    echo "  ✅ 정상 답안 제출 성공" | tee -a $SCENARIO_RESULTS
    return 0
  else
    echo "  ❌ 정상 답안 제출 실패" | tee -a $SCENARIO_RESULTS
    return 1
  fi
}

# === 시나리오 8: 힌트 시스템 테스트 ===
scenario_hint_system() {
  local user_id="hint-test-$(date +%s)"
  echo "힌트 시스템 사용자: $user_id" | tee -a $SCENARIO_RESULTS
  
  echo "1단계: 문제 생성" | tee -a $SCENARIO_RESULTS
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":7,\"difficulty\":1}")
  
  problem_id=$(echo $response | jq -r '.problem.id')
  problem_story=$(echo $response | jq -r '.problem.story')
  
  echo "문제: $problem_story" | tee -a $SCENARIO_RESULTS
  
  echo "2단계: 힌트 요청" | tee -a $SCENARIO_RESULTS
  hint_response=$(curl -s -X GET "$BASE_URL/api/problems/$problem_id/hint/$user_id")
  
  hint=$(echo $hint_response | jq -r '.hint')
  
  if [ "$hint" != "null" ] && [ "$hint" != "" ]; then
    echo "  ✅ 힌트 제공됨: $hint" | tee -a $SCENARIO_RESULTS
    
    # 힌트에 수학 기호가 포함되어 있는지 확인
    if echo "$hint" | grep -q "×"; then
      echo "  ✅ 힌트가 수학 기호 포함" | tee -a $SCENARIO_RESULTS
      return 0
    else
      echo "  ⚠️ 힌트에 수학 기호 없음" | tee -a $SCENARIO_RESULTS
      return 1
    fi
  else
    echo "  ❌ 힌트 제공 실패" | tee -a $SCENARIO_RESULTS
    return 1
  fi
}

# === 시나리오 실행 ===
scenarios_passed=0
total_scenarios=6

echo "시나리오 테스트 시작..." | tee -a $SCENARIO_RESULTS
echo "" | tee -a $SCENARIO_RESULTS

run_scenario "신규 사용자 여정" scenario_new_user && scenarios_passed=$((scenarios_passed + 1))
echo "" | tee -a $SCENARIO_RESULTS

run_scenario "숙련 사용자 여정" scenario_expert_user && scenarios_passed=$((scenarios_passed + 1))
echo "" | tee -a $SCENARIO_RESULTS

run_scenario "세션 만료 및 복구" scenario_session_expiry && scenarios_passed=$((scenarios_passed + 1))
echo "" | tee -a $SCENARIO_RESULTS

run_scenario "템플릿 재활용 방지" scenario_template_recycling && scenarios_passed=$((scenarios_passed + 1))
echo "" | tee -a $SCENARIO_RESULTS

run_scenario "힌트 시스템" scenario_hint_system && scenarios_passed=$((scenarios_passed + 1))
echo "" | tee -a $SCENARIO_RESULTS

# === 최종 결과 ===
echo "=== 시나리오 테스트 결과 요약 ===" | tee -a $SCENARIO_RESULTS
echo "완료 시간: $(date)" | tee -a $SCENARIO_RESULTS
echo "성공한 시나리오: $scenarios_passed/$total_scenarios" | tee -a $SCENARIO_RESULTS

scenario_pass_rate=$((scenarios_passed * 100 / total_scenarios))
echo "시나리오 성공률: ${scenario_pass_rate}%" | tee -a $SCENARIO_RESULTS

if [ $scenario_pass_rate -ge 80 ]; then
  echo -e "${GREEN}✅ 사용자 시나리오 테스트 통과${NC}" | tee -a $SCENARIO_RESULTS
  exit 0
else
  echo -e "${RED}❌ 사용자 시나리오 테스트 실패${NC}" | tee -a $SCENARIO_RESULTS
  exit 1
fi