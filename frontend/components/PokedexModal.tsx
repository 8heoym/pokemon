import React from 'react';

interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  imageUrl: string;
  rarity: string;
  characteristics: string[];
}

interface PokedexModalProps {
  isOpen: boolean;
  onClose: () => void;
  caughtPokemon: Pokemon[];
}

const PokedexModal: React.FC<PokedexModalProps> = ({
  isOpen,
  onClose,
  caughtPokemon
}) => {
  if (!isOpen) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'uncommon': return 'border-green-300 bg-green-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'legendary': return 'border-purple-300 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityEmoji = (rarity: string) => {
    switch (rarity) {
      case 'common': return '⚪';
      case 'uncommon': return '🟢';
      case 'rare': return '🔵';
      case 'legendary': return '🟣';
      default: return '⚪';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">포켓몬 도감</h2>
              <p className="opacity-90">잡은 포켓몬: {caughtPokemon.length}마리</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* 포켓몬 리스트 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {caughtPokemon.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-lg">아직 잡은 포켓몬이 없습니다.</p>
              <p className="text-sm mt-2">문제를 풀어서 포켓몬을 잡아보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {caughtPokemon.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`border-2 rounded-lg p-4 ${getRarityColor(pokemon.rarity)}`}
                >
                  <div className="flex items-center mb-3">
                    <img
                      src={pokemon.imageUrl}
                      alt={pokemon.koreanName}
                      className="w-16 h-16 object-contain mr-3"
                    />
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {getRarityEmoji(pokemon.rarity)} {pokemon.koreanName}
                      </h3>
                      <p className="text-sm text-gray-600">#{pokemon.id}</p>
                      <p className="text-xs text-gray-500 capitalize">{pokemon.rarity}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-1">특성:</p>
                    <div className="flex flex-wrap gap-1">
                      {pokemon.characteristics.map((char, index) => (
                        <span
                          key={index}
                          className="bg-white px-2 py-1 rounded text-xs border"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 통계 */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">일반</div>
              <div className="font-bold">
                {caughtPokemon.filter(p => p.rarity === 'common').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">고급</div>
              <div className="font-bold">
                {caughtPokemon.filter(p => p.rarity === 'uncommon').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">희귀</div>
              <div className="font-bold">
                {caughtPokemon.filter(p => p.rarity === 'rare').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">전설</div>
              <div className="font-bold">
                {caughtPokemon.filter(p => p.rarity === 'legendary').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokedexModal;