import { Request, Response } from 'express';
import { sessionCacheService } from '../services/SessionCacheService';

export class SessionController {
  
  // 세션 캐시 통계 조회
  async getSessionStats(req: Request, res: Response) {
    try {
      console.log('📊 세션 캐시 통계 조회...');
      
      const stats = sessionCacheService.getCacheStats();
      
      res.json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ 세션 통계 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '세션 통계 조회 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }

  // 특정 사용자의 활성 세션 조회
  async getUserSessions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: '사용자 ID가 필요합니다.'
        });
      }

      console.log(`👤 사용자 ${userId} 활성 세션 조회...`);
      
      const sessions = sessionCacheService.getUserSessions(userId);
      
      // 민감한 정보 제거 후 반환
      const safeSessions = sessions.map(session => ({
        problemId: session.problemId,
        createdAt: new Date(session.createdAt).toISOString(),
        expiresAt: new Date(session.expiresAt).toISOString(),
        accessCount: session.accessCount,
        lastAccessed: new Date(session.accessed).toISOString(),
        multiplicationTable: session.problem.multiplicationTable,
        difficulty: session.problem.difficulty
      }));

      res.json({
        success: true,
        userId,
        activeSessions: safeSessions,
        totalSessions: sessions.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ 사용자 세션 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '사용자 세션 조회 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }

  // 세션 캐시 수동 정리
  async cleanupSessions(req: Request, res: Response) {
    try {
      console.log('🧹 세션 캐시 수동 정리 시작...');
      
      const result = await sessionCacheService.cleanup();
      
      res.json({
        success: true,
        message: '세션 캐시 정리가 완료되었습니다.',
        result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ 세션 캐시 정리 실패:', error);
      res.status(500).json({
        success: false,
        error: '세션 캐시 정리 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }

  // 특정 사용자 세션 모두 삭제
  async clearUserSessions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: '사용자 ID가 필요합니다.'
        });
      }

      console.log(`🗑️ 사용자 ${userId} 세션 모두 삭제...`);
      
      const deletedCount = sessionCacheService.clearUserSessions(userId);
      
      res.json({
        success: true,
        message: `사용자 ${userId}의 ${deletedCount}개 세션이 삭제되었습니다.`,
        deletedCount,
        userId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ 사용자 세션 삭제 실패:', error);
      res.status(500).json({
        success: false,
        error: '사용자 세션 삭제 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }

  // 전체 캐시 초기화 (개발/테스트용)
  async clearAllSessions(req: Request, res: Response) {
    try {
      console.log('🗑️ 전체 세션 캐시 초기화...');
      
      sessionCacheService.clearAll();
      
      res.json({
        success: true,
        message: '전체 세션 캐시가 초기화되었습니다.',
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ 전체 세션 캐시 초기화 실패:', error);
      res.status(500).json({
        success: false,
        error: '전체 세션 캐시 초기화 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }

  // 세션 성능 테스트
  async performanceTest(req: Request, res: Response) {
    try {
      console.log('⚡ 세션 성능 테스트 시작...');
      
      const testUserId = `test_user_${Date.now()}`;
      const testProblemId = `test_problem_${Date.now()}`;
      
      // 더미 문제 데이터
      const dummyProblem = {
        id: testProblemId,
        story: '테스트 문제입니다.',
        hint: '테스트 힌트입니다.',
        equation: '2 × 3 = ?',
        answer: 6,
        multiplicationTable: 2,
        pokemonId: 25,
        difficulty: 1 as 1 | 2 | 3,
        templateId: 'test_template',
        variablesUsed: { a: 2, b: 3, answer: 6 },
        visualElements: {}
      };

      // 성능 측정
      const tests = [];

      // 1. 세션 저장 테스트
      const saveStart = performance.now();
      await sessionCacheService.saveSession(testUserId, dummyProblem);
      const saveTime = performance.now() - saveStart;
      tests.push({ operation: 'Session Save', time: saveTime });

      // 2. 세션 조회 테스트 (캐시 히트)
      const getStart = performance.now();
      await sessionCacheService.getSession(testUserId, testProblemId);
      const getTime = performance.now() - getStart;
      tests.push({ operation: 'Session Get (Cache Hit)', time: getTime });

      // 3. 세션 완료 테스트
      const completeStart = performance.now();
      await sessionCacheService.markSessionCompleted(testUserId, testProblemId);
      const completeTime = performance.now() - completeStart;
      tests.push({ operation: 'Session Complete', time: completeTime });

      // 4. 세션 조회 테스트 (캐시 미스)
      const missStart = performance.now();
      await sessionCacheService.getSession(testUserId, testProblemId);
      const missTime = performance.now() - missStart;
      tests.push({ operation: 'Session Get (Cache Miss)', time: missTime });

      const totalTime = tests.reduce((sum, test) => sum + test.time, 0);
      const avgTime = totalTime / tests.length;

      res.json({
        success: true,
        message: '세션 성능 테스트가 완료되었습니다.',
        results: {
          tests: tests.map(test => ({
            operation: test.operation,
            time: `${test.time.toFixed(2)}ms`
          })),
          summary: {
            totalTime: `${totalTime.toFixed(2)}ms`,
            averageTime: `${avgTime.toFixed(2)}ms`,
            performance: avgTime < 1 ? 'Excellent' : avgTime < 5 ? 'Good' : 'Needs Improvement'
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ 세션 성능 테스트 실패:', error);
      res.status(500).json({
        success: false,
        error: '세션 성능 테스트 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }
}