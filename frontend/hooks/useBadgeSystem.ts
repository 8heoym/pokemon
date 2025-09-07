'use client';

import { useState, useCallback, useEffect } from 'react';
import { User } from '@/types';

interface BadgeUnlock {
  id: string;
  name: string;
  description: string;
  emoji: string;
  regionTheme: 'grassland' | 'pond' | 'garden' | 'volcano' | 'forest' | 'desert' | 'cave' | 'peak';
}

const REGION_BADGES = {
  2: {
    id: 'grassland_master',
    name: '피카츄의 풀숲 정복자',
    description: '2단 구구단 지역을 완전히 정복했습니다',
    emoji: '🌿',
    regionTheme: 'grassland' as const
  },
  3: {
    id: 'pond_master',
    name: '꼬부기의 연못 수호자', 
    description: '3단 구구단 지역을 완전히 정복했습니다',
    emoji: '💧',
    regionTheme: 'pond' as const
  },
  4: {
    id: 'garden_master',
    name: '이상해씨의 정원 관리자',
    description: '4단 구구단 지역을 완전히 정복했습니다', 
    emoji: '🌸',
    regionTheme: 'garden' as const
  },
  5: {
    id: 'volcano_master',
    name: '파이리의 화산 정복자',
    description: '5단 구구단 지역을 완전히 정복했습니다',
    emoji: '🔥', 
    regionTheme: 'volcano' as const
  },
  6: {
    id: 'forest_master',
    name: '라이츄의 숲 수호자',
    description: '6단 구구단 지역을 완전히 정복했습니다',
    emoji: '🍃',
    regionTheme: 'forest' as const
  },
  7: {
    id: 'desert_master',
    name: '나인테일의 사막 정복자', 
    description: '7단 구구단 지역을 완전히 정복했습니다',
    emoji: '🏜️',
    regionTheme: 'desert' as const
  },
  8: {
    id: 'cave_master',
    name: '골덕의 동굴 탐험가',
    description: '8단 구구단 지역을 완전히 정복했습니다',
    emoji: '💎',
    regionTheme: 'cave' as const
  },
  9: {
    id: 'peak_master',
    name: '윈디의 설산 정복자',
    description: '9단 구구단 지역을 완전히 정복했습니다',
    emoji: '❄️',
    regionTheme: 'peak' as const
  }
} as const;

export const useBadgeSystem = () => {
  const [pendingBadgeUnlock, setPendingBadgeUnlock] = useState<BadgeUnlock | null>(null);
  const [previousCompletedTables, setPreviousCompletedTables] = useState<number[]>([]);

  // PRD [F-1.6]: 지역 완료 감지 및 배지 획득 트리거
  const checkForNewBadges = useCallback((user: User) => {
    if (!user.completedTables) return;

    const currentCompleted = user.completedTables;
    const newlyCompleted = currentCompleted.filter(
      table => !previousCompletedTables.includes(table)
    );

    // 새로 완료된 구구단이 있는지 확인
    if (newlyCompleted.length > 0) {
      const latestCompleted = newlyCompleted[newlyCompleted.length - 1];
      const badge = REGION_BADGES[latestCompleted as keyof typeof REGION_BADGES];
      
      if (badge) {
        console.log(`🏆 새 배지 획득: ${badge.name}`);
        setPendingBadgeUnlock(badge);
      }
    }

    setPreviousCompletedTables([...currentCompleted]);
  }, [previousCompletedTables]);

  // 초기화 시 현재 완료된 테이블 설정
  const initializeBadgeSystem = useCallback((user: User) => {
    if (user.completedTables && previousCompletedTables.length === 0) {
      setPreviousCompletedTables([...user.completedTables]);
    }
  }, [previousCompletedTables]);

  // 배지 획득 애니메이션 완료
  const handleBadgeUnlockComplete = useCallback(() => {
    setPendingBadgeUnlock(null);
  }, []);

  // 수동 배지 트리거 (테스트/디버깅용)
  const triggerBadgeUnlock = useCallback((tableNumber: number) => {
    const badge = REGION_BADGES[tableNumber as keyof typeof REGION_BADGES];
    if (badge) {
      setPendingBadgeUnlock(badge);
    }
  }, []);

  // 모든 배지 정보 조회
  const getAllBadgeInfo = useCallback(() => {
    return REGION_BADGES;
  }, []);

  // 특정 구구단의 배지 정보 조회
  const getBadgeInfo = useCallback((tableNumber: number) => {
    return REGION_BADGES[tableNumber as keyof typeof REGION_BADGES] || null;
  }, []);

  // 획득한 배지 개수 계산
  const getEarnedBadgesCount = useCallback((user: User) => {
    return user.completedTables?.length || 0;
  }, []);

  // 전체 배지 진행률 계산
  const getBadgeProgress = useCallback((user: User) => {
    const totalBadges = Object.keys(REGION_BADGES).length;
    const earnedBadges = getEarnedBadgesCount(user);
    return {
      earned: earnedBadges,
      total: totalBadges,
      percentage: Math.round((earnedBadges / totalBadges) * 100)
    };
  }, [getEarnedBadgesCount]);

  return {
    pendingBadgeUnlock,
    checkForNewBadges,
    initializeBadgeSystem,
    handleBadgeUnlockComplete,
    triggerBadgeUnlock,
    getAllBadgeInfo,
    getBadgeInfo,
    getEarnedBadgesCount,
    getBadgeProgress
  };
};