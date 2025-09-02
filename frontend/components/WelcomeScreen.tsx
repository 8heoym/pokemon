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
        {/* 포켓몬 로고 및 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* 포켓몬 로고 스타일 */}
          <div className="relative mb-6">
            <div className="pokemon-logo-container flex justify-center items-center mb-4">
              <div className="pokemon-logo-text text-5xl font-black tracking-wider transform -rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer"
                   style={{
                     background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     textShadow: '3px 3px 0px #1E3A8A, -1px -1px 0px #1E3A8A, 1px -1px 0px #1E3A8A, -1px 1px 0px #1E3A8A',
                     filter: 'drop-shadow(4px 4px 8px rgba(30, 58, 138, 0.3))'
                   }}>
                POKÉMON
              </div>
            </div>
            
            {/* 데코레이션 요소들 */}
            <div className="absolute -top-2 -left-4 animate-bounce delay-100">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="absolute -top-2 -right-4 animate-bounce delay-300">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 animate-bounce delay-500">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
          
          <motion.h1 
            className="text-3xl font-bold mb-2 font-pokemon"
            style={{
              background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            수학 모험 게임
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 mb-8 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            🎮 포켓몬과 함께 구구단을 마스터하자! 🎯
          </motion.p>
        </motion.div>

        {/* 포켓볼 스타일 모드 선택 */}
        <motion.div 
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex gap-4 mb-4">
            {/* 새로 시작하기 - 포켓볼 스타일 */}
            <motion.button
              type="button"
              onClick={() => setMode('new')}
              className={`flex-1 py-4 px-6 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                mode === 'new'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-300'
                  : 'bg-gradient-to-r from-gray-100 to-white text-red-500 border-2 border-red-200 hover:from-red-50 hover:to-red-100'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">⚪</span>
                <span>새로 시작하기</span>
              </div>
              <div className="text-xs mt-1 opacity-80">
                새로운 트레이너가 되어보세요!
              </div>
            </motion.button>
            
            {/* 이어서 하기 - 몬스터볼 스타일 */}
            <motion.button
              type="button"
              onClick={() => setMode('existing')}
              className={`flex-1 py-4 px-6 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                mode === 'existing'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-300'
                  : 'bg-gradient-to-r from-gray-100 to-white text-blue-500 border-2 border-blue-200 hover:from-blue-50 hover:to-blue-100'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🔵</span>
                <span>이어서 하기</span>
              </div>
              <div className="text-xs mt-1 opacity-80">
                이전 모험을 계속하세요!
              </div>
            </motion.button>
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
                style={{ color: '#000000' }}
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
                style={{ color: '#000000' }}
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

          {/* 포켓몬 스타일 제출 버튼 */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                : mode === 'new'
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black shadow-yellow-300 hover:scale-105 hover:shadow-xl'
                  : 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 text-white shadow-green-300 hover:scale-105 hover:shadow-xl'
            }`}
            whileHover={isLoading ? {} : { y: -2, scale: 1.02 }}
            whileTap={isLoading ? {} : { scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <motion.div 
                  className="w-6 h-6 border-4 border-gray-600 border-t-transparent rounded-full mr-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                포켓몬 세계로 이동 중...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">
                  {mode === 'new' ? '⚡' : '🔓'}
                </span>
                <span>
                  {mode === 'new' ? '모험 시작하기!' : '게임 불러오기'}
                </span>
                <span className="text-2xl">
                  {mode === 'new' ? '🚀' : '📂'}
                </span>
              </div>
            )}
          </motion.button>
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