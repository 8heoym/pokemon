import { ProblemTemplateService, RenderedProblem } from '../src/services/ProblemTemplateService';
import { HybridProblemService } from '../src/services/HybridProblemService';
import { supabase } from '../src/config/supabase';
import { v4 as uuidv4 } from 'uuid';

describe('Template System Tests', () => {
  let templateService: ProblemTemplateService;
  let hybridService: HybridProblemService;
  let testUserId: string;
  let testTemplateId: string;

  beforeAll(async () => {
    templateService = new ProblemTemplateService();
    hybridService = new HybridProblemService();
    testUserId = `test-user-${uuidv4()}`;
    
    // 테스트용 템플릿 생성
    const testTemplate = {
      name: '테스트 템플릿',
      category: 'TEST_GROUP',
      storyTemplate: '{pokemon}가 {a}마리씩 {b}그룹에 있어요. 모두 몇 마리일까요?',
      hintTemplate: '{a} × {b}를 계산해보세요!',
      equationTemplate: '{a} × {b}',
      variables: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 } },
      units: ['마리'],
      applicableTables: [2, 3, 4, 5, 6, 7, 8, 9],
      difficulty: 1 as const,
      qualityScore: 1.0,
      isActive: true
    };

    const createdTemplate = await templateService.createTemplate(testTemplate);
    testTemplateId = createdTemplate.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await supabase.from('user_template_history').delete().eq('user_id', testUserId);
    await supabase.from('problem_instances').delete().eq('user_id', testUserId);
    await supabase.from('user_answers').delete().eq('user_id', testUserId);
    await supabase.from('problem_templates').delete().eq('id', testTemplateId);
  });

  describe('ProblemTemplateService Unit Tests', () => {
    test('UT-001: 템플릿 변수 생성 테스트', async () => {
      const template = await supabase
        .from('problem_templates')
        .select('*')
        .eq('id', testTemplateId)
        .single();

      const mockPokemon = { id: 1, name: 'pikachu', koreanName: '피카츄' };
      const multiplicationTable = 3;

      const result = await templateService.renderProblem(
        templateService['convertToTemplateType'](template.data),
        mockPokemon as any,
        multiplicationTable,
        testUserId
      );

      // 변수 a는 구구단 숫자와 일치해야 함
      expect(result.variablesUsed.a).toBe(3);
      expect(result.variablesUsed.b).toBeGreaterThanOrEqual(2);
      expect(result.variablesUsed.b).toBeLessThanOrEqual(9);
      expect(result.answer).toBe(result.variablesUsed.a * result.variablesUsed.b);
    });

    test('UT-002: 템플릿 내용 렌더링 테스트', async () => {
      const template = await supabase
        .from('problem_templates')
        .select('*')
        .eq('id', testTemplateId)
        .single();

      const mockPokemon = { id: 1, name: 'pikachu', koreanName: '피카츄' };
      const multiplicationTable = 3;

      const result = await templateService.renderProblem(
        templateService['convertToTemplateType'](template.data),
        mockPokemon as any,
        multiplicationTable,
        testUserId
      );

      expect(result.story).toContain('피카츄가');
      expect(result.story).toContain('마리씩');
      expect(result.story).toContain('그룹에');
      expect(result.hint).toContain('×');
      expect(result.equation).toMatch(/^\d+ × \d+$/);
    });

    test('UT-003: 답 계산 검증', async () => {
      const template = await supabase
        .from('problem_templates')
        .select('*')
        .eq('id', testTemplateId)
        .single();

      const mockPokemon = { id: 1, name: 'pikachu', koreanName: '피카츄' };
      const multiplicationTable = 4;

      const result = await templateService.renderProblem(
        templateService['convertToTemplateType'](template.data),
        mockPokemon as any,
        multiplicationTable,
        testUserId
      );

      const expectedAnswer = result.variablesUsed.a * result.variablesUsed.b;
      expect(result.answer).toBe(expectedAnswer);
      
      // 구구단 확인
      expect(result.variablesUsed.a).toBe(4);
    });

    test('UT-004: 세션 저장 테스트', async () => {
      const mockProblem: RenderedProblem = {
        id: uuidv4(),
        story: '테스트 문제',
        hint: '테스트 힌트',
        equation: '3 × 4',
        answer: 12,
        multiplicationTable: 3,
        pokemonId: 1,
        difficulty: 1,
        templateId: testTemplateId,
        variablesUsed: { a: 3, b: 4 }
      };

      await templateService.saveToSession(testUserId, mockProblem);

      const savedProblem = await templateService.getProblemFromSession(testUserId, mockProblem.id);
      expect(savedProblem).toBeTruthy();
      expect(savedProblem!.id).toBe(mockProblem.id);
      expect(savedProblem!.answer).toBe(12);
    });

    test('UT-005: 세션 조회 테스트', async () => {
      const mockProblem: RenderedProblem = {
        id: uuidv4(),
        story: '세션 조회 테스트',
        hint: '테스트 힌트',
        equation: '2 × 5',
        answer: 10,
        multiplicationTable: 2,
        pokemonId: 1,
        difficulty: 1,
        templateId: testTemplateId,
        variablesUsed: { a: 2, b: 5 }
      };

      await templateService.saveToSession(testUserId, mockProblem);
      const retrievedProblem = await templateService.getProblemFromSession(testUserId, mockProblem.id);

      expect(retrievedProblem).toBeTruthy();
      expect(retrievedProblem!.story).toBe('세션 조회 테스트');
    });

    test('UT-006: 세션 만료 테스트', async () => {
      // 만료된 세션 시뮬레이션 (expires_at을 과거로 설정)
      const expiredProblemId = uuidv4();
      await supabase.from('problem_instances').insert({
        id: expiredProblemId,
        user_id: testUserId,
        template_id: testTemplateId,
        pokemon_id: 1,
        story: '만료된 문제',
        hint: '만료된 힌트',
        equation: '1 × 1',
        answer: 1,
        variables_used: { a: 1, b: 1 },
        multiplication_table: 1,
        difficulty: 1,
        expires_at: new Date(Date.now() - 60000) // 1분 전 만료
      });

      const expiredProblem = await templateService.getProblemFromSession(testUserId, expiredProblemId);
      expect(expiredProblem).toBeNull();
    });
  });

  describe('HybridProblemService Unit Tests', () => {
    test('UT-101: 전략 결정 - 템플릿 우선', async () => {
      // 충분한 템플릿 환경 시뮬레이션
      jest.spyOn(templateService, 'getAvailableTemplates').mockResolvedValue([
        { applicableTables: [3] } as any,
        { applicableTables: [3] } as any,
        { applicableTables: [3] } as any,
        { applicableTables: [3] } as any
      ]);

      const strategy = await hybridService['decideGenerationStrategy'](testUserId, 3, 1);
      expect(strategy).toBe('TEMPLATE_PRIORITY');
    });

    test('UT-102: 전략 결정 - 하이브리드', async () => {
      // 템플릿 1개 + 숙련 사용자 시뮬레이션
      jest.spyOn(templateService, 'getAvailableTemplates').mockResolvedValue([
        { applicableTables: [3] } as any
      ]);
      
      jest.spyOn(hybridService as any, 'getUserSolvedCount').mockResolvedValue(15);

      const strategy = await hybridService['decideGenerationStrategy'](testUserId, 3, 1);
      expect(strategy).toBe('HYBRID_ENHANCED');
    });

    test('UT-103: 전략 결정 - AI 전용', async () => {
      // 템플릿 없음 + 신규 사용자
      jest.spyOn(templateService, 'getAvailableTemplates').mockResolvedValue([]);
      jest.spyOn(hybridService as any, 'getUserSolvedCount').mockResolvedValue(0);

      const strategy = await hybridService['decideGenerationStrategy'](testUserId, 3, 1);
      expect(strategy).toBe('AI_PERSONALIZED');
    });

    test('UT-106: 답안 검증 로직', async () => {
      // 테스트 문제 생성
      const mockProblem: RenderedProblem = {
        id: uuidv4(),
        story: '답안 검증 테스트',
        hint: '테스트 힌트',
        equation: '3 × 4',
        answer: 12,
        multiplicationTable: 3,
        pokemonId: 1,
        difficulty: 1,
        templateId: testTemplateId,
        variablesUsed: { a: 3, b: 4 }
      };

      await templateService.saveToSession(testUserId, mockProblem);

      // 정답 제출
      const correctResult = await hybridService.submitAnswer(testUserId, mockProblem.id, 12, 30, 0);
      expect(correctResult.isCorrect).toBe(true);

      // 새 세션 생성 (이전 세션이 답변 완료됨)
      await templateService.saveToSession(testUserId, { ...mockProblem, id: uuidv4() });

      // 오답 제출  
      const incorrectResult = await hybridService.submitAnswer(testUserId, mockProblem.id, 10, 30, 0);
      expect(incorrectResult.isCorrect).toBe(false);
      expect(incorrectResult.correctAnswer).toBe(12);
    });

    test('UT-107: 경험치 계산', () => {
      const experience1 = hybridService['calculateExperience'](1, 15);
      const experience2 = hybridService['calculateExperience'](2, 15);
      const experience3 = hybridService['calculateExperience'](3, 15);

      expect(experience1).toBe(25); // 10 + 15
      expect(experience2).toBe(35); // 20 + 15  
      expect(experience3).toBe(45); // 30 + 15

      // 시간에 따른 보너스 확인
      const fastSolve = hybridService['calculateExperience'](1, 10);
      const slowSolve = hybridService['calculateExperience'](1, 35);

      expect(fastSolve).toBeGreaterThan(slowSolve);
    });
  });

  describe('Integration Tests', () => {
    test('IT-001: 정상적인 문제 생성 통합 테스트', async () => {
      const response = await fetch('http://localhost:3001/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          multiplicationTable: 3,
          difficulty: 1
        })
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.problem).toBeDefined();
      expect(data.pokemon).toBeDefined();
      expect(data.problem.id).toBeDefined();
      expect(data.problem.answer).toBeGreaterThan(0);
      expect(data.problem.multiplicationTable).toBe(3);
    });

    test('IT-101: 정답 제출 통합 테스트', async () => {
      // 1. 문제 생성
      const generateResponse = await fetch('http://localhost:3001/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          multiplicationTable: 3,
          difficulty: 1
        })
      });

      const generateData = await generateResponse.json();
      const problemId = generateData.problem.id;
      const correctAnswer = generateData.problem.answer;

      // 2. 정답 제출
      const submitResponse = await fetch('http://localhost:3001/api/problems/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          problemId: problemId,
          answer: correctAnswer,
          timeSpent: 25
        })
      });

      expect(submitResponse.status).toBe(200);
      
      const submitData = await submitResponse.json();
      expect(submitData.isCorrect).toBe(true);
      expect(submitData.experienceGained).toBeGreaterThan(0);
    });
  });

  describe('Boundary Value Tests', () => {
    test.each([
      [1, 400],   // 최소값 미만
      [2, 200],   // 최소 유효값
      [9, 200],   // 최대 유효값
      [10, 400],  // 최대값 초과
      [-1, 400],  // 음수
      [0, 400]    // 0
    ])('BT-%s: 구구단 범위 테스트 - multiplicationTable: %d', async (table, expectedStatus) => {
      const response = await fetch('http://localhost:3001/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          multiplicationTable: table,
          difficulty: 1
        })
      });

      expect(response.status).toBe(expectedStatus);
    });
  });

  describe('Error Handling Tests', () => {
    test('ET-001: 사용 가능한 템플릿 없음', async () => {
      // 모든 템플릿 비활성화
      await supabase
        .from('problem_templates')
        .update({ is_active: false })
        .eq('id', testTemplateId);

      const response = await fetch('http://localhost:3001/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: `no-template-user-${uuidv4()}`,
          multiplicationTable: 3,
          difficulty: 1
        })
      });

      // AI 폴백으로 여전히 정상 응답이어야 함
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.problem).toBeDefined();

      // 템플릿 재활성화
      await supabase
        .from('problem_templates')
        .update({ is_active: true })
        .eq('id', testTemplateId);
    });

    test('ET-103: 만료된 문제 제출', async () => {
      const expiredProblemId = uuidv4();
      
      const response = await fetch('http://localhost:3001/api/problems/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          problemId: expiredProblemId,
          answer: 12
        })
      });

      const data = await response.json();
      expect(data.feedback).toContain('만료되었거나 찾을 수 없습니다');
    });
  });

  describe('Session Management Tests', () => {
    test('DT-001: 동일 사용자 여러 문제 생성', async () => {
      const uniqueUserId = `session-test-${uuidv4()}`;

      // 첫 번째 문제 생성
      await fetch('http://localhost:3001/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uniqueUserId,
          multiplicationTable: 3,
          difficulty: 1
        })
      });

      // 두 번째 문제 생성
      await fetch('http://localhost:3001/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uniqueUserId,
          multiplicationTable: 4,
          difficulty: 1
        })
      });

      // 활성 세션 수 확인
      const { data, error } = await supabase
        .from('problem_instances')
        .select('*')
        .eq('user_id', uniqueUserId)
        .eq('is_answered', false)
        .gt('expires_at', new Date().toISOString());

      expect(data?.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance Tests', () => {
    test('PT-001: 템플릿 문제 생성 응답시간', async () => {
      const startTime = Date.now();

      const response = await fetch('http://localhost:3001/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: `perf-test-${uuidv4()}`,
          multiplicationTable: 3,
          difficulty: 1
        })
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000); // 2초 이내
    });

    test('PT-003: 답안 제출 처리 시간', async () => {
      // 문제 먼저 생성
      const generateResponse = await fetch('http://localhost:3001/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          multiplicationTable: 3,
          difficulty: 1
        })
      });

      const generateData = await generateResponse.json();
      
      const startTime = Date.now();

      const submitResponse = await fetch('http://localhost:3001/api/problems/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          problemId: generateData.problem.id,
          answer: generateData.problem.answer,
          timeSpent: 30
        })
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(submitResponse.status).toBe(200);
      expect(responseTime).toBeLessThan(500); // 0.5초 이내
    });
  });
});