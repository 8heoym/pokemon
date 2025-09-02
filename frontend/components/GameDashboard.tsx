'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MathProblem, Pokemon } from '@/types';
import { problemAPI, userAPI } from '@/utils/api';
import { MULTIPLICATION_ORDER, calculateLevel, getLevelProgress } from '@/utils/gameUtils';
import UserProfile from './UserProfile';
import MultiplicationTableSelector from './MultiplicationTableSelector';
import ProblemCard from './ProblemCard';
import PokedexModalInfiniteScroll from './PokedexModalInfiniteScroll';
import LeaderboardModal from './LeaderboardModal';
import LoadingScreen from './LoadingScreen';
import Confetti from 'react-confetti';

interface GameDashboardProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onLogout: () => void;
}

export default function GameDashboard({
  user,
  onUserUpdate,
  onLogout
}: GameDashboardProps) {
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [showPokedex, setShowPokedex] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameMode, setGameMode] = useState<'select' | 'problem'>('select');

  // 사용자 정보 새로고침
  const refreshUserData = async () => {
    try {
      const response = await userAPI.get(user.id);
      onUserUpdate(response.data);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // 새 문제 생성
  const generateNewProblem = async (tableNumber: number, difficulty: 1 | 2 | 3 = 1) => {
    try {
      setIsLoadingProblem(true);
      
      const response = await problemAPI.generate(user.id, tableNumber, difficulty);
      const { problem, pokemon } = response.data;
      
      setCurrentProblem(problem);
      setCurrentPokemon(pokemon);
      setGameMode('problem');
      
    } catch (error) {
      console.error('Failed to generate problem:', error);
      alert('문제 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoadingProblem(false);
    }
  };

  // 답안 제출 처리
  const handleAnswerSubmit = async (userAnswer: number, timeSpent: number, hintsUsed: number) => {
    if (!currentProblem) return;

    try {
      const response = await problemAPI.submit(
        user.id,
        currentProblem.id,
        userAnswer,
        timeSpent,
        hintsUsed
      );
      
      const result = response.data;
      
      // 사용자 데이터 새로고침
      await refreshUserData();
      
      // 정답이고 포켓몬을 잡았다면 축하 효과
      if (result.isCorrect && result.pokemonCaught?.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      return result;
      
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      
      // 백엔드에서 새 문제가 필요하다고 알려주는 경우
      if (error.response?.data?.requireNewProblem) {
        alert(error.response.data.error || '문제가 만료되었습니다. 새로운 문제를 받겠습니다.');
        // 새로운 문제 자동 생성
        await generateNewProblem(selectedTable);
        // 빈 결과 반환하여 ProblemCard가 정상 처리하도록 함
        return { isCorrect: false, correctAnswer: 0, feedback: '새로운 문제를 받았습니다. 다시 시도해주세요.' };
      }
      
      throw error;
    }
  };

  // 다음 문제로 이동
  const handleNextProblem = () => {
    generateNewProblem(selectedTable);
  };

  // 구구단 선택 화면으로 돌아가기
  const handleBackToSelect = () => {
    setGameMode('select');
    setCurrentProblem(null);
    setCurrentPokemon(null);
  };

  // 컴포넌트 마운트 시 사용자 추천 구구단 설정
  useEffect(() => {
    // 완료하지 않은 구구단 중 가장 쉬운 것 선택
    const incompleteTables = MULTIPLICATION_ORDER.filter(
      table => !user.completedTables.includes(table)
    );
    if (incompleteTables.length > 0) {
      setSelectedTable(incompleteTables[0]);
    }
  }, [user]);

  if (isLoadingProblem) {
    return <LoadingScreen message="새로운 포켓몬 문제를 준비하는 중..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 축하 효과 */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* 상단 사용자 정보 */}
      <UserProfile 
        user={user}
      />

      {/* 메인 게임 영역 */}
      <AnimatePresence mode="wait">
        {gameMode === 'select' ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <MultiplicationTableSelector
              user={user}
              selectedTable={selectedTable}
              onTableSelect={setSelectedTable}
              onStartProblem={(table) => generateNewProblem(table)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="problem"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentProblem && currentPokemon && (
              <ProblemCard
                problem={currentProblem}
                pokemon={currentPokemon}
                user={user}
                onAnswerSubmit={handleAnswerSubmit}
                onNextProblem={handleNextProblem}
                onBackToSelect={handleBackToSelect}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 포켓몬 도감 모달 */}
      <PokedexModalInfiniteScroll
        isOpen={showPokedex}
        userId={user.id}
        onClose={() => setShowPokedex(false)}
      />

      {/* 리더보드 모달 */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        leaderboard={[]}
        loading={false}
      />

      {/* 하단 통계 정보 */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {/* 레벨 정보 */}
        <div className="pokemon-card p-4 text-center">
          <h3 className="font-bold text-blue-600 mb-2">🎯 레벨 진행률</h3>
          <div className="text-2xl font-bold mb-2">Lv.{user.trainerLevel}</div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getLevelProgress(user.totalExperience)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {user.totalExperience} EXP
          </p>
        </div>

        {/* 포켓몬 수집 현황 */}
        <div className="pokemon-card p-4 text-center">
          <h3 className="font-bold text-green-600 mb-2">📱 포켓몬 도감</h3>
          <div className="text-2xl font-bold mb-2">
            {user.caughtPokemon.length}마리
          </div>
          <div className="text-sm text-gray-600">
            포켓몬을 수집했어요!
          </div>
          <button
            onClick={() => setShowPokedex(true)}
            className="mt-2 text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
          >
            도감 보기
          </button>
        </div>

        {/* 구구단 완성 현황 */}
        <div className="pokemon-card p-4 text-center">
          <h3 className="font-bold text-purple-600 mb-2">🧮 구구단 마스터</h3>
          <div className="text-2xl font-bold mb-2">
            {user.completedTables.length}/8
          </div>
          <div className="text-sm text-gray-600">
            구구단을 완료했어요!
          </div>
          <div className="mt-2 text-xs text-purple-600">
            {user.completedTables.length === 8 ? '🏆 모든 구구단 완료!' : '💪 계속 도전하세요!'}
          </div>
        </div>
      </motion.div>

      {/* 게임 팁 */}
      <motion.div 
        className="pokemon-card p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h3 className="font-bold text-blue-600 mb-3 text-center">💡 게임 팁</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="font-bold text-blue-600">🎯 정확도</span>
            <p className="text-gray-600">천천히 생각해서 정확하게 답하세요!</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <span className="font-bold text-green-600">⚡ 속도</span>
            <p className="text-gray-600">빨리 답할수록 더 많은 경험치를 얻어요!</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <span className="font-bold text-yellow-600">💡 힌트</span>
            <p className="text-gray-600">어려우면 힌트를 활용해보세요!</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <span className="font-bold text-purple-600">🔄 연습</span>
            <p className="text-gray-600">같은 구구단을 반복하면 마스터해요!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}