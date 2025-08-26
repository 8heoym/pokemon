'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onCreateUser: (nickname: string) => Promise<void>;
  onLoadUser: (userId: string) => Promise<void>;
  error: string;
  isLoading: boolean;
}

export default function WelcomeScreen({ 
  onCreateUser, 
  onLoadUser, 
  error, 
  isLoading 
}: WelcomeScreenProps) {
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [mode, setMode] = useState<'new' | 'existing'>('new');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'new') {
      if (nickname.trim().length === 0) {
        alert('닉네임을 입력해주세요!');
        return;
      }
      if (nickname.trim().length > 20) {
        alert('닉네임은 20자 이하로 입력해주세요!');
        return;
      }
      await onCreateUser(nickname.trim());
    } else {
      if (userId.trim().length === 0) {
        alert('닉네임을 입력해주세요!');
        return;
      }
      await onLoadUser(userId.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="pokemon-card max-w-md w-full p-8 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-6xl mb-4">
            ⚡🔥⭐
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2 font-pokemon">
            포켓몬 수학 모험
          </h1>
          <p className="text-gray-600 mb-8">
            포켓몬과 함께 곱셈을 마스터하자!
          </p>
        </motion.div>

        {/* 모드 선택 */}
        <motion.div 
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex border-2 border-blue-200 rounded-lg overflow-hidden mb-4">
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`flex-1 py-3 px-4 font-bold transition-all ${
                mode === 'new'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 hover:bg-blue-50'
              }`}
            >
              🆕 새로 시작하기
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`flex-1 py-3 px-4 font-bold transition-all ${
                mode === 'existing'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 hover:bg-blue-50'
              }`}
            >
              📂 이어서 하기
            </button>
          </div>
        </motion.div>

        {/* 입력 폼 */}
        <motion.form 
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {mode === 'new' ? (
            <div>
              <label className="block text-left font-bold text-gray-700 mb-2">
                트레이너 닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 지우, 웅이, 이슬이..."
                className="input-pokemon"
                maxLength={20}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1 text-left">
                🎮 포켓몬 세계에서 사용할 이름을 입력해주세요
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-left font-bold text-gray-700 mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="이전에 사용한 닉네임을 입력하세요"
                className="input-pokemon"
                disabled={isLoading}
                maxLength={20}
              />
              <p className="text-sm text-gray-500 mt-1 text-left">
                🔍 이전에 생성한 닉네임을 입력하면 계속 플레이할 수 있어요
              </p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <motion.div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full btn-pokemon ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loading-pokeball mr-2"></div>
                잠시만요...
              </div>
            ) : (
              <>
                {mode === 'new' ? '🚀 모험 시작!' : '📂 게임 불러오기'}
              </>
            )}
          </button>
        </motion.form>

        {/* 게임 소개 */}
        <motion.div 
          className="mt-8 p-4 bg-blue-50 rounded-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h3 className="font-bold text-blue-700 mb-2">🎯 게임 소개</h3>
          <div className="text-sm text-blue-600 space-y-1">
            <p>• 포켓몬과 함께 구구단을 배워요</p>
            <p>• 문제를 맞추면 포켓몬을 잡을 수 있어요</p>
            <p>• 지역별로 다른 포켓몬들이 기다려요</p>
            <p>• 레벨업하고 포켓몬 마스터가 되어보세요!</p>
          </div>
        </motion.div>

        {/* 개발자 정보 */}
        <motion.p 
          className="text-xs text-gray-400 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          초등학교 2학년 수학 교육용 게임
        </motion.p>
      </motion.div>
    </div>
  );
}