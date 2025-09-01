import React, { useState, useEffect } from 'react';
import { userAPI, pokemonAPI } from '@/utils/api';
import PokemonImageCard from './PokemonImageCard';

interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  imageUrl: string;
  rarity: string;
  characteristics: string[];
  region: string;
}

interface PokedexModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

interface PokedexEntry {
  pokemon: Pokemon;
  caught: boolean;
  caughtAt?: string;
}

const PokedexModal: React.FC<PokedexModalProps> = ({ isOpen, userId, onClose }) => {
  const [pokedexEntries, setPokedexEntries] = useState<PokedexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'caught' | 'uncaught'>('all');
  const [selectedEntry, setSelectedEntry] = useState<PokedexEntry | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadPokedexData();
    }
  }, [isOpen, userId]);

  const loadPokedexData = async () => {
    try {
      setLoading(true);
      
      // 사용자의 포켓몬 도감 정보 가져오기
      const pokedexResponse = await userAPI.getPokedex(userId);
      const userPokedex = pokedexResponse.data;
      
      // 전체 포켓몬 목록 가져오기 (1-842)
      const entries: PokedexEntry[] = [];
      
      // 더미 데이터로 전체 842마리 포켓몬 생성 (실제로는 API에서 가져와야 함)
      for (let i = 1; i <= 842; i++) {
        const caughtPokemonData = userPokedex.caughtPokemon.find((p: any) => p.id === i);
        
        if (caughtPokemonData) {
          // 잡은 포켓몬 - 백엔드 snake_case를 프론트엔드 camelCase로 변환
          const convertedPokemon: Pokemon = {
            id: caughtPokemonData.id,
            name: caughtPokemonData.name,
            koreanName: caughtPokemonData.korean_name || caughtPokemonData.koreanName,
            imageUrl: caughtPokemonData.image_url || caughtPokemonData.imageUrl,
            rarity: caughtPokemonData.rarity,
            characteristics: caughtPokemonData.characteristics || [],
            region: caughtPokemonData.region
          };
          
          entries.push({
            pokemon: convertedPokemon,
            caught: true,
            caughtAt: caughtPokemonData.created_at || new Date().toISOString()
          });
        } else {
          // 잡지 않은 포켓몬
          entries.push({
            pokemon: {
              id: i,
              name: '???',
              koreanName: '???',
              imageUrl: '',
              rarity: 'unknown',
              characteristics: [],
              region: '???'
            },
            caught: false
          });
        }
      }
      
      setPokedexEntries(entries);
    } catch (error) {
      console.error('포켓몬 도감 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = pokedexEntries.filter(entry => {
    if (filter === 'caught') return entry.caught;
    if (filter === 'uncaught') return !entry.caught;
    return true;
  });

  const caughtCount = pokedexEntries.filter(entry => entry.caught).length;
  const completionRate = ((caughtCount / 842) * 100).toFixed(1);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">📱 포켓몬 도감</h2>
              <p className="opacity-90 mt-1">
                수집률: {caughtCount}/842 ({completionRate}%)
              </p>
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
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-400 text-white hover:bg-red-300'
              }`}
            >
              전체 ({pokedexEntries.length})
            </button>
            <button
              onClick={() => setFilter('caught')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'caught' 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-400 text-white hover:bg-red-300'
              }`}
            >
              획득 ({caughtCount})
            </button>
            <button
              onClick={() => setFilter('uncaught')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'uncaught' 
                  ? 'bg-white text-red-500' 
                  : 'bg-red-400 text-white hover:bg-red-300'
              }`}
            >
              미획득 ({842 - caughtCount})
            </button>
          </div>
        </div>

        {/* 포켓몬 그리드 */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.pokemon.id}
                className="cursor-pointer transform transition-transform hover:scale-105"
                onClick={() => setSelectedEntry(entry)}
              >
                {entry.caught ? (
                  // 획득한 포켓몬
                  <div className="relative">
                    <PokemonImageCard 
                      pokemon={entry.pokemon} 
                      size="small"
                    />
                  </div>
                ) : (
                  // 미획득 포켓몬 - "?" 이미지
                  <div className="w-32 h-32 bg-gray-100 border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center">
                    <div className="text-4xl text-gray-400 mb-2">❓</div>
                    <div className="text-xs font-bold text-gray-500">#{entry.pokemon.id}</div>
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

            {selectedEntry.caught ? (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <PokemonImageCard 
                    pokemon={selectedEntry.pokemon} 
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
                      <span className="ml-2">{selectedEntry.pokemon.koreanName}</span>
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
                      <span className="font-bold text-gray-700">획득 일시:</span>
                      <span className="ml-2">
                        {selectedEntry.caughtAt ? new Date(selectedEntry.caughtAt).toLocaleString('ko-KR') : '알 수 없음'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">지역:</span>
                      <span className="ml-2">{selectedEntry.pokemon.region}</span>
                    </div>
                    {selectedEntry.pokemon.characteristics.length > 0 && (
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
                <p className="text-lg text-gray-500">포켓몬 번호: #{selectedEntry.pokemon.id}</p>
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