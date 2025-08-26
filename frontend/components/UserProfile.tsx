import React from 'react';

interface User {
  id: string;
  nickname: string;
  trainerLevel: number;
  currentRegion: string;
  totalExperience: number;
  caughtPokemon: number[];
}

interface UserProfileProps {
  user: User | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <div className="text-center text-gray-500">
          사용자 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{user.nickname}</h2>
          <p className="opacity-90">레벨 {user.trainerLevel} 트레이너</p>
          <p className="opacity-80 text-sm">현재 지역: {user.currentRegion}</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-80">경험치</div>
          <div className="text-xl font-bold">{user.totalExperience} XP</div>
          <div className="text-sm opacity-80">포켓몬</div>
          <div className="text-lg font-bold">{user.caughtPokemon?.length || 0}마리</div>
        </div>
      </div>
      <div className="mt-4 bg-white/20 rounded-lg p-3">
        <div className="flex justify-between text-sm opacity-90">
          <span>다음 레벨까지</span>
          <span>{Math.max(0, (user.trainerLevel * 100) - user.totalExperience)} XP</span>
        </div>
        <div className="mt-2 bg-white/20 rounded-full h-2">
          <div 
            className="bg-yellow-300 rounded-full h-2 transition-all duration-500"
            style={{ 
              width: `${Math.min(100, (user.totalExperience % 100))}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;