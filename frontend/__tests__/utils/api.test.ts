import axios from 'axios';
import { userAPI, problemAPI, pokemonAPI, gameAPI } from '../../utils/api';

// Axios 모킹
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// axios.create 모킹
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  }
};

mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('userAPI', () => {
    it('create - 새로운 사용자 생성', async () => {
      const mockResponse = { data: { user: { id: '123', nickname: '테스트' } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await userAPI.create('테스트');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', { nickname: '테스트' });
      expect(result).toEqual(mockResponse);
    });

    it('get - 사용자 정보 조회', async () => {
      const mockResponse = { data: { id: '123', nickname: '테스트' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await userAPI.get('123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/123');
      expect(result).toEqual(mockResponse);
    });

    it('getProgress - 사용자 진도 조회', async () => {
      const mockResponse = { data: { completedTables: [2, 3] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await userAPI.getProgress('123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/123/progress');
      expect(result).toEqual(mockResponse);
    });

    it('catchPokemon - 포켓몬 잡기', async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await userAPI.catchPokemon('123', 25);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/123/catch', { pokemonId: 25 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('problemAPI', () => {
    it('generate - 문제 생성', async () => {
      const mockResponse = { data: { problem: { id: 'prob-123' } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await problemAPI.generate('user-123', 2, 1);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/problems/generate', {
        userId: 'user-123',
        multiplicationTable: 2,
        difficulty: 1
      });
      expect(result).toEqual(mockResponse);
    });

    it('submit - 답안 제출', async () => {
      const mockResponse = { data: { isCorrect: true } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await problemAPI.submit('user-123', 'prob-123', 12, 30, 1);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/problems/submit', {
        userId: 'user-123',
        problemId: 'prob-123',
        answer: 12,
        timeSpent: 30,
        hintsUsed: 1
      });
      expect(result).toEqual(mockResponse);
    });

    it('getHint - 힌트 조회', async () => {
      const mockResponse = { data: { hint: '힌트입니다' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await problemAPI.getHint('prob-123', 'user-123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/problems/prob-123/hint/user-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('pokemonAPI', () => {
    it('getStats - 포켓몬 통계 조회', async () => {
      const mockResponse = { data: { totalPokemon: 150 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await pokemonAPI.getStats();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pokemon/stats');
      expect(result).toEqual(mockResponse);
    });

    it('getByTable - 구구단별 포켓몬 조회', async () => {
      const mockResponse = { data: [{ id: 25, name: 'pikachu' }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await pokemonAPI.getByTable(2);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pokemon/table/2');
      expect(result).toEqual(mockResponse);
    });

    it('getRandom - 랜덤 포켓몬 조회 (희귀도 없음)', async () => {
      const mockResponse = { data: { id: 25, name: 'pikachu' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await pokemonAPI.getRandom(2);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pokemon/random/2', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('getRandom - 랜덤 포켓몬 조회 (희귀도 있음)', async () => {
      const mockResponse = { data: { id: 25, name: 'pikachu' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await pokemonAPI.getRandom(2, 'rare');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pokemon/random/2', { 
        params: { rarity: 'rare' } 
      });
      expect(result).toEqual(mockResponse);
    });

    it('initialize - 포켓몬 데이터베이스 초기화', async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await pokemonAPI.initialize();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/pokemon/initialize');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('gameAPI', () => {
    it('getLeaderboard - 리더보드 조회', async () => {
      const mockResponse = { data: [{ nickname: '테스트', score: 100 }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await gameAPI.getLeaderboard();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/leaderboard');
      expect(result).toEqual(mockResponse);
    });
  });
});