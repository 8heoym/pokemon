import { useState, useCallback } from 'react';

export interface ApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiCallReturn<T> {
  execute: (apiCall: () => Promise<T>) => Promise<T | null>;
  executeWithData: (apiCall: () => Promise<{ data: T }>) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * 🚀 공통 API 호출 훅
 * - 일관된 로딩/에러 상태 관리
 * - 자동 에러 핸들링
 * - 중복 코드 제거
 */
export function useApiCall<T = any>(): UseApiCallReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    if (loading) {
      console.warn('API 호출이 이미 진행 중입니다.');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'API 호출 중 오류가 발생했습니다.';
      
      setError(errorMessage);
      console.error('API 호출 실패:', {
        error: err,
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const executeWithData = useCallback(async (
    apiCall: () => Promise<{ data: T }>
  ): Promise<T | null> => {
    return await execute(async () => {
      const response = await apiCall();
      return response.data;
    });
  }, [execute]);

  return {
    execute,
    executeWithData,
    loading,
    error,
    clearError
  };
}

/**
 * 🎯 특화된 API 훅들
 */

// 문제 생성 전용 훅
export function useProblems() {
  const { execute, loading, error, clearError } = useApiCall();

  const generateProblem = useCallback(async (
    userId: string, 
    multiplicationTable: number, 
    difficulty: 1 | 2 | 3 = 1
  ) => {
    return await execute(async () => {
      const { problemAPI } = await import('@/utils/api');
      const response = await problemAPI.generate(userId, multiplicationTable, difficulty);
      return response.data;
    });
  }, [execute]);

  const submitAnswer = useCallback(async (
    userId: string,
    problemId: string,
    userAnswer: number,
    timeSpent: number,
    hintsUsed: number = 0
  ) => {
    return await execute(async () => {
      const { problemAPI } = await import('@/utils/api');
      const response = await problemAPI.submit(userId, problemId, userAnswer, timeSpent, hintsUsed);
      return response.data;
    });
  }, [execute]);

  const getHint = useCallback(async (problemId: string, userId: string) => {
    return await execute(async () => {
      const { problemAPI } = await import('@/utils/api');
      const response = await problemAPI.getHint(problemId, userId);
      return response.data;
    });
  }, [execute]);

  return {
    generateProblem,
    submitAnswer,
    getHint,
    loading,
    error,
    clearError
  };
}

// 사용자 관리 전용 훅
export function useUsers() {
  const { executeWithData, loading, error, clearError } = useApiCall();

  const createUser = useCallback(async (nickname: string) => {
    return await executeWithData(async () => {
      const { userAPI } = await import('@/utils/api');
      return await userAPI.create(nickname);
    });
  }, [executeWithData]);

  const getUser = useCallback(async (userId: string) => {
    return await executeWithData(async () => {
      const { userAPI } = await import('@/utils/api');
      return await userAPI.get(userId);
    });
  }, [executeWithData]);

  const getUserStats = useCallback(async (userId: string) => {
    return await executeWithData(async () => {
      const { userAPI } = await import('@/utils/api');
      return await userAPI.getStats(userId);
    });
  }, [executeWithData]);

  const getPokedex = useCallback(async (userId: string) => {
    return await executeWithData(async () => {
      const { userAPI } = await import('@/utils/api');
      return await userAPI.getPokedex(userId);
    });
  }, [executeWithData]);

  const catchPokemon = useCallback(async (userId: string, pokemonId: number) => {
    return await executeWithData(async () => {
      const { userAPI } = await import('@/utils/api');
      return await userAPI.catchPokemon(userId, pokemonId);
    });
  }, [executeWithData]);

  return {
    createUser,
    getUser,
    getUserStats,
    getPokedex,
    catchPokemon,
    loading,
    error,
    clearError
  };
}

// 포켓몬 관리 전용 훅
export function usePokemon() {
  const { executeWithData, loading, error, clearError } = useApiCall();

  const getStats = useCallback(async () => {
    return await executeWithData(async () => {
      const { pokemonAPI } = await import('@/utils/api');
      return await pokemonAPI.getStats();
    });
  }, [executeWithData]);

  const getByTable = useCallback(async (table: number) => {
    return await executeWithData(async () => {
      const { pokemonAPI } = await import('@/utils/api');
      return await pokemonAPI.getByTable(table);
    });
  }, [executeWithData]);

  const getRandom = useCallback(async (table: number, rarity?: string) => {
    return await executeWithData(async () => {
      const { pokemonAPI } = await import('@/utils/api');
      return await pokemonAPI.getRandom(table, rarity);
    });
  }, [executeWithData]);

  const getById = useCallback(async (id: number) => {
    return await executeWithData(async () => {
      const { pokemonAPI } = await import('@/utils/api');
      return await pokemonAPI.getById(id);
    });
  }, [executeWithData]);

  return {
    getStats,
    getByTable,
    getRandom,
    getById,
    loading,
    error,
    clearError
  };
}

// 게임 데이터 전용 훅
export function useGameData() {
  const { executeWithData, loading, error, clearError } = useApiCall();

  const getLeaderboard = useCallback(async () => {
    return await executeWithData(async () => {
      const { gameAPI } = await import('@/utils/api');
      return await gameAPI.getLeaderboard();
    });
  }, [executeWithData]);

  return {
    getLeaderboard,
    loading,
    error,
    clearError
  };
}