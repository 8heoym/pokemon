// Cache functionality disabled for production stability
import { normalizeUserDates } from '@/utils/dateUtils';

// API 기본 URL
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

// 🎯 포켓몬 데이터 - 직접 API 호출
export const getCachedPokemon = async (pokemonId: number) => {
  console.log(`🐾 Pokemon ${pokemonId} - DB에서 직접 조회`);
  
  const response = await fetch(`${API_BASE}/pokemon/${pokemonId}`);
  
  if (!response.ok) {
    throw new Error(`Pokemon ${pokemonId} not found`);
  }
  
  const data = await response.json();
  return data;
};

// 🎯 구구단별 포켓몬 - 직접 API 호출
export const getCachedPokemonByTable = async (table: number) => {
  console.log(`📋 구구단 ${table}단 포켓몬 목록 - DB에서 직접 조회`);
  
  const response = await fetch(`${API_BASE}/pokemon/table/${table}`);
  
  if (!response.ok) {
    throw new Error(`Pokemon table ${table} not found`);
  }
  
  const data = await response.json();
  return data;
};

// 🎯 랜덤 포켓몬 - 직접 API 호출
export const getCachedRandomPokemon = async (table: number, rarity?: string) => {
  console.log(`🎲 랜덤 포켓몬 (${table}단, ${rarity || '전체'}) - DB에서 직접 조회`);
  
  const params = rarity ? `?rarity=${rarity}` : '';
  const response = await fetch(`${API_BASE}/pokemon/random/${table}${params}`);
  
  if (!response.ok) {
    throw new Error(`Random pokemon not found`);
  }
  
  const data = await response.json();
  return data;
};

// 🏆 리더보드 - 직접 API 호출
export const getCachedLeaderboard = async () => {
  console.log(`🏆 리더보드 - DB에서 직접 조회`);
  
  const response = await fetch(`${API_BASE}/leaderboard`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  
  const data = await response.json();
  return data;
};

// 📊 포켓몬 통계 - 직접 API 호출
export const getCachedPokemonStats = async () => {
  console.log(`📊 포켓몬 통계 - DB에서 직접 조회`);
  
  const response = await fetch(`${API_BASE}/pokemon/stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch pokemon stats');
  }
  
  const data = await response.json();
  return data;
};

// 👤 사용자 프로필 - 직접 API 호출 (날짜 정규화 포함)
export const getCachedUserProfile = async (userId: string) => {
  console.log(`👤 사용자 ${userId} 프로필 - DB에서 직접 조회`);
  
  const response = await fetch(`${API_BASE}/users/${userId}`);
  
  if (!response.ok) {
    throw new Error(`User ${userId} not found`);
  }
  
  const data = await response.json();
  return normalizeUserDates(data);
};

// 📈 사용자 통계 - 직접 API 호출
export const getCachedUserStats = async (userId: string) => {
  console.log(`📈 사용자 ${userId} 통계 - DB에서 직접 조회`);
  
  const response = await fetch(`${API_BASE}/users/${userId}/stats`);
  
  if (!response.ok) {
    throw new Error(`User stats ${userId} not found`);
  }
  
  const data = await response.json();
  return data;
};

// 🗂️ 포켓몬 도감 - 직접 API 호출
export const getCachedPokedex = async (userId: string) => {
  console.log(`🗂️ 사용자 ${userId} 포켓몬 도감 - DB에서 직접 조회`);
  
  const response = await fetch(`${API_BASE}/users/${userId}/pokedex`);
  
  if (!response.ok) {
    throw new Error(`Pokedex for user ${userId} not found`);
  }
  
  const data = await response.json();
  return data;
};

// 🔧 캐시 무효화 유틸리티 (실제로는 아무것도 하지 않음)
export const invalidateCache = {
  pokemon: async () => {
    console.log('캐시 무효화: 포켓몬 (캐시 비활성화됨)');
  },
  
  user: async (userId: string) => {
    console.log(`캐시 무효화: 사용자 ${userId} (캐시 비활성화됨)`);
  },
  
  leaderboard: async () => {
    console.log('캐시 무효화: 리더보드 (캐시 비활성화됨)');
  },
  
  all: async () => {
    console.log('캐시 무효화: 전체 (캐시 비활성화됨)');
  }
};

// 🎯 캐시 통계 (정보용)
export const getCacheStats = () => {
  return {
    strategies: {
      'all-api-calls': '직접 API 호출 (캐시 비활성화)',
      'reason': 'Next.js unstable_cache 프로덕션 안정성 문제로 비활성화'
    },
    benefits: [
      '🔧 프로덕션 안정성 향상',
      '🎯 실시간 데이터 보장',
      '🚀 배포 문제 해결',
      '💡 디버깅 용이성'
    ]
  };
};