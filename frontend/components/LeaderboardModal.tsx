import React from 'react';

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  level: number;
  experience: number;
  pokemonCaught: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  leaderboard,
  loading
}) => {
  if (!isOpen) return null;

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}위`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-orange-300 to-orange-500 text-white';
      default: return 'bg-white border border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🏆 리더보드</h2>
              <p className="opacity-90">최고의 포켓몬 트레이너들</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* 리더보드 리스트 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">리더보드를 불러오는 중...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-lg">아직 리더보드가 비어있습니다.</p>
              <p className="text-sm mt-2">첫 번째 트레이너가 되어보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={`${entry.nickname}-${entry.rank}`}
                  className={`p-4 rounded-lg shadow-sm ${getRankColor(entry.rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-2xl mr-4 min-w-[60px]">
                        {getRankEmoji(entry.rank)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{entry.nickname}</h3>
                        <p className="text-sm opacity-80">
                          레벨 {entry.level} 트레이너
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {entry.experience.toLocaleString()} XP
                      </div>
                      <div className="text-sm opacity-80">
                        포켓몬 {entry.pokemonCaught}마리
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        <div className="bg-gray-50 p-4 border-t text-center text-sm text-gray-600">
          <p>매일 업데이트되는 실시간 랭킹입니다! 🎯</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;