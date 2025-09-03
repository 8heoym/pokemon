#!/bin/bash

# 템플릿 시스템 API 테스트 스크립트
# 사용법: ./api-test-scripts.sh [base_url]

BASE_URL=${1:-"http://localhost:3001"}
TEST_USER="qa-test-user-$(date +%s)"
RESULTS_FILE="./qa/test-results-$(date +%Y%m%d-%H%M%S).log"

echo "=== 템플릿 시스템 API 테스트 시작 ===" | tee $RESULTS_FILE
echo "테스트 사용자: $TEST_USER" | tee -a $RESULTS_FILE
echo "서버 URL: $BASE_URL" | tee -a $RESULTS_FILE
echo "결과 파일: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 결과 카운터
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 테스트 실행 함수
run_test() {
  local test_id=$1
  local test_name=$2
  local expected_status=$3
  local curl_command=$4
  
  echo -e "${YELLOW}[TEST $test_id]${NC} $test_name" | tee -a $RESULTS_FILE
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  # 응답 시간 측정
  start_time=$(date +%s%3N)
  
  response=$(eval $curl_command 2>&1)
  actual_status=$(echo "$response" | grep -o '"status":[0-9]*' | grep -o '[0-9]*')
  
  end_time=$(date +%s%3N)
  response_time=$((end_time - start_time))
  
  if [ -z "$actual_status" ]; then
    # HTTP 상태 코드 직접 확인
    actual_status=$(echo "$curl_command" | sed 's/curl/curl -w "%{http_code}"/' | eval | tail -c 3)
  fi
  
  echo "  요청: $curl_command" | tee -a $RESULTS_FILE
  echo "  예상 상태: $expected_status, 실제 상태: $actual_status" | tee -a $RESULTS_FILE
  echo "  응답 시간: ${response_time}ms" | tee -a $RESULTS_FILE
  echo "  응답: $response" | tee -a $RESULTS_FILE
  
  if [ "$actual_status" = "$expected_status" ]; then
    echo -e "  ${GREEN}✅ PASS${NC}" | tee -a $RESULTS_FILE
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "  ${RED}❌ FAIL${NC}" | tee -a $RESULTS_FILE
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  echo "" | tee -a $RESULTS_FILE
}

# 서버 상태 확인
echo "=== 서버 상태 확인 ===" | tee -a $RESULTS_FILE
curl -s $BASE_URL > /dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ 서버 연결 정상${NC}" | tee -a $RESULTS_FILE
else
  echo -e "${RED}❌ 서버 연결 실패${NC}" | tee -a $RESULTS_FILE
  exit 1
fi
echo "" | tee -a $RESULTS_FILE

# === 1. 문제 생성 API 테스트 ===
echo "=== 1. 문제 생성 API 테스트 ===" | tee -a $RESULTS_FILE

run_test "IT-001" "정상적인 문제 생성" "200" \
  "curl -s -w '%{http_code}' -X POST $BASE_URL/api/problems/generate \
  -H 'Content-Type: application/json' \
  -d '{\"userId\":\"$TEST_USER\",\"multiplicationTable\":3,\"difficulty\":1}'"

run_test "IT-002" "필수 파라미터 누락 (userId)" "400" \
  "curl -s -w '%{http_code}' -X POST $BASE_URL/api/problems/generate \
  -H 'Content-Type: application/json' \
  -d '{\"multiplicationTable\":3,\"difficulty\":1}'"

run_test "IT-003" "잘못된 구구단 범위 (10)" "400" \
  "curl -s -w '%{http_code}' -X POST $BASE_URL/api/problems/generate \
  -H 'Content-Type: application/json' \
  -d '{\"userId\":\"$TEST_USER\",\"multiplicationTable\":10,\"difficulty\":1}'"

run_test "IT-004" "잘못된 구구단 범위 (1)" "400" \
  "curl -s -w '%{http_code}' -X POST $BASE_URL/api/problems/generate \
  -H 'Content-Type: application/json' \
  -d '{\"userId\":\"$TEST_USER\",\"multiplicationTable\":1,\"difficulty\":1}'"

# === 2. 답안 제출 API 테스트 ===
echo "=== 2. 답안 제출 API 테스트 ===" | tee -a $RESULTS_FILE

# 먼저 문제 생성
echo "테스트용 문제 생성 중..." | tee -a $RESULTS_FILE
PROBLEM_RESPONSE=$(curl -s -X POST $BASE_URL/api/problems/generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$TEST_USER-submit\",\"multiplicationTable\":4,\"difficulty\":1}")

PROBLEM_ID=$(echo $PROBLEM_RESPONSE | jq -r '.problem.id')
CORRECT_ANSWER=$(echo $PROBLEM_RESPONSE | jq '.problem.answer')

echo "생성된 문제 ID: $PROBLEM_ID, 정답: $CORRECT_ANSWER" | tee -a $RESULTS_FILE

if [ "$PROBLEM_ID" != "null" ]; then
  run_test "IT-101" "정답 제출" "200" \
    "curl -s -w '%{http_code}' -X POST $BASE_URL/api/problems/submit \
    -H 'Content-Type: application/json' \
    -d '{\"userId\":\"$TEST_USER-submit\",\"problemId\":\"$PROBLEM_ID\",\"answer\":$CORRECT_ANSWER}'"

  run_test "IT-102" "오답 제출" "200" \
    "curl -s -w '%{http_code}' -X POST $BASE_URL/api/problems/submit \
    -H 'Content-Type: application/json' \
    -d '{\"userId\":\"$TEST_USER-submit2\",\"problemId\":\"$PROBLEM_ID\",\"answer\":999}'"

  run_test "IT-104" "존재하지 않는 문제" "404" \
    "curl -s -w '%{http_code}' -X POST $BASE_URL/api/problems/submit \
    -H 'Content-Type: application/json' \
    -d '{\"userId\":\"$TEST_USER\",\"problemId\":\"invalid-id\",\"answer\":12}'"
fi

run_test "IT-105" "필수 파라미터 누락 (answer)" "400" \
  "curl -s -w '%{http_code}' -X POST $BASE_URL/api/problems/submit \
  -H 'Content-Type: application/json' \
  -d '{\"userId\":\"$TEST_USER\",\"problemId\":\"some-id\"}'"

# === 3. 성능 테스트 ===
echo "=== 3. 성능 테스트 ===" | tee -a $RESULTS_FILE

echo "[PERF-001] 문제 생성 성능 테스트 (10회 연속)" | tee -a $RESULTS_FILE
total_time=0
for i in {1..10}; do
  start=$(date +%s%3N)
  
  curl -s -o /dev/null -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"perf-user-$i\",\"multiplicationTable\":3,\"difficulty\":1}"
  
  end=$(date +%s%3N)
  time_taken=$((end - start))
  total_time=$((total_time + time_taken))
  
  echo "  시도 $i: ${time_taken}ms" | tee -a $RESULTS_FILE
done

average_time=$((total_time / 10))
echo "  평균 응답 시간: ${average_time}ms" | tee -a $RESULTS_FILE

if [ $average_time -lt 2000 ]; then
  echo -e "  ${GREEN}✅ 성능 기준 통과 (< 2000ms)${NC}" | tee -a $RESULTS_FILE
else
  echo -e "  ${RED}❌ 성능 기준 실패 (>= 2000ms)${NC}" | tee -a $RESULTS_FILE
fi
echo "" | tee -a $RESULTS_FILE

# === 4. 전략 선택 로직 테스트 ===
echo "=== 4. 전략 선택 로직 테스트 ===" | tee -a $RESULTS_FILE

# 신규 사용자 전략 테스트
echo "[STRATEGY-001] 신규 사용자 전략 테스트" | tee -a $RESULTS_FILE
NEW_USER="new-user-$(date +%s)"
STRATEGY_RESPONSE=$(curl -s -X POST $BASE_URL/api/problems/generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$NEW_USER\",\"multiplicationTable\":3,\"difficulty\":1}")

echo "신규 사용자 응답: $STRATEGY_RESPONSE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# === 5. 수학적 정확성 검증 ===
echo "=== 5. 수학적 정확성 검증 ===" | tee -a $RESULTS_FILE

echo "[MATH-001] 수학적 정확성 테스트 (50회)" | tee -a $RESULTS_FILE
math_errors=0

for i in {1..50}; do
  table=$((RANDOM % 8 + 2))  # 2-9 랜덤
  
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"math-test-$i\",\"multiplicationTable\":$table,\"difficulty\":1}")
  
  equation=$(echo $response | jq -r '.problem.equation')
  answer=$(echo $response | jq '.problem.answer')
  
  # bc로 계산 검증
  if command -v bc > /dev/null; then
    calculated=$(echo "$equation" | bc 2>/dev/null)
    if [ "$answer" != "$calculated" ]; then
      echo "  수학 오류 발견: $equation = $answer (계산값: $calculated)" | tee -a $RESULTS_FILE
      math_errors=$((math_errors + 1))
    fi
  fi
done

echo "  총 검증 수: 50" | tee -a $RESULTS_FILE
echo "  수학 오류 수: $math_errors" | tee -a $RESULTS_FILE

if [ $math_errors -eq 0 ]; then
  echo -e "  ${GREEN}✅ 수학적 정확성 통과 (100%)${NC}" | tee -a $RESULTS_FILE
else
  echo -e "  ${RED}❌ 수학적 정확성 실패 (오류 ${math_errors}개)${NC}" | tee -a $RESULTS_FILE
fi
echo "" | tee -a $RESULTS_FILE

# === 6. 종합 결과 ===
echo "=== 테스트 결과 요약 ===" | tee -a $RESULTS_FILE
echo "총 테스트: $TOTAL_TESTS" | tee -a $RESULTS_FILE
echo -e "통과: ${GREEN}$PASSED_TESTS${NC}" | tee -a $RESULTS_FILE  
echo -e "실패: ${RED}$FAILED_TESTS${NC}" | tee -a $RESULTS_FILE

pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "통과율: ${pass_rate}%" | tee -a $RESULTS_FILE

if [ $pass_rate -ge 90 ]; then
  echo -e "${GREEN}✅ 전체 테스트 성공 - 배포 가능${NC}" | tee -a $RESULTS_FILE
  exit 0
elif [ $pass_rate -ge 75 ]; then
  echo -e "${YELLOW}⚠️ 일부 테스트 실패 - 수정 후 재테스트 권장${NC}" | tee -a $RESULTS_FILE
  exit 1  
else
  echo -e "${RED}❌ 테스트 실패 - 배포 불가${NC}" | tee -a $RESULTS_FILE
  exit 2
fi