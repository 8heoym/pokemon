import React, { useState, useEffect } from 'react';
import PokemonImageCard from './PokemonImageCard';
import StarDustAnimation from './animations/StarDustAnimation';
import PokemonReaction from './animations/PokemonReaction';
import HintBubble from './ui/HintBubble';
import { useAnimationSequence } from '@/hooks/useAnimationSequence';

interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  imageUrl: string;
  rarity: string;
}

interface MathProblem {
  id: string;
  story: string;
  hint: string;
  equation: string;
  answer: number;
  difficulty: number;
}

interface ProblemCardProps {
  problem: MathProblem | null;
  pokemon: Pokemon | null;
  user: any;
  onAnswerSubmit: (userAnswer: number, timeSpent: number, hintsUsed: number) => Promise<any>;
  onNextProblem: () => void;
  onBackToSelect: () => void;
  stageInfo?: {regionId: number; stageNumber: number};
}

const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  pokemon,
  user,
  onAnswerSubmit,
  onNextProblem,
  onBackToSelect,
  stageInfo
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'correct' | 'incorrect' | null; message: string}>({
    type: null,
    message: ''
  });
  const [startTime] = useState(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHintBubble, setShowHintBubble] = useState(false);
  const [autoNextTimer, setAutoNextTimer] = useState(0);
  const [showAutoNextOptions, setShowAutoNextOptions] = useState(false);
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(false); // 자동 진행 비활성화
  
  // PRD [F-3.2]: 동적 피드백 시스템
  const {
    animationState,
    triggerCorrectAnswer,
    triggerIncorrectAnswer,
    triggerHintRequest,
    triggerProblemStart,
    setIdleState,
    handleStarDustComplete,
    handlePokemonReactionComplete
  } = useAnimationSequence();

  // 문제 시작 시 격려 애니메이션
  useEffect(() => {
    if (problem) {
      triggerProblemStart();
    }
  }, [problem, triggerProblemStart]);

  // 자동 진행 타이머 (정답 후 5초 대기) - 사용자가 활성화한 경우에만
  useEffect(() => {
    if (autoProgressEnabled && showAutoNextOptions && feedback.type === 'correct') {
      setAutoNextTimer(5);
      
      const countdown = setInterval(() => {
        setAutoNextTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            // 자동으로 다음 문제로 진행
            onNextProblem();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [autoProgressEnabled, showAutoNextOptions, feedback.type, onNextProblem]);

  // 자동 진행 활성화 시 즉시 타이머 시작
  useEffect(() => {
    if (autoProgressEnabled && showAutoNextOptions && feedback.type === 'correct' && autoNextTimer === 0) {
      setAutoNextTimer(5);
    }
  }, [autoProgressEnabled, showAutoNextOptions, feedback.type, autoNextTimer]);

  // 타이머 취소 함수
  const cancelAutoNext = () => {
    setAutoNextTimer(0);
    setAutoProgressEnabled(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 상세한 입력 검증 및 로깅
    const trimmedAnswer = userAnswer.trim();
    
    if (!trimmedAnswer) {
      console.log('🚫 입력 검증 실패: 빈 답안');
      setFeedback({
        type: 'incorrect',
        message: '답을 입력해주세요.'
      });
      return;
    }

    // 숫자 검증
    const numericAnswer = parseInt(trimmedAnswer, 10);
    if (isNaN(numericAnswer)) {
      console.log('🚫 입력 검증 실패: 숫자가 아님', { userInput: trimmedAnswer });
      setFeedback({
        type: 'incorrect',
        message: '숫자만 입력해주세요.'
      });
      return;
    }

    // 범위 검증 (음수 방지)
    if (numericAnswer < 0) {
      console.log('🚫 입력 검증 실패: 음수', { userInput: numericAnswer });
      setFeedback({
        type: 'incorrect',
        message: '0 이상의 숫자를 입력해주세요.'
      });
      return;
    }

    if (!isSubmitting) {
      // 제출 전 상세 로깅
      console.log('📝 답안 제출 시작:', {
        problemId: problem?.id,
        userInput: {
          raw: userAnswer,
          trimmed: trimmedAnswer,
          parsed: numericAnswer,
          type: typeof numericAnswer
        },
        problemEquation: problem?.equation,
        expectedAnswer: problem?.answer,
        timestamp: new Date().toISOString()
      });

      setIsSubmitting(true);
      try {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const result = await onAnswerSubmit(numericAnswer, timeSpent, hintsUsed);
        
        if (result.isCorrect) {
          // PRD [F-3.2]: 정답 시 별의모래 애니메이션 + 파트너 포켓몬 기쁨 표현
          const starDustAmount = result.experience || 10; // 획득한 경험치만큼 별의모래
          triggerCorrectAnswer(starDustAmount, 50, 60); // 화면 중앙에서 시작
          
          setFeedback({
            type: 'correct',
            message: result.pokemonCaught?.success 
              ? `정답입니다! ${result.pokemonCaught.pokemon.koreanName}을(를) 잡았어요! 🎉`
              : '정답입니다! 🎉'
          });
          // 정답인 경우에만 답변 초기화
          setUserAnswer('');
          
          // 자동 진행 옵션 표시 (체크박스 상태 초기화)
          setShowAutoNextOptions(true);
          setAutoProgressEnabled(false); // 기본값으로 비활성화
        } else {
          // PRD [F-3.2]: 오답 시 파트너 포켓몬 아쉬움 표현
          triggerIncorrectAnswer();
          
          setFeedback({
            type: 'incorrect',
            message: result.feedback || '틀렸어요. 다시 생각해보세요!'
          });
          // 틀린 경우에는 답변을 초기화하지 않고 보존
        }
      } catch (error) {
        console.error('❌ 답안 제출 오류:', error);
        setFeedback({
          type: 'incorrect',
          message: '오류가 발생했습니다. 다시 시도해주세요.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleHint = () => {
    setHintsUsed(prev => prev + 1);
    // PRD [F-3.3]: 힌트 요청 시 도우미 포켓몬 등장
    triggerHintRequest();
    setShowHintBubble(true);
  };

  const handleCloseHint = () => {
    setShowHintBubble(false);
  };

  if (isSubmitting) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">답안을 처리하는 중...</p>
      </div>
    );
  }

  if (!problem || !pokemon) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <p className="text-gray-600">문제를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
      {/* 포켓몬 이미지 카드 - 모바일에서 크기 축소 */}
      <div className="flex justify-center mb-4 md:mb-6">
        <div className="transform scale-75 md:scale-100">
          <PokemonImageCard pokemon={pokemon} />
        </div>
      </div>

      {/* 문제 */}
      <div className="mb-4 md:mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">문제</h4>
        <p className="text-gray-700 leading-relaxed mb-4">{problem.story}</p>
        
        {feedback && feedback.type && (
          <div className={`p-3 rounded-lg mb-4 ${
            feedback.type === 'correct' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {feedback.message}
          </div>
        )}
      </div>

      {/* 답변 입력 - 정답 후 비활성화 */}
      {!feedback.type && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              답을 입력하세요:
            </label>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="input-pokemon"
              placeholder="답을 입력하세요"
              min="0"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!userAnswer.trim() || isSubmitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? '제출 중...' : '답안 제출'}
            </button>
            <button
              type="button"
              onClick={handleHint}
              disabled={isSubmitting}
              className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors"
            >
              힌트 💡
            </button>
          </div>
        </form>
      )}

      {/* 답변 완료 후 상세 정보 표시 */}
      {feedback.type && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  입력한 답:
                </label>
                <div className={`px-4 py-3 rounded-lg font-medium ${
                  feedback.type === 'correct' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {feedback.type === 'correct' ? problem?.answer : userAnswer || '(입력 없음)'}
                </div>
              </div>
              
              {feedback.type === 'incorrect' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    정답:
                  </label>
                  <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg font-medium">
                    {problem?.answer}
                  </div>
                </div>
              )}
              
              {feedback.type === 'correct' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    결과:
                  </label>
                  <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg font-medium flex items-center">
                    <span className="mr-2">🎉</span>
                    정답!
                  </div>
                </div>
              )}
            </div>
            
            {/* 문제 equation 표시 */}
            {problem?.equation && (
              <div className="mt-3 pt-3 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문제 식:
                </label>
                <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg font-mono text-lg">
                  {problem.equation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 힌트 표시 */}
      {problem.hint && hintsUsed > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">💡 힌트: {problem.hint}</p>
        </div>
      )}

      {/* 정답/오답 후 버튼들 */}
      {feedback.type && (
        <div className="mt-4 space-y-3">
          {feedback.type === 'correct' ? (
            <>
              {/* 정답 시 진행 옵션 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 font-medium mb-3 flex items-center justify-between">
                  <span>🎉 정답입니다! 다음은 어떻게 하시겠어요?</span>
                  {autoProgressEnabled && autoNextTimer > 0 && (
                    <div className="flex items-center text-sm bg-green-100 px-2 py-1 rounded">
                      <span className="mr-1">⏱️</span>
                      <span>{autoNextTimer}초 후 자동 진행</span>
                    </div>
                  )}
                </div>
                
                {/* 자동 진행 설정 */}
                <div className="mb-3 flex items-center text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoProgressEnabled}
                      onChange={(e) => setAutoProgressEnabled(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-gray-600">5초 후 자동으로 다음 문제로 진행</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      cancelAutoNext();
                      onNextProblem();
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">⚡</span>
                    같은 스테이지 계속하기
                    {autoProgressEnabled && autoNextTimer > 0 && (
                      <span className="ml-2 text-xs bg-green-400 px-2 py-1 rounded">
                        {autoNextTimer}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      cancelAutoNext();
                      onBackToSelect();
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">🗺️</span>
                    모험 지도로 돌아가기
                  </button>
                </div>
                {autoProgressEnabled && autoNextTimer > 0 && (
                  <button
                    onClick={cancelAutoNext}
                    className="w-full mt-2 text-sm text-green-600 hover:text-green-800 underline"
                  >
                    자동 진행 취소
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 오답 시 재시도 옵션 */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-orange-800 font-medium mb-3 flex items-center">
                  💪 다시 한번 도전해보세요!
                </div>
                <button
                  onClick={() => {
                    setFeedback({ type: null, message: '' });
                    setUserAnswer('');
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  다시 시도하기 🔄
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* PRD [F-3.2]: 동적 피드백 애니메이션 */}
      <StarDustAnimation
        isActive={animationState.starDust.isActive}
        amount={animationState.starDust.amount}
        sourceX={animationState.starDust.sourceX}
        sourceY={animationState.starDust.sourceY}
        onComplete={handleStarDustComplete}
      />
      
      <PokemonReaction
        isVisible={animationState.pokemonReaction.isVisible}
        reaction={animationState.pokemonReaction.reaction}
        pokemonName={pokemon?.koreanName || '파트너'}
        onComplete={handlePokemonReactionComplete}
      />

      {/* PRD [F-3.3]: 인터랙티브 힌트 시스템 */}
      <HintBubble
        isVisible={!!(showHintBubble && hintsUsed > 0 && problem?.hint)}
        hintText={problem?.hint || ''}
        helperPokemon="rotom"
        onClose={handleCloseHint}
        position="bottom-right"
      />
    </div>
  );
};

export default ProblemCard;