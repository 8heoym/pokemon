'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
  const [particles, setParticles] = useState<Array<{id: number, emoji: string, x: number, y: number}>>([]);

  useEffect(() => {
    const emojis = ['⚡', '🔥', '💧', '🌿', '⭐', '🌙'];
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(newParticles);
  }, []);

  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (mode === 'new') {
      if (nickname.trim().length === 0) {
        setFormError('닉네임을 입력해주세요! ⚡');
        return;
      }
      if (nickname.trim().length > 20) {
        setFormError('닉네임은 20자 이하로 입력해주세요! 😅');
        return;
      }
      await onCreateUser(nickname.trim());
    } else {
      if (userId.trim().length === 0) {
        setFormError('닉네임을 입력해주세요! 🔍');
        return;
      }
      await onLoadUser(userId.trim());
    }
  };

  const handleModeChange = (newMode: 'new' | 'existing') => {
    setMode(newMode);
    setFormError('');
    setNickname('');
    setUserId('');
  };

  return (
    <div className="welcome-container">
      {/* Interactive Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="pokemon-particles">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute text-6xl opacity-10"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`
              }}
              initial={{ 
                scale: 0.5 + Math.random() * 0.5,
                rotate: 0
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 200],
                rotate: [0, 360]
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {particle.emoji}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Floating Pokeball */}
        <motion.div
          className="absolute top-20 left-1/2 transform -translate-x-1/2"
          initial={{ y: 0 }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="pokeball-3d">
            <div className="pokeball-top"></div>
            <div className="pokeball-bottom"></div>
            <div className="pokeball-center"></div>
          </div>
        </motion.div>

        <motion.div 
          className="welcome-card"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Hero Title Section */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.h1 
              className="hero-title mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              포켓몬
              <span className="block text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600">
                수학 모험
              </span>
            </motion.h1>
            
            <motion.p 
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              지우와 피카츄와 함께하는 구구단 마스터 여행
            </motion.p>
          </motion.div>

          {/* Apple-style Mode Selection Cards */}
          <motion.div 
            className="mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="grid gap-4 mb-6">
              {/* 새로 시작하기 - 3D 포켓볼 카드 */}
              <motion.button
                type="button"
                onClick={() => handleModeChange('new')}
                className={`mode-card ${mode === 'new' ? 'mode-card-active-red' : 'mode-card-inactive'}`}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="card-content">
                  <div className="flex items-center justify-center mb-3">
                    <motion.div 
                      className="pokeball-icon-red"
                      whileHover={{ rotate: 15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-16 h-16 rounded-full relative overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-b from-red-500 to-red-600"></div>
                        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-b from-gray-100 to-white"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full border-4 border-gray-800 shadow-inner"></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">새로 시작하기</h3>
                  <p className="text-sm opacity-80">
                    새로운 트레이너로 모험을 시작하세요!
                  </p>
                  <div className="ios-chevron">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </div>
                </div>
              </motion.button>
              
              {/* 이어서 하기 - 3D 마스터볼 카드 */}
              <motion.button
                type="button"
                onClick={() => handleModeChange('existing')}
                className={`mode-card ${mode === 'existing' ? 'mode-card-active-blue' : 'mode-card-inactive'}`}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="card-content">
                  <div className="flex items-center justify-center mb-3">
                    <motion.div 
                      className="pokeball-icon-blue"
                      whileHover={{ rotate: -15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-16 h-16 rounded-full relative overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600"></div>
                        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-b from-gray-100 to-white"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full border-4 border-gray-800 shadow-inner"></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">이어서 하기</h3>
                  <p className="text-sm opacity-80">
                    이전 모험을 계속해서 플레이하세요!
                  </p>
                  <div className="ios-chevron">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Apple-style Input Form */}
          <AnimatePresence mode="wait">
            <motion.form 
              key={mode}
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {mode === 'new' ? (
                <motion.div 
                  className="input-section"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <label className="input-label">
                    트레이너 닉네임
                  </label>
                  <div className="input-container">
                    <motion.input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="예: 지우, 웅이, 이슬이..."
                      className="apple-input"
                      maxLength={20}
                      disabled={isLoading}
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <div className="input-icon">
                      ⚡
                    </div>
                  </div>
                  <p className="input-help">
                    포켓몬 세계에서 사용할 트레이너 이름을 입력해주세요
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  className="input-section"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <label className="input-label">
                    닉네임
                  </label>
                  <div className="input-container">
                    <motion.input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="이전에 사용한 닉네임을 입력하세요"
                      className="apple-input"
                      disabled={isLoading}
                      maxLength={20}
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <div className="input-icon">
                      🔍
                    </div>
                  </div>
                  <p className="input-help">
                    이전에 만든 트레이너 이름을 입력하면 모험을 계속할 수 있어요
                  </p>
                </motion.div>
              )}

              {/* Error Messages with Apple-style Alert */}
              <AnimatePresence>
                {(error || formError) && (
                  <motion.div 
                    className="error-alert"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="error-content">
                      <span className="error-icon">⚠️</span>
                      <span className="error-text">{error || formError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Apple-style Action Button */}
              <motion.button
                type="submit"
                disabled={isLoading || (mode === 'new' ? !nickname.trim() : !userId.trim())}
                className="apple-button"
                whileHover={isLoading ? {} : { y: -3, scale: 1.01 }}
                whileTap={isLoading ? {} : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <motion.div 
                      className="pokeball-spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="ml-3">포켓몬 세계로 이동 중...</span>
                  </div>
                ) : (
                  <div className="button-content">
                    <span className="text-2xl mr-2">
                      {mode === 'new' ? '🎆' : '🎮'}
                    </span>
                    <span className="font-semibold">
                      {mode === 'new' ? '모험 시작하기' : '게임 불러오기'}
                    </span>
                    <motion.span 
                      className="text-xl ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Game Features Preview */}
          <motion.div 
            className="features-grid"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="feature-card">
                <div className="feature-icon">🎮</div>
                <p className="feature-text">게임화 학습</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <p className="feature-text">맞춤형 AI</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <p className="feature-text">리더보드</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <p className="feature-text">모바일 최적화</p>
              </div>
            </div>
          </motion.div>

          {/* Bottom Info */}
          <motion.div 
            className="bottom-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p>초등학교 2학년 수학 교육용 게임</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}