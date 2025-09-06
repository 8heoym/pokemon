// Node.js 18+ 내장 fetch 사용

const API_BASE = 'http://localhost:3001/api';

// 성능 측정 유틸리티
function measureTime(name) {
  const start = process.hrtime.bigint();
  return {
    end: () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // 나노초 → 밀리초
      console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
  };
}

// 테스트 사용자 생성
async function createTestUser() {
  try {
    console.log('\n🧪 테스트 사용자 생성 중...');
    const timer = measureTime('사용자 생성');
    
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: `test_user_${Date.now()}` })
    });
    
    const data = await response.json();
    
    const duration = timer.end();
    return { user: data, duration };
  } catch (error) {
    console.error('사용자 생성 실패:', error.message);
    return null;
  }
}

// 문제 생성 성능 테스트
async function testProblemGeneration(userId, multiplicationTable = 2) {
  try {
    console.log(`\n📝 문제 생성 테스트 (${multiplicationTable}단)...`);
    const timer = measureTime('문제 생성');
    
    const response = await fetch(`${API_BASE}/problems/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, multiplicationTable, difficulty: 1 })
    });
    
    const data = await response.json();
    
    const duration = timer.end();
    return { problem: data, duration };
  } catch (error) {
    console.error('문제 생성 실패:', error.message);
    return null;
  }
}

// 답변 제출 성능 테스트
async function testAnswerSubmission(userId, problemId, answer) {
  try {
    console.log('\n✅ 답변 제출 테스트...');
    const timer = measureTime('답변 제출');
    
    const response = await fetch(`${API_BASE}/problems/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, problemId, answer, timeSpent: 5, hintsUsed: 0 })
    });
    
    const data = await response.json();
    
    const duration = timer.end();
    return { result: data, duration };
  } catch (error) {
    console.error('답변 제출 실패:', error.message);
    return null;
  }
}

// 성능 상태 조회
async function checkPerformanceStatus() {
  try {
    console.log('\n📊 성능 최적화 상태 확인...');
    const timer = measureTime('성능 상태 조회');
    
    const response = await fetch(`${API_BASE}/performance/status`);
    const data = await response.json();
    const duration = timer.end();
    
    console.log('성능 최적화 상태:', data.status);
    return duration;
  } catch (error) {
    console.error('성능 상태 조회 실패:', error.message);
    return null;
  }
}

// 부하 테스트 (동시 요청)
async function loadTest(userId, concurrentRequests = 5) {
  console.log(`\n🚀 부하 테스트 (동시 ${concurrentRequests}개 요청)...`);
  
  const timer = measureTime('부하 테스트');
  
  const promises = Array.from({ length: concurrentRequests }, (_, i) => 
    testProblemGeneration(userId, (i % 8) + 2) // 2단~9단 순환
  );
  
  try {
    const results = await Promise.all(promises);
    const duration = timer.end();
    
    const successCount = results.filter(r => r !== null).length;
    const avgDuration = results
      .filter(r => r !== null)
      .reduce((sum, r) => sum + r.duration, 0) / successCount;
    
    console.log(`📊 부하 테스트 결과:`);
    console.log(`   - 성공률: ${successCount}/${concurrentRequests} (${(successCount/concurrentRequests*100).toFixed(1)}%)`);
    console.log(`   - 평균 응답시간: ${avgDuration.toFixed(2)}ms`);
    console.log(`   - 전체 소요시간: ${duration.toFixed(2)}ms`);
    
    return { successCount, avgDuration, totalDuration: duration };
  } catch (error) {
    console.error('부하 테스트 실패:', error.message);
    return null;
  }
}

// 전체 성능 테스트 실행
async function runPerformanceTests() {
  console.log('🎯 포켓몬 수학 모험 - 성능 테스트 시작');
  console.log('='.repeat(60));
  
  // 성능 상태 확인
  await checkPerformanceStatus();
  
  // 테스트 사용자 생성
  const userResult = await createTestUser();
  if (!userResult) {
    console.error('❌ 테스트 중단: 사용자 생성 실패');
    return;
  }
  
  const userId = userResult.user.id;
  console.log(`✅ 테스트 사용자 생성: ${userResult.user.nickname || 'unknown'} (${userResult.duration.toFixed(2)}ms)`);
  
  // 개별 기능 테스트
  const problemResult = await testProblemGeneration(userId, 3);
  if (!problemResult) {
    console.error('❌ 테스트 중단: 문제 생성 실패');
    return;
  }
  
  console.log('문제 생성 결과:', JSON.stringify(problemResult.problem, null, 2));
  
  const answerResult = await testAnswerSubmission(
    userId, 
    problemResult.problem.problem?.id || problemResult.problem.id, 
    problemResult.problem.problem?.answer || problemResult.problem.answer
  );
  
  if (!answerResult) {
    console.error('❌ 테스트 중단: 답변 제출 실패');
    return;
  }
  
  // 부하 테스트
  await loadTest(userId, 10);
  
  console.log('\n🎉 성능 테스트 완료!');
  console.log('='.repeat(60));
  
  // 결과 요약
  console.log('\n📊 성능 테스트 결과 요약:');
  console.log(`   • 사용자 생성: ${userResult.duration.toFixed(2)}ms`);
  console.log(`   • 문제 생성: ${problemResult.duration.toFixed(2)}ms`);
  console.log(`   • 답변 제출: ${answerResult.duration.toFixed(2)}ms`);
  
  const totalTime = userResult.duration + problemResult.duration + answerResult.duration;
  console.log(`   • 전체 플로우: ${totalTime.toFixed(2)}ms`);
  
  // 성능 평가
  if (problemResult.duration < 1000 && answerResult.duration < 500) {
    console.log('✅ 성능 목표 달성! (문제 생성 < 1s, 답변 제출 < 0.5s)');
  } else {
    console.log('⚠️  성능 목표 미달성. 추가 최적화 필요.');
  }
}

// 스크립트 실행
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { runPerformanceTests };