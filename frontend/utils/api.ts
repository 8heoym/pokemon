import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청/응답 인터셉터 (필요시 토큰 추가 등)
api.interceptors.request.use(
  (config) => {
    // 여기서 토큰 추가 가능
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

// 사용자 관련 API
export const userAPI = {
  create: (nickname: string) => 
    api.post('/users', { nickname }),

  get: (userId: string) => 
    api.get(`/users/${userId}`),

  getProgress: (userId: string) => 
    api.get(`/users/${userId}/progress`),

  getStats: (userId: string) => 
    api.get(`/users/${userId}/stats`),

  getPokedex: (userId: string) => 
    api.get(`/users/${userId}/pokedex`),

  catchPokemon: (userId: string, pokemonId: number) => 
    api.post(`/users/${userId}/catch`, { pokemonId }),
};

// 문제 관련 API
export const problemAPI = {
  generate: (userId: string, multiplicationTable: number, difficulty: 1 | 2 | 3 = 1) =>
    api.post('/problems/generate', { userId, multiplicationTable, difficulty }),

  submit: (userId: string, problemId: string, userAnswer: number, timeSpent: number, hintsUsed: number = 0) =>
    api.post('/problems/submit', { userId, problemId, answer: userAnswer, timeSpent, hintsUsed }),

  getHint: (problemId: string, userId: string) =>
    api.get(`/problems/${problemId}/hint/${userId}`),
};

// 포켓몬 관련 API
export const pokemonAPI = {
  initialize: () => 
    api.post('/pokemon/initialize'),

  getStats: () => 
    api.get('/pokemon/stats'),

  getByTable: (table: number) => 
    api.get(`/pokemon/table/${table}`),

  getByRegion: (region: string) => 
    api.get(`/pokemon/region/${encodeURIComponent(region)}`),

  getRandom: (table: number, rarity?: string) => {
    const params = rarity ? { rarity } : {};
    return api.get(`/pokemon/random/${table}`, { params });
  },

  getById: (id: number) => 
    api.get(`/pokemon/${id}`),
};

// 게임 관련 API
export const gameAPI = {
  getLeaderboard: () => 
    api.get('/leaderboard'),
};

export default api;