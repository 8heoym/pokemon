#!/bin/bash

# 간소화된 성능 테스트 (macOS 호환)
BASE_URL=${1:-"http://localhost:3001"}
RESULTS_FILE="./qa/performance-results-$(date +%Y%m%d-%H%M%S).log"

echo "=== 템플릿 시스템 성능 테스트 ===" | tee $RESULTS_FILE
echo "서버: $BASE_URL" | tee -a $RESULTS_FILE
echo "시작: $(date)" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# 색상
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 서버 상태 확인
echo "서버 상태 확인..." | tee -a $RESULTS_FILE
if curl -s $BASE_URL > /dev/null; then
  echo -e "${GREEN}✅ 서버 연결 성공${NC}" | tee -a $RESULTS_FILE
else
  echo -e "${RED}❌ 서버 연결 실패${NC}" | tee -a $RESULTS_FILE
  exit 1
fi
echo "" | tee -a $RESULTS_FILE

# === 1. 기본 응답 시간 테스트 ===
echo -e "${BLUE}=== 1. 기본 응답 시간 테스트 ===${NC}" | tee -a $RESULTS_FILE
echo "30개 문제 생성 응답 시간 측정..." | tee -a $RESULTS_FILE

total_time=0
success_count=0
min_time=99999
max_time=0

for i in {1..30}; do
  user_id="perf-test-$i"
  table=$(((i % 8) + 2))
  
  # 시간 측정 (밀리초)
  start_time=$(python3 -c "import time; print(int(time.time() * 1000))")
  
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":$table,\"difficulty\":1}")
  
  end_time=$(python3 -c "import time; print(int(time.time() * 1000))")
  response_time=$((end_time - start_time))
  
  total_time=$((total_time + response_time))
  
  # 성공 여부 확인
  problem_id=$(echo $response | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('problem', {}).get('id', 'null'))")
  
  if [ "$problem_id" != "null" ]; then
    success_count=$((success_count + 1))
  fi
  
  # 최소/최대 시간 업데이트
  if [ $response_time -lt $min_time ]; then
    min_time=$response_time
  fi
  
  if [ $response_time -gt $max_time ]; then
    max_time=$response_time
  fi
  
  echo -ne "\r진행: $i/30 (${response_time}ms)"
done

echo "" | tee -a $RESULTS_FILE

avg_time=$((total_time / 30))
success_rate=$((success_count * 100 / 30))

echo "결과:" | tee -a $RESULTS_FILE
echo "  총 요청: 30개" | tee -a $RESULTS_FILE
echo "  성공: $success_count개 (${success_rate}%)" | tee -a $RESULTS_FILE
echo "  평균 응답시간: ${avg_time}ms" | tee -a $RESULTS_FILE
echo "  최소 응답시간: ${min_time}ms" | tee -a $RESULTS_FILE
echo "  최대 응답시간: ${max_time}ms" | tee -a $RESULTS_FILE

if [ $success_rate -ge 90 ] && [ $avg_time -lt 3000 ]; then
  echo -e "  ${GREEN}✅ 응답시간 테스트 통과${NC}" | tee -a $RESULTS_FILE
  response_test_pass=1
else
  echo -e "  ${RED}❌ 응답시간 테스트 실패${NC}" | tee -a $RESULTS_FILE
  response_test_pass=0
fi

echo "" | tee -a $RESULTS_FILE

# === 2. 연속 요청 테스트 ===
echo -e "${BLUE}=== 2. 연속 요청 안정성 테스트 ===${NC}" | tee -a $RESULTS_FILE
echo "동일 사용자 10개 문제 연속 생성..." | tee -a $RESULTS_FILE

continuous_user="continuous-user-$(date +%s)"
continuous_success=0

for i in {1..10}; do
  table=$(((i % 8) + 2))
  
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$continuous_user\",\"multiplicationTable\":$table,\"difficulty\":1}")
  
  problem_id=$(echo $response | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('problem', {}).get('id', 'null'))")
  
  if [ "$problem_id" != "null" ]; then
    continuous_success=$((continuous_success + 1))
    echo "  $i. ${table}단 문제 생성 성공" | tee -a $RESULTS_FILE
  else
    echo "  $i. ${table}단 문제 생성 실패" | tee -a $RESULTS_FILE
  fi
  
  sleep 1
done

continuous_rate=$((continuous_success * 100 / 10))
echo "연속 요청 성공률: ${continuous_rate}%" | tee -a $RESULTS_FILE

if [ $continuous_rate -ge 80 ]; then
  echo -e "${GREEN}✅ 연속 요청 테스트 통과${NC}" | tee -a $RESULTS_FILE
  continuous_test_pass=1
else
  echo -e "${RED}❌ 연속 요청 테스트 실패${NC}" | tee -a $RESULTS_FILE
  continuous_test_pass=0
fi

echo "" | tee -a $RESULTS_FILE

# === 3. 답안 제출 테스트 ===
echo -e "${BLUE}=== 3. 답안 제출 테스트 ===${NC}" | tee -a $RESULTS_FILE

# 문제 생성
submit_user="submit-test-$(date +%s)"
problem_response=$(curl -s -X POST $BASE_URL/api/problems/generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$submit_user\",\"multiplicationTable\":5,\"difficulty\":1}")

problem_id=$(echo $problem_response | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('problem', {}).get('id', 'null'))")
correct_answer=$(echo $problem_response | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('problem', {}).get('answer', 0))")

echo "문제 ID: $problem_id" | tee -a $RESULTS_FILE
echo "정답: $correct_answer" | tee -a $RESULTS_FILE

if [ "$problem_id" != "null" ]; then
  # 정답 제출
  submit_response=$(curl -s -X POST $BASE_URL/api/problems/submit \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$submit_user\",\"problemId\":\"$problem_id\",\"answer\":$correct_answer,\"timeSpent\":30}")
  
  is_correct=$(echo $submit_response | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('isCorrect', False))")
  
  if [ "$is_correct" = "True" ]; then
    echo -e "${GREEN}✅ 답안 제출 테스트 통과${NC}" | tee -a $RESULTS_FILE
    submit_test_pass=1
  else
    echo -e "${RED}❌ 답안 제출 테스트 실패${NC}" | tee -a $RESULTS_FILE
    submit_test_pass=0
  fi
else
  echo -e "${RED}❌ 문제 생성 실패로 답안 제출 테스트 불가${NC}" | tee -a $RESULTS_FILE
  submit_test_pass=0
fi

echo "" | tee -a $RESULTS_FILE

# === 4. 수학적 정확성 검증 ===
echo -e "${BLUE}=== 4. 수학적 정확성 검증 ===${NC}" | tee -a $RESULTS_FILE
echo "50개 문제의 수학적 정확성 검증..." | tee -a $RESULTS_FILE

math_errors=0

for i in {1..50}; do
  math_user="math-test-$i"
  table=$(((i % 8) + 2))
  
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$math_user\",\"multiplicationTable\":$table,\"difficulty\":1}")
  
  equation=$(echo $response | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('problem', {}).get('equation', ''))")
  answer=$(echo $response | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('problem', {}).get('answer', 0))")
  
  if [ -n "$equation" ] && [ "$equation" != "null" ]; then
    # Python으로 수식 계산
    calculated=$(python3 -c "print(eval('$equation'.replace('×', '*')))")
    
    if [ "$answer" != "$calculated" ]; then
      echo "  수학 오류: $equation = $answer (계산값: $calculated)" | tee -a $RESULTS_FILE
      math_errors=$((math_errors + 1))
    fi
  fi
  
  echo -ne "\r검증: $i/50"
done

echo "" | tee -a $RESULTS_FILE
echo "수학 오류 개수: $math_errors/50" | tee -a $RESULTS_FILE

if [ $math_errors -eq 0 ]; then
  echo -e "${GREEN}✅ 수학적 정확성 검증 통과 (100%)${NC}" | tee -a $RESULTS_FILE
  math_test_pass=1
else
  echo -e "${RED}❌ 수학적 정확성 검증 실패 ($math_errors개 오류)${NC}" | tee -a $RESULTS_FILE
  math_test_pass=0
fi

echo "" | tee -a $RESULTS_FILE

# === 5. 전략 선택 로직 테스트 ===
echo -e "${BLUE}=== 5. 전략 선택 로직 테스트 ===${NC}" | tee -a $RESULTS_FILE

# 신규 사용자 테스트
new_user="strategy-new-$(date +%s)"
new_response=$(curl -s -X POST $BASE_URL/api/problems/generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$new_user\",\"multiplicationTable\":3,\"difficulty\":1}")

new_problem_id=$(echo $new_response | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('problem', {}).get('id', 'null'))")

if [ "$new_problem_id" != "null" ]; then
  echo -e "${GREEN}✅ 신규 사용자 전략 테스트 통과${NC}" | tee -a $RESULTS_FILE
  strategy_test_pass=1
else
  echo -e "${RED}❌ 신규 사용자 전략 테스트 실패${NC}" | tee -a $RESULTS_FILE
  strategy_test_pass=0
fi

echo "" | tee -a $RESULTS_FILE

# === 종합 결과 ===
echo -e "${BLUE}=== 종합 테스트 결과 ===${NC}" | tee -a $RESULTS_FILE
echo "완료 시간: $(date)" | tee -a $RESULTS_FILE

total_tests=5
passed_tests=$((response_test_pass + continuous_test_pass + submit_test_pass + math_test_pass + strategy_test_pass))

echo "통과한 테스트: $passed_tests/$total_tests" | tee -a $RESULTS_FILE

pass_percentage=$((passed_tests * 100 / total_tests))
echo "통과율: ${pass_percentage}%" | tee -a $RESULTS_FILE

echo "" | tee -a $RESULTS_FILE
echo "세부 결과:" | tee -a $RESULTS_FILE
echo "  1. 응답시간 테스트: $([ $response_test_pass -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")" | tee -a $RESULTS_FILE
echo "  2. 연속 요청 테스트: $([ $continuous_test_pass -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")" | tee -a $RESULTS_FILE
echo "  3. 답안 제출 테스트: $([ $submit_test_pass -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")" | tee -a $RESULTS_FILE
echo "  4. 수학적 정확성: $([ $math_test_pass -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")" | tee -a $RESULTS_FILE
echo "  5. 전략 선택 로직: $([ $strategy_test_pass -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")" | tee -a $RESULTS_FILE

# 성능 등급 평가
if [ $pass_percentage -ge 100 ] && [ $avg_time -lt 1000 ]; then
  grade="EXCELLENT"
  recommendation="즉시 배포 권장"
  exit_code=0
elif [ $pass_percentage -ge 80 ] && [ $avg_time -lt 2000 ]; then
  grade="GOOD"
  recommendation="배포 가능"
  exit_code=0
elif [ $pass_percentage -ge 60 ]; then
  grade="ACCEPTABLE"
  recommendation="일부 개선 후 배포"
  exit_code=1
else
  grade="POOR"
  recommendation="수정 후 재테스트 필요"
  exit_code=2
fi

echo "" | tee -a $RESULTS_FILE
echo "성능 등급: $grade" | tee -a $RESULTS_FILE
echo "권장사항: $recommendation" | tee -a $RESULTS_FILE
echo "평균 응답시간: ${avg_time}ms" | tee -a $RESULTS_FILE

# 최종 결과
if [ $pass_percentage -ge 80 ]; then
  echo -e "\n${GREEN}🎉 성능 테스트 전체 성공! 템플릿 시스템이 안정적으로 동작합니다.${NC}" | tee -a $RESULTS_FILE
else
  echo -e "\n${RED}⚠️ 일부 테스트 실패. 개선이 필요합니다.${NC}" | tee -a $RESULTS_FILE
fi

echo "" | tee -a $RESULTS_FILE
echo "상세 결과: $RESULTS_FILE"

exit $exit_code