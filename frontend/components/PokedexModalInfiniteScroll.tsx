import React, { useState, useEffect, useCallback } from 'react';
import { userAPI } from '@/utils/api';
import PokemonImageCard from './PokemonImageCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

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
}

interface PokedexModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

interface PokedexEntry {
  pokemonId: number;
  pokemon?: Pokemon;
  caught: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface UserInfo {
  level: number;
  region: string;
  totalCaught: number;
  completedTables: number[];
}

const PokedexModalInfiniteScroll: React.FC<PokedexModalProps> = ({ isOpen, userId, onClose }) => {
  const [entries, setEntries] = useState<PokedexEntry[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'caught' | 'uncaught'>('all');
  const [selectedEntry, setSelectedEntry] = useState<PokedexEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPage = useCallback(async (page: number, isNewFilter: boolean = false) => {
    try {
      setError(null);
      console.log(`Fetching page ${page} for filter ${filter}`);
      
      const response = await userAPI.getPokedexPaginated(userId, page, 50, filter);
      const data = response.data;
      
      console.log(`Page ${page} response:`, data);
      
      if (isNewFilter) {
        setEntries(data.entries);
      } else {
        setEntries(prev => [...prev, ...data.entries]);
      }
      
      setPagination(data.pagination);
      setUserInfo(data.userInfo);
      
      return data;
    } catch (error: any) {
      console.error('페이지네이션 도감 로드 실패:', error);
      setError(error?.response?.data?.error || error?.message || '도감을 불러올 수 없습니다.');
      throw error;
    }
  }, [userId, filter]);

  const fetchMore = useCallback(async () => {
    if (!pagination?.hasNextPage) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchPage(nextPage, false);
  }, [fetchPage, pagination?.hasNextPage, currentPage]);

  const { isFetching, lastElementRef } = useInfiniteScroll(
    pagination?.hasNextPage || false,
    fetchMore,
    { threshold: 0.1, rootMargin: '100px' }
  );

  useEffect(() => {
    if (isOpen && userId) {
      loadPokedexData();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (isOpen && userId) {
      handleFilterChange(filter);
    }
  }, [filter]);

  const loadPokedexData = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);
      await fetchPage(1, true);
    } catch (error) {
      // Error already handled in fetchPage
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (newFilter: 'all' | 'caught' | 'uncaught') => {
    setFilter(newFilter);
    setCurrentPage(1);
    setEntries([]);
    
    try {
      setLoading(true);
      await fetchPage(1, true);
    } catch (error) {
      // Error already handled in fetchPage
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loading && entries.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">포켓몬 도감을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && entries.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <p className="text-red-600">포켓몬 도감을 불러올 수 없습니다.</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={loadPokedexData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              다시 시도
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completionRate = userInfo ? ((userInfo.totalCaught / (pagination?.totalCount ?? 842)) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">📱 포켓몬 도감 (무한스크롤)</h2>
              <p className="opacity-90 mt-1">
                수집률: {userInfo?.totalCaught || 0}/{pagination?.totalCount || 842} ({completionRate}%)
              </p>
              {userInfo && (
                <p className="text-sm opacity-75 mt-1">
                  레벨 {userInfo.level} • {userInfo.region}
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
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-400 text-white hover:bg-red-300'
              }`}
              disabled={loading}
            >
              전체 ({pagination?.totalCount || 842})
            </button>
            <button
              onClick={() => handleFilterChange('caught')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'caught' 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-400 text-white hover:bg-red-300'
              }`}
              disabled={loading}
            >
              획득 ({userInfo?.totalCaught || 0})
            </button>
            <button
              onClick={() => handleFilterChange('uncaught')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'uncaught' 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-400 text-white hover:bg-red-300'
              }`}
              disabled={loading}
            >
              미획득 ({(pagination?.totalCount || 842) - (userInfo?.totalCaught || 0)})
            </button>
          </div>
        </div>

        {/* 포켓몬 그리드 */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {entries.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">표시할 포켓몬이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {entries.map((entry, index) => (
                <div
                  key={entry.pokemonId}
                  ref={index === entries.length - 1 ? lastElementRef : null}
                  className="cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => setSelectedEntry(entry)}
                >
                  {entry.caught && entry.pokemon ? (
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
          )}

          {/* 로딩 인디케이터 */}
          {isFetching && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">더 많은 포켓몬을 불러오는 중...</span>
            </div>
          )}

          {/* 끝에 도달했을 때 메시지 */}
          {pagination && !pagination.hasNextPage && entries.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">모든 포켓몬을 확인했습니다! 🎉</p>
            </div>
          )}
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

export default PokedexModalInfiniteScroll;