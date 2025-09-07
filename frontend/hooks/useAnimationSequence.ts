'use client';

import { useState, useCallback } from 'react';

interface AnimationState {
  starDust: {
    isActive: boolean;
    amount: number;
    sourceX: number;
    sourceY: number;
  };
  pokemonReaction: {
    isVisible: boolean;
    reaction: 'joy' | 'disappointment' | 'thinking' | 'excitement' | 'idle';
  };
}

export const useAnimationSequence = () => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    starDust: {
      isActive: false,
      amount: 0,
      sourceX: 50,
      sourceY: 70
    },
    pokemonReaction: {
      isVisible: false,
      reaction: 'idle'
    }
  });

  // PRD [F-3.2]: 정답 시 애니메이션 시퀀스
  const triggerCorrectAnswer = useCallback((starDustAmount: number, sourceX?: number, sourceY?: number) => {
    // 1. 파트너 포켓몬 기쁨 표현
    setAnimationState(prev => ({
      ...prev,
      pokemonReaction: {
        isVisible: true,
        reaction: 'joy'
      }
    }));

    // 2. 별의모래 애니메이션 (약간의 지연)
    setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        starDust: {
          isActive: true,
          amount: starDustAmount,
          sourceX: sourceX || 50,
          sourceY: sourceY || 70
        }
      }));
    }, 300);
  }, []);

  // PRD [F-3.2]: 오답 시 애니메이션
  const triggerIncorrectAnswer = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      pokemonReaction: {
        isVisible: true,
        reaction: 'disappointment'
      }
    }));
  }, []);

  // 힌트 요청 시 애니메이션
  const triggerHintRequest = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      pokemonReaction: {
        isVisible: true,
        reaction: 'thinking'
      }
    }));
  }, []);

  // 문제 시작 시 격려 애니메이션
  const triggerProblemStart = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      pokemonReaction: {
        isVisible: true,
        reaction: 'excitement'
      }
    }));
  }, []);

  // 아이들 상태로 전환
  const setIdleState = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      pokemonReaction: {
        isVisible: true,
        reaction: 'idle'
      }
    }));
  }, []);

  // 별의모래 애니메이션 완료 콜백
  const handleStarDustComplete = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      starDust: {
        ...prev.starDust,
        isActive: false
      }
    }));
  }, []);

  // 포켓몬 리액션 완료 콜백
  const handlePokemonReactionComplete = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      pokemonReaction: {
        ...prev.pokemonReaction,
        isVisible: false
      }
    }));
  }, []);

  // 모든 애니메이션 정리
  const clearAllAnimations = useCallback(() => {
    setAnimationState({
      starDust: {
        isActive: false,
        amount: 0,
        sourceX: 50,
        sourceY: 70
      },
      pokemonReaction: {
        isVisible: false,
        reaction: 'idle'
      }
    });
  }, []);

  return {
    animationState,
    triggerCorrectAnswer,
    triggerIncorrectAnswer,
    triggerHintRequest,
    triggerProblemStart,
    setIdleState,
    handleStarDustComplete,
    handlePokemonReactionComplete,
    clearAllAnimations
  };
};