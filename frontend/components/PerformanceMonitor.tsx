'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sessionAPI } from '@/utils/api';

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  uniqueUsers: number;
  averageSessionsPerUser: number;
  memoryUsage: string;
}

interface UserSession {
  problemId: string;
  createdAt: string;
  expiresAt: string;
  accessCount: number;
  lastAccessed: string;
  multiplicationTable: number;
  difficulty: number;
}

export default function PerformanceMonitor() {
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 세션 통계 조회
  const loadSessionStats = async () => {
    try {
      setIsLoading(true);
      const response = await sessionAPI.getStats();
      setSessionStats(response.data.stats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('세션 통계 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자별 세션 조회
  const loadUserSessions = async () => {
    if (!selectedUserId.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await sessionAPI.getUserSessions(selectedUserId);
      setUserSessions(response.data.activeSessions || []);
    } catch (error) {
      console.error('사용자 세션 조회 실패:', error);
      setUserSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 캐시 정리
  const performCleanup = async () => {
    try {
      setIsLoading(true);
      await sessionAPI.cleanup();
      await loadSessionStats(); // 정리 후 통계 갱신
    } catch (error) {
      console.error('캐시 정리 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 전체 캐시 초기화
  const clearAllCache = async () => {
    if (!confirm('전체 세션 캐시를 초기화하시겠습니까?')) return;
    
    try {
      setIsLoading(true);
      await sessionAPI.clearAll();
      await loadSessionStats(); // 초기화 후 통계 갱신
      setUserSessions([]);
    } catch (error) {
      console.error('전체 캐시 초기화 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 성능 테스트
  const runPerformanceTest = async () => {
    try {
      setIsLoading(true);
      const response = await sessionAPI.performanceTest();
      alert(`성능 테스트 완료!\n평균 시간: ${response.data.results.summary.averageTime}\n성능: ${response.data.results.summary.performance}`);
    } catch (error) {
      console.error('성능 테스트 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 자동 갱신
  useEffect(() => {
    loadSessionStats();
    const interval = setInterval(loadSessionStats, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">📊 성능 모니터링</h2>
        <div className="text-sm text-gray-300">
          {lastUpdate && `마지막 갱신: ${lastUpdate.toLocaleTimeString()}`}
        </div>
      </div>

      {/* 세션 통계 */}
      {sessionStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="bg-blue-500/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-300">
              {sessionStats.totalSessions}
            </div>
            <div className="text-gray-300 text-sm">총 세션</div>
            <div className="text-green-400 text-xs mt-1">
              활성: {sessionStats.activeSessions} | 만료: {sessionStats.expiredSessions}
            </div>
          </div>

          <div className="bg-green-500/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-300">
              {sessionStats.uniqueUsers}
            </div>
            <div className="text-gray-300 text-sm">고유 사용자</div>
            <div className="text-blue-400 text-xs mt-1">
              평균: {sessionStats.averageSessionsPerUser.toFixed(1)}개/사용자
            </div>
          </div>

          <div className="bg-purple-500/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-300">
              {sessionStats.memoryUsage}
            </div>
            <div className="text-gray-300 text-sm">메모리 사용량</div>
            <div className="text-yellow-400 text-xs mt-1">
              캐시 효율성: 높음
            </div>
          </div>
        </motion.div>
      )}

      {/* 제어 버튼 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={loadSessionStats}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          🔄 갱신
        </button>
        
        <button
          onClick={performCleanup}
          disabled={isLoading}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          🧹 정리
        </button>
        
        <button
          onClick={runPerformanceTest}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ⚡ 성능 테스트
        </button>
        
        <button
          onClick={clearAllCache}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          🗑️ 전체 초기화
        </button>
      </div>

      {/* 사용자별 세션 조회 */}
      <div className="border-t border-white/20 pt-4">
        <h3 className="text-lg font-bold text-white mb-3">👤 사용자별 세션 조회</h3>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="사용자 ID 입력..."
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={loadUserSessions}
            disabled={isLoading || !selectedUserId.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            조회
          </button>
        </div>

        {userSessions.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {userSessions.map((session, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-3 text-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-white font-medium">
                      문제 ID: {session.problemId}
                    </div>
                    <div className="text-gray-400">
                      구구단: {session.multiplicationTable}단 | 난이도: {session.difficulty}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-green-400">
                      접근: {session.accessCount}회
                    </div>
                    <div className="text-gray-400">
                      {new Date(session.lastAccessed).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUserId && userSessions.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 py-8">
            활성 세션이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}