import React, { useState, useEffect, useCallback } from 'react';
import { userAPI, pokemonAPI } from '@/utils/api';
import PokemonImageCard from './PokemonImageCard';

interface Pokemon {
  id: number;
  name: string;
  koreanName?: string;
  korean_name?: string;
  imageUrl?: string;
  image_url?: string;
  rarity: string;
  characteristics?: string[];
  region: string;
  cachedAt?: number;
}

interface PokedexModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

interface PokedexData {
  totalCaught: number;
  caughtPokemonIds: number[];
  totalPokemon: number;
  userInfo?: {
    level: number;
    region: string;
    completedTables: number[];
  };
  statistics?: {
    byRarity: { [key: string]: number };
    byRegion: { [key: string]: number };
    statsBasedOn: number;
  };
  error?: string;
}

interface PokemonCache {
  [pokemonId: number]: Pokemon;
}

interface PokedexEntry {
  pokemonId: number;
  pokemon?: Pokemon;
  caught: boolean;
  loading?: boolean;
}

const PokedexModal: React.FC<PokedexModalProps> = ({ isOpen, userId, onClose }) => {
  const [pokedexData, setPokedexData] = useState<PokedexData | null>(null);
  const [pokemonCache, setPokemonCache] = useState<PokemonCache>(() => {
    // 로컬스토리지에서 포켓몬 캐시 로드
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('pokemon-cache');
        return cached ? JSON.parse(cached) : {};
      } catch {
        return {};
      }
    }
    return {};
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'caught' | 'uncaught'>('all');
  const [selectedEntry, setSelectedEntry] = useState<PokedexEntry | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  const CACHE_EXPIRY = 1000 * 60 * 30; // 30분 캐시 만료

  useEffect(() => {
    if (isOpen && userId) {
      loadPokedexData();
    }
  }, [isOpen, userId]);

  const loadPokedexData = async () => {
    try {
      setLoading(true);
      console.log('Loading pokedex data for user:', userId);
      
      const response = await userAPI.getPokedex(userId);
      const data: PokedexData = response.data;
      
      console.log('Pokedex API response:', data);
      
      setPokedexData(data);
      
      if (data.error) {
        console.error('Pokedex data contains error:', data.error);
      }
      
    } catch (error: any) {
      console.error('포켓몬 도감 로드 실패:', error);
      
      setPokedexData({
        totalCaught: 0,
        caughtPokemonIds: [],
        totalPokemon: 842,
        error: error?.response?.data?.error || error?.message || '알 수 없는 오류'
      });
    } finally {
      setLoading(false);
    }
  };

  // 포켓몬 캐시 저장 (로컬스토리지 + 메모리)
  const savePokemonToCache = useCallback((newPokemon: Pokemon[]) => {
    const newCache = { ...pokemonCache };
    newPokemon.forEach((pokemon: Pokemon) => {
      newCache[pokemon.id] = {
        id: pokemon.id,
        name: pokemon.name,
        koreanName: pokemon.koreanName || pokemon.korean_name,
        imageUrl: pokemon.imageUrl || pokemon.image_url,
        rarity: pokemon.rarity,
        characteristics: pokemon.characteristics || [],
        region: pokemon.region,
        cachedAt: Date.now() // 캐시 타임스탬프 추가
      };
    });
    
    setPokemonCache(newCache);
    
    // 로컬스토리지에 저장 (용량 제한 고려하여 최신 500개만 유지)
    try {
      const cacheEntries = Object.entries(newCache);
      const recentEntries = cacheEntries
        .sort(([,a], [,b]) => (b.cachedAt || 0) - (a.cachedAt || 0))
        .slice(0, 500);
      
      const limitedCache = Object.fromEntries(recentEntries);
      localStorage.setItem('pokemon-cache', JSON.stringify(limitedCache));
    } catch (error) {
      console.warn('로컬스토리지 캐시 저장 실패:', error);
    }
  }, [pokemonCache]);

  // 특정 포켓몬 데이터 로드 (온디맨드)
  const loadPokemonData = useCallback(async (pokemonIds: number[]) => {
    // 캐시된 데이터 중 만료되지 않은 것들만 필터링
    const now = Date.now();
    const uncachedIds = pokemonIds.filter(id => {
      const cached = pokemonCache[id];
      return !cached || (cached.cachedAt && (now - cached.cachedAt) > CACHE_EXPIRY);
    });
    
    if (uncachedIds.length === 0) return;
    
    try {
      console.log('Loading Pokemon data for IDs:', uncachedIds);
      const response = await pokemonAPI.getBatch(uncachedIds, 50, 0);
      const pokemonData = response.data.pokemon;
      
      savePokemonToCache(pokemonData);
    } catch (error) {
      console.error('포켓몬 데이터 로드 실패:', error);
    }
  }, [pokemonCache, savePokemonToCache, CACHE_EXPIRY]);

  // 현재 페이지에 표시할 포켓몬 ID 목록 생성
  const getDisplayPokemonIds = useCallback(() => {
    if (!pokedexData) return [];
    
    let allIds: number[];
    
    switch (filter) {
      case 'caught':
        allIds = pokedexData.caughtPokemonIds;
        break;
      case 'uncaught':
        allIds = Array.from({ length: pokedexData.totalPokemon }, (_, i) => i + 1)
          .filter(id => !pokedexData.caughtPokemonIds.includes(id));
        break;
      default:
        allIds = Array.from({ length: pokedexData.totalPokemon }, (_, i) => i + 1);
    }
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allIds.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [pokedexData, filter, currentPage, ITEMS_PER_PAGE]);

  // 현재 페이지의 포켓몬 데이터 로드
  useEffect(() => {
    if (pokedexData && !loading) {
      const displayIds = getDisplayPokemonIds();
      if (displayIds.length > 0) {
        loadPokemonData(displayIds);
      }
    }
  }, [pokedexData, currentPage, filter, loadPokemonData, loading, getDisplayPokemonIds]);

  // 표시할 엔트리 생성
  const getDisplayEntries = useCallback((): PokedexEntry[] => {
    if (!pokedexData) return [];
    
    const displayIds = getDisplayPokemonIds();
    
    return displayIds.map(pokemonId => ({
      pokemonId,
      pokemon: pokemonCache[pokemonId],
      caught: pokedexData.caughtPokemonIds.includes(pokemonId),
      loading: !pokemonCache[pokemonId]
    }));
  }, [pokedexData, pokemonCache, getDisplayPokemonIds]);

  const displayEntries = getDisplayEntries();
  const totalPages = pokedexData ? Math.ceil(
    (filter === 'caught' ? pokedexData.totalCaught : 
     filter === 'uncaught' ? pokedexData.totalPokemon - pokedexData.totalCaught :
     pokedexData.totalPokemon) / ITEMS_PER_PAGE
  ) : 1;

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">포켓몬 도감을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!pokedexData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <p className="text-red-600">포켓몬 도감을 불러올 수 없습니다.</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  if (pokedexData.error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <p className="text-red-600">포켓몬 도감을 불러올 수 없습니다.</p>
          <p className="text-sm text-gray-500 mt-2">{pokedexData.error}</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  const completionRate = ((pokedexData.totalCaught / pokedexData.totalPokemon) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">📱 포켓몬 도감</h2>
              <p className="opacity-90 mt-1">
                수집률: {pokedexData.totalCaught}/{pokedexData.totalPokemon} ({completionRate}%)
              </p>
              {pokedexData.userInfo && (
                <p className="text-sm opacity-75 mt-1">
                  레벨 {pokedexData.userInfo.level} • {pokedexData.userInfo.region}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-4xl font-bold w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* 필터 버튼 */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { setFilter('all'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-400 text-white hover:bg-red-300'
              }`}
            >
              전체 ({pokedexData.totalPokemon})
            </button>
            <button
              onClick={() => { setFilter('caught'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'caught' 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-400 text-white hover:bg-red-300'
              }`}
            >
              획득 ({pokedexData.totalCaught})
            </button>
            <button
              onClick={() => { setFilter('uncaught'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'uncaught' 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-400 text-white hover:bg-red-300'
              }`}
            >
              미획득 ({pokedexData.totalPokemon - pokedexData.totalCaught})
            </button>
          </div>
        </div>

        {/* 포켓몬 그리드 */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
          {/* 페이지네이션 컨트롤 */}
          <div className="flex justify-center items-center gap-2 mb-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              이전
            </button>
            <span className="px-3 py-1 text-sm">
              {currentPage} / {totalPages} 페이지
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              다음
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayEntries.map((entry) => (
              <div
                key={entry.pokemonId}
                className="cursor-pointer transform transition-transform hover:scale-105"
                onClick={() => setSelectedEntry(entry)}
              >
                {entry.loading ? (
                  // 로딩 중
                  <div className="w-32 h-32 bg-gray-100 border-2 border-gray-300 rounded-xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : entry.caught && entry.pokemon ? (
                  // 획득한 포켓몬
                  <div className="relative">
                    <PokemonImageCard 
                      pokemon={{
                        id: entry.pokemon.id,
                        name: entry.pokemon.name,
                        koreanName: entry.pokemon.koreanName || entry.pokemon.name,
                        imageUrl: entry.pokemon.imageUrl || '',
                        rarity: entry.pokemon.rarity
                      }} 
                      size="small"
                    />
                  </div>
                ) : (
                  // 미획득 포켓몬 - "?" 이미지
                  <div className="w-32 h-32 bg-gray-100 border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center">
                    <div className="text-4xl text-gray-400 mb-2">❓</div>
                    <div className="text-xs font-bold text-gray-500">#{entry.pokemonId}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">포켓몬 정보</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            {selectedEntry.caught && selectedEntry.pokemon ? (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <PokemonImageCard 
                    pokemon={{
                      id: selectedEntry.pokemon.id,
                      name: selectedEntry.pokemon.name,
                      koreanName: selectedEntry.pokemon.koreanName || selectedEntry.pokemon.name,
                      imageUrl: selectedEntry.pokemon.imageUrl || '',
                      rarity: selectedEntry.pokemon.rarity
                    }} 
                    size="large"
                  />
                </div>
                <div className="flex-grow">
                  <div className="space-y-3">
                    <div>
                      <span className="font-bold text-gray-700">포켓몬 번호:</span>
                      <span className="ml-2">#{selectedEntry.pokemon.id}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">한국어 이름:</span>
                      <span className="ml-2">{selectedEntry.pokemon.koreanName || selectedEntry.pokemon.name}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">영어 이름:</span>
                      <span className="ml-2">{selectedEntry.pokemon.name}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">등급:</span>
                      <span className="ml-2 capitalize">{selectedEntry.pokemon.rarity}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">지역:</span>
                      <span className="ml-2">{selectedEntry.pokemon.region}</span>
                    </div>
                    {selectedEntry.pokemon.characteristics && selectedEntry.pokemon.characteristics.length > 0 && (
                      <div>
                        <span className="font-bold text-gray-700">특성:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedEntry.pokemon.characteristics.map((char, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : selectedEntry.loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">포켓몬 정보를 불러오는 중...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-8xl text-gray-400 mb-4">❓</div>
                <h4 className="text-xl font-bold text-gray-600 mb-2">미획득 포켓몬</h4>
                <p className="text-lg text-gray-500">포켓몬 번호: #{selectedEntry.pokemonId}</p>
                <p className="text-sm text-gray-400 mt-4">
                  문제를 풀어서 포켓몬을 잡아보세요!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PokedexModal;