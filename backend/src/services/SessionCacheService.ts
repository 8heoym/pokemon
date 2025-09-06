import { RenderedProblem } from './ProblemTemplateService';

// 🚀 메모리 기반 세션 캐시 서비스
export class SessionCacheService {
  private cache: Map<string, CachedSession> = new Map();
  private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1시간
  private readonly MAX_PROBLEMS_PER_USER = 5; // 사용자당 최대 5개 문제
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // 10분마다 정리

  constructor() {
    // 주기적 캐시 정리 시작
    this.startCleanupTimer();
    console.log('🎯 SessionCacheService 초기화 완료');
  }

  // 세션 저장 (초고속)
  async saveSession(userId: string, problem: RenderedProblem): Promise<void> {
    try {
      const sessionKey = this.generateSessionKey(userId, problem.id);
      const expiresAt = Date.now() + this.DEFAULT_TTL;

      const session: CachedSession = {
        userId,
        problemId: problem.id,
        problem,
        createdAt: Date.now(),
        expiresAt,
        accessed: Date.now(),
        accessCount: 0
      };

      this.cache.set(sessionKey, session);

      // 사용자별 문제 수 제한 (백그라운드)
      this.limitUserProblems(userId);

      console.log(`💾 세션 캐시 저장: ${userId} → ${problem.id} (${this.cache.size}개 세션)`);
    } catch (error) {
      console.error('❌ 세션 캐시 저장 실패:', error);
      throw error;
    }
  }

  // 세션 조회 (초고속)
  async getSession(userId: string, problemId: string): Promise<RenderedProblem | null> {
    try {
      const sessionKey = this.generateSessionKey(userId, problemId);
      const session = this.cache.get(sessionKey);

      if (!session) {
        console.log(`❌ 세션 캐시 미스: ${userId} → ${problemId}`);
        return null;
      }

      // 만료 확인
      if (Date.now() > session.expiresAt) {
        this.cache.delete(sessionKey);
        console.log(`⏰ 세션 만료 삭제: ${userId} → ${problemId}`);
        return null;
      }

      // 액세스 통계 업데이트
      session.accessed = Date.now();
      session.accessCount++;

      console.log(`✅ 세션 캐시 히트: ${userId} → ${problemId} (${session.accessCount}번째 접근)`);
      return session.problem;

    } catch (error) {
      console.error('❌ 세션 캐시 조회 실패:', error);
      return null;
    }
  }

  // 세션 완료 처리 (즉시 삭제)
  async markSessionCompleted(userId: string, problemId: string): Promise<boolean> {
    try {
      const sessionKey = this.generateSessionKey(userId, problemId);
      const deleted = this.cache.delete(sessionKey);

      if (deleted) {
        console.log(`🗑️ 세션 완료 삭제: ${userId} → ${problemId}`);
      }

      return deleted;
    } catch (error) {
      console.error('❌ 세션 완료 처리 실패:', error);
      return false;
    }
  }

  // 사용자별 활성 세션 조회
  getUserSessions(userId: string): CachedSession[] {
    const userSessions: CachedSession[] = [];

    for (const [key, session] of this.cache.entries()) {
      if (session.userId === userId && Date.now() <= session.expiresAt) {
        userSessions.push(session);
      }
    }

    return userSessions.sort((a, b) => b.createdAt - a.createdAt); // 최신순
  }

  // 캐시 통계
  getCacheStats() {
    const now = Date.now();
    const sessions = Array.from(this.cache.values());
    
    const active = sessions.filter(s => now <= s.expiresAt).length;
    const expired = sessions.filter(s => now > s.expiresAt).length;
    
    const userGroups = sessions.reduce((acc, session) => {
      acc[session.userId] = (acc[session.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions: this.cache.size,
      activeSessions: active,
      expiredSessions: expired,
      uniqueUsers: Object.keys(userGroups).length,
      averageSessionsPerUser: Object.keys(userGroups).length > 0 ? 
        Object.values(userGroups).reduce((sum, count) => sum + count, 0) / Object.keys(userGroups).length : 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // 캐시 정리
  async cleanup(): Promise<{ deletedSessions: number; memoryFreed: number }> {
    const before = this.cache.size;
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, session] of this.cache.entries()) {
      if (now > session.expiresAt) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    const after = this.cache.size;
    console.log(`🧹 캐시 정리 완료: ${deletedCount}개 세션 삭제 (${before} → ${after})`);

    return {
      deletedSessions: deletedCount,
      memoryFreed: deletedCount * 1024 // 추정치
    };
  }

  // Private 메서드들
  private generateSessionKey(userId: string, problemId: string): string {
    return `session:${userId}:${problemId}`;
  }

  private limitUserProblems(userId: string): void {
    const userSessions = this.getUserSessions(userId);
    
    if (userSessions.length > this.MAX_PROBLEMS_PER_USER) {
      // 오래된 세션부터 삭제
      const toDelete = userSessions
        .sort((a, b) => a.accessed - b.accessed) // 오래된 접근순
        .slice(0, userSessions.length - this.MAX_PROBLEMS_PER_USER);

      for (const session of toDelete) {
        const key = this.generateSessionKey(session.userId, session.problemId);
        this.cache.delete(key);
      }

      if (toDelete.length > 0) {
        console.log(`🔄 사용자 ${userId} 세션 제한: ${toDelete.length}개 오래된 세션 삭제`);
      }
    }
  }

  private startCleanupTimer(): void {
    setInterval(async () => {
      await this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  private estimateMemoryUsage(): string {
    const avgSessionSize = 2048; // 약 2KB per session
    const totalBytes = this.cache.size * avgSessionSize;
    
    if (totalBytes < 1024) return `${totalBytes}B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)}KB`;
    return `${(totalBytes / 1024 / 1024).toFixed(1)}MB`;
  }

  // 전체 캐시 무효화 (개발/테스트용)
  clearAll(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ 전체 세션 캐시 삭제: ${count}개 세션`);
  }

  // 특정 사용자 세션 모두 삭제
  clearUserSessions(userId: string): number {
    let deletedCount = 0;

    for (const [key, session] of this.cache.entries()) {
      if (session.userId === userId) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🗑️ 사용자 ${userId} 세션 삭제: ${deletedCount}개`);
    }

    return deletedCount;
  }
}

// 세션 캐시 인터페이스
interface CachedSession {
  userId: string;
  problemId: string;
  problem: RenderedProblem;
  createdAt: number;
  expiresAt: number;
  accessed: number;
  accessCount: number;
}

// 싱글톤 인스턴스
export const sessionCacheService = new SessionCacheService();