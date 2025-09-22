import axios from 'axios';
import { 
  getCachedPokemon,
  getCachedPokemonByTable,
  getCachedRandomPokemon,
  getCachedLeaderboard,
  getCachedPokemonStats,
  getCachedUserProfile,
  getCachedUserStats,
  getCachedPokedex
} from '@/lib/cache';
import { normalizeUserDates } from '@/utils/dateUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const DEPLOYMENT_VERSION = '20250907-001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Deploy-Version': DEPLOYMENT_VERSION,
  },
});

// 요청/응답 인터셉터 (필요시 토큰 추가 등)
api.interceptors.request.use(
  (config) => {
    const timestamp = Date.now();
    config.params = {
      ...config.params,
      _t: timestamp,
      _v: DEPLOYMENT_VERSION
    };
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 🚀 사용자 관련 API (캐시 적용)
export const userAPI = {
  create: async (nickname: string) => {
    const response = await api.post('/users', { nickname });
    return { data: normalizeUserDates(response.data) };
  },

  // ✅ 캐시 적용: 사용자 프로필
  get: async (userId: string) => {
    try {
      const cachedData = await getCachedUserProfile(userId);
      return { data: normalizeUserDates(cachedData) };
    } catch (error) {
      console.warn('캐시에서 사용자 조회 실패, 직접 API 호출:', error);
      const encodedUserId = encodeURIComponent(userId);
      const response = await api.get(`/users/${encodedUserId}`);
      return { data: normalizeUserDates(response.data) };
    }
  },

  getProgress: (userId: string) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/users/${encodedUserId}/progress`);
  },

  // ✅ 캐시 적용: 사용자 통계  
  getStats: async (userId: string) => {
    try {
      const cachedData = await getCachedUserStats(userId);
      return { data: cachedData };
    } catch (error) {
      console.warn('캐시에서 사용자 통계 조회 실패, 직접 API 호출:', error);
      const encodedUserId = encodeURIComponent(userId);
      return api.get(`/users/${encodedUserId}/stats`);
    }
  },

  // ✅ 캐시 적용: 포켓몬 도감
  getPokedex: async (userId: string) => {
    try {
      const cachedData = await getCachedPokedex(userId);
      return { data: cachedData };
    } catch (error) {
      console.warn('캐시에서 도감 조회 실패, 직접 API 호출:', error);
      const encodedUserId = encodeURIComponent(userId);
      return api.get(`/users/${encodedUserId}/pokedex`);
    }
  },

  getPokedexPaginated: (userId: string, page: number = 1, limit: number = 50, filter: string = 'all') => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/users/${encodedUserId}/pokedex/paginated`, { params: { page, limit, filter } });
  },

  // 실시간 액션은 캐시 미적용 (포켓몬 잡기)
  catchPokemon: (userId: string, pokemonId: number) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.post(`/users/${encodedUserId}/catch`, { pokemonId });
  },
};

// 문제 관련 API
export const problemAPI = {
  generate: (userId: string, multiplicationTable: number, difficulty: 1 | 2 | 3 = 1) =>
    api.post('/problems/generate', { userId, multiplicationTable, difficulty }),

  submit: (userId: string, problemId: string, userAnswer: number, timeSpent: number, hintsUsed: number = 0, regionId?: number, stageNumber?: number) =>
    api.post('/problems/submit', { userId, problemId, answer: userAnswer, timeSpent, hintsUsed, regionId, stageNumber }),

  getHint: (problemId: string, userId: string) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/problems/${problemId}/hint/${encodedUserId}`);
  },
};

// 🚀 포켓몬 관련 API (캐시 적용)
export const pokemonAPI = {
  initialize: () => 
    api.post('/pokemon/initialize'),

  // ✅ 캐시 적용: 포켓몬 통계
  getStats: async () => {
    try {
      const cachedData = await getCachedPokemonStats();
      return { data: cachedData };
    } catch (error) {
      console.warn('캐시에서 포켓몬 통계 조회 실패, 직접 API 호출:', error);
      return api.get('/pokemon/stats');
    }
  },

  // ✅ 캐시 적용: 구구단별 포켓몬
  getByTable: async (table: number) => {
    try {
      const cachedData = await getCachedPokemonByTable(table);
      return { data: cachedData };
    } catch (error) {
      console.warn('캐시에서 구구단별 포켓몬 조회 실패, 직접 API 호출:', error);
      return api.get(`/pokemon/table/${table}`);
    }
  },

  getByRegion: (region: string) => 
    api.get(`/pokemon/region/${encodeURIComponent(region)}`),

  // ✅ 캐시 적용: 랜덤 포켓몬
  getRandom: async (table: number, rarity?: string) => {
    try {
      const cachedData = await getCachedRandomPokemon(table, rarity);
      return { data: cachedData };
    } catch (error) {
      console.warn('캐시에서 랜덤 포켓몬 조회 실패, 직접 API 호출:', error);
      const params = rarity ? { rarity } : {};
      return api.get(`/pokemon/random/${table}`, { params });
    }
  },

  // ✅ 캐시 적용: 개별 포켓몬
  getById: async (id: number) => {
    try {
      const cachedData = await getCachedPokemon(id);
      return { data: cachedData };
    } catch (error) {
      console.warn('캐시에서 포켓몬 조회 실패, 직접 API 호출:', error);
      return api.get(`/pokemon/${id}`);
    }
  },

  // 배치 조회는 동적이므로 캐시 미적용
  getBatch: (pokemonIds: number[], limit: number = 50, offset: number = 0) =>
    api.post('/pokemon/batch', { pokemonIds }, { params: { limit, offset } }),
};

// 🚀 게임 관련 API (캐시 적용)
export const gameAPI = {
  // ✅ 캐시 적용: 리더보드 (5분 캐시)
  getLeaderboard: async () => {
    try {
      const cachedData = await getCachedLeaderboard();
      return { data: cachedData };
    } catch (error) {
      console.warn('캐시에서 리더보드 조회 실패, 직접 API 호출:', error);
      return api.get('/leaderboard');
    }
  },
};

// 🚀 세션 캐시 관리 API (성능 모니터링용)
export const sessionAPI = {
  getStats: () => 
    api.get('/session/stats'),
  
  getUserSessions: (userId: string) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/session/user/${encodedUserId}`);
  },
  
  cleanup: () => 
    api.post('/session/cleanup'),
  
  clearUserSessions: (userId: string) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.delete(`/session/user/${encodedUserId}`);
  },
  
  clearAll: () => 
    api.delete('/session/all'),
  
  performanceTest: () => 
    api.get('/session/test'),
};

// 🎯 스테이지 진행도 관련 API
export const stageProgressAPI = {
  // 사용자의 모든 스테이지 진행도 조회
  getUserStageProgress: (userId: string) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/users/${encodedUserId}/stage-progress`);
  },

  // 특정 지역의 스테이지 진행도 조회
  getRegionStageProgress: (userId: string, regionId: number) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/users/${encodedUserId}/stage-progress/region/${regionId}`);
  },

  // 스테이지 진행도 업데이트
  updateStageProgress: (userId: string, data: { regionId: number; stageNumber: number; completedProblems: number }) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.post(`/users/${encodedUserId}/stage-progress/update`, data);
  },

  // 신규 사용자 스테이지 진행도 초기화
  initializeStageProgress: (userId: string) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.post(`/users/${encodedUserId}/stage-progress/initialize`);
  },

  // 완료된 지역 목록 조회
  getCompletedRegions: (userId: string) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/users/${encodedUserId}/completed-regions`);
  },

  // 특정 지역 완료 여부 확인
  checkRegionCompletion: (userId: string, regionId: number) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/users/${encodedUserId}/stage-progress/region/${regionId}/completion`);
  },

  // Phase 2: 스테이지 기반 지역 상태 조회
  getRegionStatus: (userId: string) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/users/${encodedUserId}/region-status`);
  },

  // Phase 2: 전체 게임 진행 상태 조회 (배지 시스템용)
  getGameProgress: (userId: string) => {
    const encodedUserId = encodeURIComponent(userId);
    return api.get(`/users/${encodedUserId}/game-progress`);
  },
};

export default api;