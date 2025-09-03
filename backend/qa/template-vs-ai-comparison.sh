#!/bin/bash

# 템플릿 vs AI 생성 비교 테스트
# 사용법: ./template-vs-ai-comparison.sh [base_url]

BASE_URL=${1:-"http://localhost:3001"}
COMPARISON_RESULTS="./qa/template-vs-ai-$(date +%Y%m%d-%H%M%S).json"

echo "=== 템플릿 vs AI 생성 비교 테스트 ==="
echo "결과 파일: $COMPARISON_RESULTS"
echo ""

# 결과 JSON 초기화
cat > $COMPARISON_RESULTS << 'EOF'
{
  "testInfo": {
    "timestamp": "",
    "baseUrl": "",
    "totalSamples": 20
  },
  "templateGeneration": {
    "samples": [],
    "performance": {
      "totalTime": 0,
      "averageTime": 0,
      "minTime": 999999,
      "maxTime": 0
    },
    "qualityMetrics": {
      "mathematicalAccuracy": 0,
      "storyNaturalness": [],
      "hintClarity": []
    }
  },
  "aiGeneration": {
    "samples": [],
    "performance": {
      "totalTime": 0,
      "averageTime": 0,
      "minTime": 999999,
      "maxTime": 0
    },
    "qualityMetrics": {
      "mathematicalAccuracy": 0,
      "storyNaturalness": [],
      "hintClarity": []
    }
  },
  "comparison": {
    "performanceRatio": 0,
    "qualityComparison": "",
    "recommendation": ""
  }
}
EOF

# 타임스탬프 및 기본 정보 업데이트
jq --arg timestamp "$(date -Iseconds)" \
   --arg baseUrl "$BASE_URL" \
   '.testInfo.timestamp = $timestamp | .testInfo.baseUrl = $baseUrl' \
   $COMPARISON_RESULTS > temp.json && mv temp.json $COMPARISON_RESULTS

# === 템플릿 기반 생성 테스트 ===
echo "=== 템플릿 기반 생성 테스트 (10개 샘플) ==="

template_total_time=0
template_math_correct=0

for i in {1..10}; do
  echo -n "템플릿 생성 $i/10... "
  
  # 충분한 템플릿을 가진 사용자 시뮬레이션 
  user_id="template-test-user-$i"
  table=$((RANDOM % 8 + 2))  # 2-9 랜덤
  
  start=$(date +%s%3N)
  
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":$table,\"difficulty\":1}")
  
  end=$(date +%s%3N)
  time_taken=$((end - start))
  template_total_time=$((template_total_time + time_taken))
  
  # 응답 파싱
  problem_id=$(echo $response | jq -r '.problem.id')
  story=$(echo $response | jq -r '.problem.story')
  equation=$(echo $response | jq -r '.problem.equation')
  answer=$(echo $response | jq '.problem.answer')
  pokemon_name=$(echo $response | jq -r '.pokemon.koreanName')
  
  # 수학적 정확성 검증
  if command -v bc > /dev/null; then
    calculated=$(echo "$equation" | bc 2>/dev/null)
    if [ "$answer" = "$calculated" ]; then
      template_math_correct=$((template_math_correct + 1))
    fi
  fi
  
  # JSON에 샘플 추가
  sample_data=$(jq -n \
    --argjson index "$i" \
    --arg story "$story" \
    --arg equation "$equation" \
    --argjson answer "$answer" \
    --arg pokemon "$pokemon_name" \
    --argjson responseTime "$time_taken" \
    '{
      "index": $index,
      "story": $story,
      "equation": $equation,
      "answer": $answer,
      "pokemon": $pokemon,
      "responseTime": $responseTime
    }')
  
  jq --argjson sample "$sample_data" \
     '.templateGeneration.samples += [$sample]' \
     $COMPARISON_RESULTS > temp.json && mv temp.json $COMPARISON_RESULTS
  
  echo "${time_taken}ms"
done

# 템플릿 성능 통계 업데이트
template_avg=$((template_total_time / 10))
jq --argjson total "$template_total_time" \
   --argjson avg "$template_avg" \
   --argjson accuracy "$template_math_correct" \
   '.templateGeneration.performance.totalTime = $total |
    .templateGeneration.performance.averageTime = $avg |
    .templateGeneration.qualityMetrics.mathematicalAccuracy = $accuracy' \
   $COMPARISON_RESULTS > temp.json && mv temp.json $COMPARISON_RESULTS

echo "템플릿 생성 완료 - 평균 ${template_avg}ms, 정확도: ${template_math_correct}/10"
echo ""

# === AI 기반 생성 테스트 ===
echo "=== AI 기반 생성 테스트 (10개 샘플) ==="

ai_total_time=0
ai_math_correct=0

for i in {1..10}; do
  echo -n "AI 생성 $i/10... "
  
  # 신규 사용자 (AI 전략 유도)
  user_id="ai-test-user-$i"
  table=$((RANDOM % 8 + 2))  # 2-9 랜덤
  
  start=$(date +%s%3N)
  
  response=$(curl -s -X POST $BASE_URL/api/problems/generate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$user_id\",\"multiplicationTable\":$table,\"difficulty\":1}")
  
  end=$(date +%s%3N)
  time_taken=$((end - start))
  ai_total_time=$((ai_total_time + time_taken))
  
  # 응답 파싱
  story=$(echo $response | jq -r '.problem.story')
  equation=$(echo $response | jq -r '.problem.equation')
  answer=$(echo $response | jq '.problem.answer')
  pokemon_name=$(echo $response | jq -r '.pokemon.koreanName')
  
  # 수학적 정확성 검증
  if command -v bc > /dev/null; then
    calculated=$(echo "$equation" | bc 2>/dev/null)
    if [ "$answer" = "$calculated" ]; then
      ai_math_correct=$((ai_math_correct + 1))
    fi
  fi
  
  # JSON에 샘플 추가
  sample_data=$(jq -n \
    --argjson index "$i" \
    --arg story "$story" \
    --arg equation "$equation" \
    --argjson answer "$answer" \
    --arg pokemon "$pokemon_name" \
    --argjson responseTime "$time_taken" \
    '{
      "index": $index,
      "story": $story,
      "equation": $equation,  
      "answer": $answer,
      "pokemon": $pokemon,
      "responseTime": $responseTime
    }')
  
  jq --argjson sample "$sample_data" \
     '.aiGeneration.samples += [$sample]' \
     $COMPARISON_RESULTS > temp.json && mv temp.json $COMPARISON_RESULTS
  
  echo "${time_taken}ms"
done

# AI 성능 통계 업데이트
ai_avg=$((ai_total_time / 10))
jq --argjson total "$ai_total_time" \
   --argjson avg "$ai_avg" \
   --argjson accuracy "$ai_math_correct" \
   '.aiGeneration.performance.totalTime = $total |
    .aiGeneration.performance.averageTime = $avg |
    .aiGeneration.qualityMetrics.mathematicalAccuracy = $accuracy' \
   $COMPARISON_RESULTS > temp.json && mv temp.json $COMPARISON_RESULTS

echo "AI 생성 완료 - 평균 ${ai_avg}ms, 정확도: ${ai_math_correct}/10"
echo ""

# === 비교 분석 ===
echo "=== 성능 및 품질 비교 분석 ==="

# 성능 비교
if [ $ai_avg -gt 0 ]; then
  performance_ratio=$(echo "scale=2; $template_avg / $ai_avg" | bc)
else
  performance_ratio="N/A"
fi

echo "템플릿 평균 응답시간: ${template_avg}ms"
echo "AI 평균 응답시간: ${ai_avg}ms" 
echo "성능 비율 (템플릿/AI): $performance_ratio"

if [ $(echo "$performance_ratio < 1" | bc -l) -eq 1 ]; then
  echo "✅ 템플릿이 AI보다 빠름"
  performance_result="Template is faster"
else
  echo "❌ 템플릿이 AI보다 느림"  
  performance_result="AI is faster"
fi

# 정확도 비교
echo "템플릿 수학 정확도: ${template_math_correct}/10 ($(($template_math_correct * 10))%)"
echo "AI 수학 정확도: ${ai_math_correct}/10 ($(($ai_math_correct * 10))%)"

if [ $template_math_correct -ge $ai_math_correct ]; then
  echo "✅ 템플릿 정확도가 AI와 동등하거나 우수"
  quality_result="Template accuracy is equal or better"
else
  echo "❌ 템플릿 정확도가 AI보다 낮음"
  quality_result="AI accuracy is better"
fi

# 최종 비교 결과 업데이트
jq --argjson ratio "$performance_ratio" \
   --arg quality "$quality_result" \
   --arg recommendation "$performance_result" \
   '.comparison.performanceRatio = $ratio |
    .comparison.qualityComparison = $quality |
    .comparison.recommendation = $recommendation' \
   $COMPARISON_RESULTS > temp.json && mv temp.json $COMPARISON_RESULTS

echo ""
echo "=== 상세 분석 ===

# 문제 다양성 분석
echo "템플릿 문제 패턴 분석:"
jq -r '.templateGeneration.samples[].story' $COMPARISON_RESULTS | \
  sed 's/[0-9]/NUM/g' | sed 's/[가-힣]*츄/포켓몬/g' | \
  sort | uniq -c | sort -nr

echo ""
echo "AI 문제 패턴 분석:"
jq -r '.aiGeneration.samples[].story' $COMPARISON_RESULTS | \
  sed 's/[0-9]/NUM/g' | sed 's/[가-힣]*츄/포켓몬/g' | \
  sort | uniq -c | sort -nr

echo ""
echo "=== 테스트 완료 ==="
echo "상세 결과: $COMPARISON_RESULTS"

# 최종 권장사항
if [ $(echo "$performance_ratio < 1" | bc -l) -eq 1 ] && [ $template_math_correct -eq 10 ]; then
  echo "✅ 권장사항: 템플릿 시스템이 성능과 정확성 모두 우수함. 배포 권장."
  exit 0
elif [ $template_math_correct -eq 10 ]; then
  echo "⚠️ 권장사항: 정확성은 우수하나 성능 개선 필요. 조건부 배포 권장."
  exit 1
else
  echo "❌ 권장사항: 정확성 또는 성능에 문제 있음. 수정 후 재테스트 필요."
  exit 2
fi