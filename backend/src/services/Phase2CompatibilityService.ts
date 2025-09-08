import { supabase } from '../config/supabase';

/**
 * Phase 2 호환성 서비스
 * 데이터베이스 스키마 변경 없이 Phase 2 기능을 구현
 */
export class Phase2CompatibilityService {

  /**
   * 사용자의 Phase 2 데이터를 가져오기 (호환성 모드)
   */
  async getUserWithPhase2Data(userId: string): Promise<any> {
    try {
      // 기존 사용자 데이터 조회
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new Error(`사용자 조회 실패: ${userError.message}`);
      }

      // Phase 2 데이터 기본값으로 확장
      const phase2User = {
        ...user,
        // 스트릭 시스템
        current_streak: this.getStoredValue(userId, 'current_streak', 0),
        longest_streak: this.getStoredValue(userId, 'longest_streak', 0),
        last_active_date: this.getStoredValue(userId, 'last_active_date', new Date().toISOString()),
        
        // 별의모래 시스템
        star_dust: this.getStoredValue(userId, 'star_dust', 100),
        
        // 배지 및 구매 아이템
        earned_badges: this.getStoredValue(userId, 'earned_badges', []),
        purchased_items: this.getStoredValue(userId, 'purchased_items', [])
      };

      return phase2User;

    } catch (error: any) {
      console.error('Phase 2 사용자 데이터 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 스트릭 업데이트 (호환성 모드)
   */
  async updateUserStreak(userId: string): Promise<{ success: boolean; streakData: any }> {
    try {
      const user = await this.getUserWithPhase2Data(userId);
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDate = user.last_active_date ? user.last_active_date.split('T')[0] : null;
      
      let newStreak = user.current_streak;
      let longestStreak = user.longest_streak;

      if (lastActiveDate === today) {
        // 오늘 이미 활동함 - 스트릭 유지
      } else if (this.isConsecutiveDay(lastActiveDate, today)) {
        // 연속된 날 - 스트릭 증가
        newStreak += 1;
        longestStreak = Math.max(longestStreak, newStreak);
      } else {
        // 연속성 깨짐 - 스트릭 리셋
        newStreak = 1;
      }

      // 메모리에 저장 (실제로는 localStorage나 sessionStorage 사용 권장)
      this.setStoredValue(userId, 'current_streak', newStreak);
      this.setStoredValue(userId, 'longest_streak', longestStreak);
      this.setStoredValue(userId, 'last_active_date', new Date().toISOString());

      const streakData = {
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_date: new Date().toISOString(),
        streak_bonus_multiplier: this.getStreakBonusMultiplier(newStreak)
      };

      return { success: true, streakData };

    } catch (error: any) {
      console.error('스트릭 업데이트 실패 (호환성 모드):', error);
      return { success: false, streakData: null };
    }
  }

  /**
   * 별의모래 지급 (호환성 모드)
   */
  async awardStarDust(userId: string, amount: number, source: string): Promise<{ success: boolean }> {
    try {
      const user = await this.getUserWithPhase2Data(userId);
      const currentStarDust = user.star_dust;
      const newStarDust = currentStarDust + amount;

      // 메모리에 저장
      this.setStoredValue(userId, 'star_dust', newStarDust);

      // 트랜잭션 기록 (메모리)
      const transaction = {
        id: this.generateId(),
        user_id: userId,
        amount,
        type: 'earned',
        source,
        description: `${source}로부터 ${amount} 별의모래 획득`,
        timestamp: new Date().toISOString()
      };

      this.addTransaction(userId, transaction);

      console.log(`✨ 별의모래 지급 성공 (호환성 모드): ${userId} → +${amount} (${source})`);
      
      return { success: true };

    } catch (error: any) {
      console.error('별의모래 지급 실패 (호환성 모드):', error);
      return { success: false };
    }
  }

  /**
   * 별의모래 소비 (호환성 모드)
   */
  async spendStarDust(userId: string, amount: number, purpose: string): Promise<{ success: boolean; message?: string }> {
    try {
      const user = await this.getUserWithPhase2Data(userId);
      const currentStarDust = user.star_dust;

      if (currentStarDust < amount) {
        return { success: false, message: '별의모래가 부족합니다.' };
      }

      const newStarDust = currentStarDust - amount;
      this.setStoredValue(userId, 'star_dust', newStarDust);

      // 트랜잭션 기록
      const transaction = {
        id: this.generateId(),
        user_id: userId,
        amount,
        type: 'spent',
        source: purpose,
        description: `${purpose}로 ${amount} 별의모래 소비`,
        timestamp: new Date().toISOString()
      };

      this.addTransaction(userId, transaction);

      console.log(`💰 별의모래 소비 성공 (호환성 모드): ${userId} → -${amount} (${purpose})`);

      return { success: true };

    } catch (error: any) {
      console.error('별의모래 소비 실패 (호환성 모드):', error);
      return { success: false, message: '별의모래 소비 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 배지 지급 (호환성 모드)
   */
  async awardBadge(userId: string, badgeId: string): Promise<{ success: boolean }> {
    try {
      const user = await this.getUserWithPhase2Data(userId);
      const earnedBadges = user.earned_badges || [];

      if (earnedBadges.includes(badgeId)) {
        return { success: true }; // 이미 보유한 배지
      }

      earnedBadges.push(badgeId);
      this.setStoredValue(userId, 'earned_badges', earnedBadges);

      console.log(`🏆 배지 지급 성공 (호환성 모드): ${userId} → ${badgeId}`);

      return { success: true };

    } catch (error: any) {
      console.error('배지 지급 실패 (호환성 모드):', error);
      return { success: false };
    }
  }

  // 내부 헬퍼 메서드들

  private memoryStore: Map<string, any> = new Map();

  private getStoredValue(userId: string, key: string, defaultValue: any): any {
    const storageKey = `${userId}:${key}`;
    return this.memoryStore.get(storageKey) ?? defaultValue;
  }

  private setStoredValue(userId: string, key: string, value: any): void {
    const storageKey = `${userId}:${key}`;
    this.memoryStore.set(storageKey, value);
  }

  private isConsecutiveDay(lastDate: string | null, today: string): boolean {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const todayDate = new Date(today);
    const diffTime = Math.abs(todayDate.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  }

  private getStreakBonusMultiplier(streak: number): number {
    if (streak >= 30) return 2.5;      // 150% 보너스
    if (streak >= 14) return 2.0;      // 100% 보너스 
    if (streak >= 7) return 1.5;       // 50% 보너스
    if (streak >= 3) return 1.2;       // 20% 보너스
    return 1.0;                        // 기본
  }

  private generateId(): string {
    return `compat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addTransaction(userId: string, transaction: any): void {
    const transactions = this.getStoredValue(userId, 'transactions', []);
    transactions.push(transaction);
    this.setStoredValue(userId, 'transactions', transactions);
  }

  /**
   * 사용자의 모든 Phase 2 데이터 조회
   */
  async getUserMotivationStats(userId: string): Promise<any> {
    try {
      const user = await this.getUserWithPhase2Data(userId);
      const transactions = this.getStoredValue(userId, 'transactions', []);

      return {
        success: true,
        data: {
          streak: {
            current: user.current_streak,
            longest: user.longest_streak,
            last_active_date: user.last_active_date,
            bonus_multiplier: this.getStreakBonusMultiplier(user.current_streak)
          },
          star_dust: {
            current: user.star_dust,
            transactions: transactions.slice(-10) // 최근 10개 트랜잭션
          },
          badges: {
            earned: user.earned_badges,
            total_count: user.earned_badges.length
          },
          shop: {
            purchased_items: user.purchased_items,
            purchase_count: user.purchased_items.length
          }
        }
      };

    } catch (error: any) {
      console.error('동기부여 통계 조회 실패:', error);
      return { success: false, data: null };
    }
  }

  /**
   * 메모리 저장소 상태 조회 (디버그용)
   */
  getMemoryStoreStatus(): any {
    return {
      total_keys: this.memoryStore.size,
      keys: Array.from(this.memoryStore.keys()),
      memory_usage_estimate: `${this.memoryStore.size * 100}B` // 대략적 추정
    };
  }
}