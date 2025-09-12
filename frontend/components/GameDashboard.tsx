'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MathProblem, Pokemon } from '@/types';
import { MULTIPLICATION_ORDER, calculateLevel, getLevelProgress } from '@/utils/gameUtils';
import { calculateStarDustReward } from '@/utils/economyBalancing';
import { useProblems, useUsers } from '@/hooks/useApiCall';
import UserProfile from './UserProfile';
import AdventureMap from './AdventureMap';
import ProblemCard from './ProblemCard';
import PokedexModalInfiniteScroll from './PokedexModalInfiniteScroll';
import LeaderboardModal from './LeaderboardModal';
import LoadingScreen from './LoadingScreen';
import Confetti from 'react-confetti';
import StreakDisplay from './StreakDisplay';
import StarDustDisplay from './StarDustDisplay';
import BadgeShop from './BadgeShop';
import BadgeCase from './BadgeCase';
import BadgeUnlockAnimation from './animations/BadgeUnlockAnimation';
import { useBadgeSystem } from '@/hooks/useBadgeSystem';
import { PokemonCard, PokemonButton } from './ui';

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
  const [selectedStage, setSelectedStage] = useState<{regionId: number; stageNumber: number} | null>(null);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [showPokedex, setShowPokedex] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameMode, setGameMode] = useState<'map' | 'problem'>('map');
  // Phase 2: Motivation System modals
  const [showBadgeShop, setShowBadgeShop] = useState(false);
  const [showBadgeCase, setShowBadgeCase] = useState(false);
  const [recentStarDust, setRecentStarDust] = useState(0);
  
  // 🚀 메모리 누수 방지: 타이머 참조 저장
  const confettiTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // PRD [F-1.6]: 배지 시스템
  const {
    pendingBadgeUnlock,
    checkForNewBadges,
    initializeBadgeSystem,
    handleBadgeUnlockComplete
  } = useBadgeSystem();

  // 🚀 공통 API 훅 사용
  const { generateProblem, submitAnswer } = useProblems();
  const { getUser } = useUsers();

  // 🚀 최적화: 콜백 메모화로 불필요한 리렌더링 방지
  const refreshUserData = useCallback(async () => {
    const userData = await getUser(user.id);
    if (userData) {
      onUserUpdate(userData);
    }
  }, [user.id, getUser, onUserUpdate]);

  // 🚀 최적화: 콜백 메모화로 불필요한 리렌더링 방지
  const handleStageSelect = useCallback(async (regionId: number, stageNumber: number) => {
    setSelectedStage({ regionId, stageNumber });
    setIsLoadingProblem(true);
    
    const result = await generateProblem(user.id, regionId, 1); // regionId를 구구단 번호로 사용
    
    if (result) {
      const { problem, pokemon } = result;
      setCurrentProblem(problem);
      setCurrentPokemon(pokemon);
      setGameMode('problem');
    } else {
      alert('문제 생성에 실패했습니다. 다시 시도해주세요.');
    }
    
    setIsLoadingProblem(false);
  }, [user.id, generateProblem]);

  // 🚀 최적화된 답안 제출 처리 + Phase 2 동기부여 시스템
  const handleAnswerSubmit = async (userAnswer: number, timeSpent: number, hintsUsed: number) => {
    if (!currentProblem) return;

    const result = await submitAnswer(
      user.id,
      currentProblem.id,
      userAnswer,
      timeSpent,
      hintsUsed
    );
    
    if (result) {
      // Phase 2: 정답 시 별의모래 및 스트릭 업데이트
      if (result.isCorrect) {
        // Phase 2.3: 개선된 별의모래 계산 시스템
        const regionNumber = selectedStage?.regionId || 2;
        const difficulty = currentProblem?.difficulty === 3 ? 'hard' : 
                          currentProblem?.difficulty === 2 ? 'normal' : 'easy';
        const starDustEarned = calculateStarDustReward(
          10, // 기본 보상
          hintsUsed,
          user.currentStreak,
          difficulty,
          regionNumber
        );
        setRecentStarDust(starDustEarned);
        
        // 🚀 최적화: API 호출을 배치로 통합하여 성능 향상
        try {
          // 두 API 호출을 병렬로 실행
          await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/users/${user.id}/streak`, {
              method: 'POST'
            }),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/users/${user.id}/stardust`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: starDustEarned,
                source: 'problem_correct',
                description: `문제 정답 (${hintsUsed === 0 ? '첫 시도 성공' : '정답'})`
              })
            })
          ]);
        } catch (error) {
          console.error('Motivation system update failed:', error);
        }
      }
      
      // 사용자 데이터 새로고침
      await refreshUserData();
      
      // 정답이고 포켓몬을 잡았다면 축하 효과
      if (result.isCorrect && result.pokemonCaught?.success) {
        setShowConfetti(true);
        // 🚀 메모리 누수 방지: 기존 타이머 정리 후 새 타이머 설정
        if (confettiTimerRef.current) {
          clearTimeout(confettiTimerRef.current);
        }
        confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 5000);
      }
      
      return result;
    }
    
    // 에러 처리는 useApiCall 훅에서 자동으로 수행됨
    return null;
  };

  // 🚀 최적화: 콜백 메모화
  const handleNextProblem = useCallback(() => {
    if (selectedStage) {
      handleStageSelect(selectedStage.regionId, selectedStage.stageNumber);
    }
  }, [selectedStage, handleStageSelect]);

  // 🚀 최적화: 콜백 메모화
  const handleBackToMap = useCallback(() => {
    setGameMode('map');
    setCurrentProblem(null);
    setCurrentPokemon(null);
    setSelectedStage(null);
  }, []);

  // 컴포넌트 마운트 시 초기화 (user ID 변경시에만)
  useEffect(() => {
    // 모험 지도 모드로 시작
    setGameMode('map');
    setSelectedStage(null);
    // 별의모래 애니메이션 초기화
    setRecentStarDust(0);
  }, [user.id]);

  // 🚀 메모리 누수 방지: 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
    };
  }, []);

  // Phase 2: Motivation System handlers
  const handleClaimDailyBonus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/users/${user.id}/daily-bonus`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        setRecentStarDust(result.data.starDust);
        await refreshUserData();
        alert(`일일 보너스 획득! 별의모래 ${result.data.starDust}, 경험치 ${result.data.experience}`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Daily bonus claim failed:', error);
    }
  };
  
  const handleShopPurchase = async (itemId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/users/${user.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      const result = await response.json();
      
      if (result.success) {
        await refreshUserData();
      }
      
      return result;
    } catch (error) {
      console.error('Shop purchase failed:', error);
      return { success: false, message: '구매 처리 중 오류가 발생했습니다.' };
    }
  };
  
  const handleBadgeShopOpen = () => {
    setShowBadgeShop(true);
  };
  
  const handleBadgeCaseOpen = () => {
    setShowBadgeCase(true);
  };
  
  // 별의모래 애니메이션 타이머 정리
  useEffect(() => {
    if (recentStarDust > 0) {
      const timer = setTimeout(() => setRecentStarDust(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentStarDust]);

  // PRD [F-1.6]: 배지 시스템 초기화 (사용자 변경 시만)
  useEffect(() => {
    initializeBadgeSystem(user);
  }, [user.id, initializeBadgeSystem]);

  // PRD [F-1.6]: 새 배지 체크 (완료된 테이블 변경 시만)
  useEffect(() => {
    checkForNewBadges(user);
  }, [user.completedTables, checkForNewBadges]);

  if (isLoadingProblem) {
    return <LoadingScreen message="새로운 포켓몬 문제를 준비하는 중..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
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

      {/* 상단 사용자 정보 - 문제 풀이 모드에서는 간소화 */}
      <div className={gameMode === 'problem' ? 'hidden md:block' : ''}>
        <UserProfile 
          user={user}
        />
      </div>

      {/* 메인 게임 영역 */}
      <AnimatePresence mode="wait">
        {gameMode === 'map' ? (
          <motion.div
            key="adventure-map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <AdventureMap
              user={user}
              onStageSelect={handleStageSelect}
              selectedStage={selectedStage}
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
            {currentProblem && currentPokemon && selectedStage && (
              <ProblemCard
                problem={currentProblem}
                pokemon={currentPokemon}
                user={user}
                onAnswerSubmit={handleAnswerSubmit}
                onNextProblem={handleNextProblem}
                onBackToSelect={handleBackToMap}
                stageInfo={selectedStage}
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

      {/* Phase 2: 동기부여 시스템 모달들 */}
      <BadgeShop
        user={user}
        isOpen={showBadgeShop}
        onClose={() => setShowBadgeShop(false)}
        onPurchase={handleShopPurchase}
      />

      <BadgeCase
        user={user}
        isOpen={showBadgeCase}
        onClose={() => setShowBadgeCase(false)}
      />

      {/* Phase 2: 동기부여 시스템 영역 - 문제 풀이 모드가 아닐 때만 표시 */}
      {gameMode === 'map' && (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
        {/* 스트릭 디스플레이 */}
        <StreakDisplay 
          user={user} 
          onClaimDailyBonus={handleClaimDailyBonus}
        />
        
        {/* 별의모래 & 상점 */}
        <div className="space-y-4">
          <StarDustDisplay 
            user={user} 
            recentEarned={recentStarDust}
          />
          <div className="grid grid-cols-2 gap-3">
            <PokemonButton
              onClick={handleBadgeShopOpen}
              variant="primary"
              size="sm"
              className="flex items-center justify-center space-x-2"
            >
              <span>🏪</span>
              <span>상점</span>
            </PokemonButton>
            <PokemonButton
              onClick={handleBadgeCaseOpen}
              variant="outline"
              size="sm"
              className="flex items-center justify-center space-x-2"
            >
              <span>🏆</span>
              <span>배지</span>
            </PokemonButton>
          </div>
        </div>
        </motion.div>
      )}

      {/* 하단 통계 정보 - 문제 풀이 모드가 아닐 때만 표시 */}
      {gameMode === 'map' && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >

        {/* 포켓몬 수집 현황 */}
        <PokemonCard size="sm" className="text-center">
          <h3 className="font-bold text-green-600 mb-2">📱 포켓몬 도감</h3>
          <div className="text-2xl font-bold mb-2 text-gray-800">
            {user.caughtPokemon.length}마리
          </div>
          <div className="text-sm text-gray-600">
            포켓몬을 수집했어요!
          </div>
          <PokemonButton
            onClick={() => setShowPokedex(true)}
            variant="success"
            size="xs"
            className="mt-2"
          >
            도감 보기
          </PokemonButton>
        </PokemonCard>

        {/* 구구단 완성 현황 */}
        <PokemonCard size="sm" className="text-center">
          <h3 className="font-bold text-purple-600 mb-2">🧮 구구단 마스터</h3>
          <div className="text-2xl font-bold mb-2 text-gray-800">
            {user.completedTables.length}/8
          </div>
          <div className="text-sm text-gray-600">
            구구단을 완료했어요!
          </div>
          <div className="mt-2 text-xs text-purple-600">
            {user.completedTables.length === 8 ? '🏆 모든 구구단 완료!' : '💪 계속 도전하세요!'}
          </div>
        </PokemonCard>
        </motion.div>
      )}

      {/* PRD [F-1.6]: 배지 획득 축하 애니메이션 */}
      <BadgeUnlockAnimation
        isVisible={!!pendingBadgeUnlock}
        badgeName={pendingBadgeUnlock?.name || ''}
        badgeDescription={pendingBadgeUnlock?.description || ''}
        badgeEmoji={pendingBadgeUnlock?.emoji || '🏆'}
        regionTheme={pendingBadgeUnlock?.regionTheme || 'grassland'}
        onComplete={handleBadgeUnlockComplete}
      />
    </div>
  );
}