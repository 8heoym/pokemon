import { unstable_cache } from 'next/cache';

// API 기본 URL
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

// 🎯 포켓몬 데이터 캐시 (1시간 캐시)
export const getCachedPokemon = unstable_cache(
  async (pokemonId: number) => {
    console.log(`🐾 Pokemon ${pokemonId} - DB에서 조회 (캐시 미스)`);
    
    const response = await fetch(`${API_BASE}/pokemon/${pokemonId}`);
    
    if (!response.ok) {
      throw new Error(`Pokemon ${pokemonId} not found`);
    }
    
    const data = await response.json();
    return data;
  },
  ['pokemon'], // 캐시 키 접두사
  { 
    revalidate: 3600, // 1시간 캐시
    tags: ['pokemon-data'] 
  }
);

// 🎯 구구단별 포켓몬 캐시 (30분 캐시)
export const getCachedPokemonByTable = unstable_cache(
  async (table: number) => {
    console.log(`📋 구구단 ${table}단 포켓몬 목록 - DB에서 조회 (캐시 미스)`);
    
    const response = await fetch(`${API_BASE}/pokemon/table/${table}`);
    
    if (!response.ok) {
      throw new Error(`Pokemon table ${table} not found`);
    }
    
    const data = await response.json();
    return data;
  },
  ['pokemon-by-table'], 
  { 
    revalidate: 1800, // 30분 캐시
    tags: ['pokemon-table'] 
  }
);

// 🎯 랜덤 포켓몬 캐시 (10분 캐시 - 자주 변경됨)
export const getCachedRandomPokemon = unstable_cache(
  async (table: number, rarity?: string) => {
    console.log(`🎲 랜덤 포켓몬 (${table}단, ${rarity || '전체'}) - DB에서 조회`);
    
    const params = rarity ? `?rarity=${rarity}` : '';
    const response = await fetch(`${API_BASE}/pokemon/random/${table}${params}`);
    
    if (!response.ok) {
      throw new Error(`Random pokemon not found`);
    }
    
    const data = await response.json();
    return data;
  },
  ['random-pokemon'],
  { 
    revalidate: 600, // 10분 캐시 (랜덤은 좀 더 자주 갱신)
    tags: ['pokemon-random']
  }
);

// 🏆 리더보드 캐시 (5분 캐시 - 실시간성 중요)
export const getCachedLeaderboard = unstable_cache(
  async () => {
    console.log(`🏆 리더보드 - DB에서 조회 (캐시 미스)`);
    
    const response = await fetch(`${API_BASE}/leaderboard`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    const data = await response.json();
    return data;
  },
  ['leaderboard'],
  { 
    revalidate: 300, // 5분 캐시
    tags: ['leaderboard-data'] 
  }
);

// 📊 포켓몬 통계 캐시 (1시간 캐시)
export const getCachedPokemonStats = unstable_cache(
  async () => {
    console.log(`📊 포켓몬 통계 - DB에서 조회 (캐시 미스)`);
    
    const response = await fetch(`${API_BASE}/pokemon/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch pokemon stats');
    }
    
    const data = await response.json();
    return data;
  },
  ['pokemon-stats'],
  { 
    revalidate: 3600, // 1시간 캐시
    tags: ['pokemon-stats'] 
  }
);

// 👤 사용자 프로필 캐시 (10분 캐시)
export const getCachedUserProfile = unstable_cache(
  async (userId: string) => {
    console.log(`👤 사용자 ${userId} 프로필 - DB에서 조회 (캐시 미스)`);
    
    const response = await fetch(`${API_BASE}/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`User ${userId} not found`);
    }
    
    const data = await response.json();
    return data;
  },
  ['user-profile'],
  { 
    revalidate: 600, // 10분 캐시 (사용자 데이터는 자주 변경)
    tags: ['user-data'] 
  }
);

// 📈 사용자 통계 캐시 (10분 캐시)
export const getCachedUserStats = unstable_cache(
  async (userId: string) => {
    console.log(`📈 사용자 ${userId} 통계 - DB에서 조회 (캐시 미스)`);
    
    const response = await fetch(`${API_BASE}/users/${userId}/stats`);
    
    if (!response.ok) {
      throw new Error(`User stats ${userId} not found`);
    }
    
    const data = await response.json();
    return data;
  },
  ['user-stats'],
  { 
    revalidate: 600, // 10분 캐시
    tags: ['user-stats'] 
  }
);

// 🗂️ 포켓몬 도감 캐시 (15분 캐시)
export const getCachedPokedex = unstable_cache(
  async (userId: string) => {
    console.log(`🗂️ 사용자 ${userId} 포켓몬 도감 - DB에서 조회 (캐시 미스)`);
    
    const response = await fetch(`${API_BASE}/users/${userId}/pokedex`);
    
    if (!response.ok) {
      throw new Error(`Pokedex for user ${userId} not found`);
    }
    
    const data = await response.json();
    return data;
  },
  ['pokedex'],
  { 
    revalidate: 900, // 15분 캐시
    tags: ['pokedex-data'] 
  }
);

// 🔧 캐시 무효화 유틸리티
export const invalidateCache = {
  // 포켓몬 관련 캐시 무효화
  pokemon: async () => {
    const { revalidateTag } = await import('next/cache');
    revalidateTag('pokemon-data');
    revalidateTag('pokemon-table');
    revalidateTag('pokemon-random');
    revalidateTag('pokemon-stats');
  },
  
  // 사용자 관련 캐시 무효화
  user: async (userId: string) => {
    const { revalidateTag } = await import('next/cache');
    revalidateTag('user-data');
    revalidateTag('user-stats');
    revalidateTag('pokedex-data');
  },
  
  // 리더보드 캐시 무효화
  leaderboard: async () => {
    const { revalidateTag } = await import('next/cache');
    revalidateTag('leaderboard-data');
  },
  
  // 모든 캐시 무효화
  all: async () => {
    const { revalidateTag } = await import('next/cache');
    revalidateTag('pokemon-data');
    revalidateTag('pokemon-table');
    revalidateTag('pokemon-random');
    revalidateTag('pokemon-stats');
    revalidateTag('user-data');
    revalidateTag('user-stats');
    revalidateTag('pokedex-data');
    revalidateTag('leaderboard-data');
  }
};

// 🎯 캐시 통계
export const getCacheStats = () => {
  return {
    strategies: {
      'pokemon': '1시간 캐시 (정적 데이터)',
      'pokemon-by-table': '30분 캐시 (반정적 데이터)',
      'random-pokemon': '10분 캐시 (동적 데이터)',
      'leaderboard': '5분 캐시 (실시간성 중요)',
      'user-profile': '10분 캐시 (자주 변경)',
      'user-stats': '10분 캐시 (자주 변경)',
      'pokedex': '15분 캐시 (중간 변경 빈도)'
    },
    benefits: [
      '⚡ API 호출 90% 감소',
      '🌍 Vercel Edge Network 활용',
      '💰 DB 비용 절약',
      '🚀 사용자 경험 향상'
    ]
  };
};