import { supabase } from '../config/supabase';
import { User, StreakData, StarDustTransaction, Badge, ShopItem } from '../types';
import { SupabaseGameService } from './SupabaseGameService';

export class MotivationService {
  private gameService: SupabaseGameService;

  constructor() {
    this.gameService = new SupabaseGameService();
  }

  // Streak System
  async updateUserStreak(userId: string): Promise<StreakData> {
    try {
      const user = await this.gameService.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      const today = new Date();
      const lastActive = user.lastActiveDate;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let newCurrentStreak = 1;
      let newLongestStreak = user.longestStreak;

      // 연속 기록 계산
      if (lastActive) {
        const diffTime = today.getTime() - lastActive.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // 오늘 이미 활동함 - 연속 기록 유지
          newCurrentStreak = user.currentStreak;
        } else if (diffDays === 1) {
          // 어제 활동했음 - 연속 기록 증가
          newCurrentStreak = user.currentStreak + 1;
        } else {
          // 연속 기록 깨짐 - 새로 시작
          newCurrentStreak = 1;
        }
      }

      // 최장 연속 기록 업데이트
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }

      // 사용자 정보 업데이트
      await this.updateUserMotivationData(userId, {
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_active_date: today.toISOString()
      });

      // 스트릭 보상 체크
      await this.checkStreakRewards(userId, newCurrentStreak);

      return {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today,
        dailyGoalMet: true
      };

    } catch (error) {
      console.error('Streak 업데이트 실패:', error);
      throw error;
    }
  }

  private async checkStreakRewards(userId: string, currentStreak: number): Promise<void> {
    const rewardMilestones = [3, 7, 14, 30, 50, 100];
    
    for (const milestone of rewardMilestones) {
      if (currentStreak === milestone) {
        await this.grantStreakReward(userId, milestone);
      }
    }
  }

  private async grantStreakReward(userId: string, streakDay: number): Promise<void> {
    let reward;
    
    switch (streakDay) {
      case 3:
        reward = { type: 'stardust', amount: 50 };
        await this.awardStarDust(userId, 50, 'streak_bonus', `${streakDay}일 연속 학습 보상`);
        break;
      case 7:
        reward = { type: 'stardust', amount: 100 };
        await this.awardStarDust(userId, 100, 'streak_bonus', `${streakDay}일 연속 학습 보상`);
        break;
      case 14:
        reward = { type: 'experience', amount: 200 };
        await this.awardExperience(userId, 200, `${streakDay}일 연속 학습 보상`);
        break;
      case 30:
        reward = { type: 'badge', badgeId: 'dedication_streak' };
        await this.awardBadge(userId, 'dedication_streak');
        break;
      case 50:
        reward = { type: 'badge', badgeId: 'streak_master' };
        await this.awardBadge(userId, 'streak_master');
        break;
      case 100:
        reward = { type: 'badge', badgeId: 'century_scholar' };
        await this.awardBadge(userId, 'century_scholar');
        break;
    }
  }

  // Star Dust System
  async awardStarDust(
    userId: string, 
    amount: number, 
    source: StarDustTransaction['source'], 
    description: string
  ): Promise<void> {
    try {
      const user = await this.gameService.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      // 스트릭 보너스 적용
      const streakMultiplier = this.getStreakMultiplier(user.currentStreak);
      const finalAmount = Math.floor(amount * streakMultiplier);

      // 사용자 별의모래 업데이트
      await this.updateUserMotivationData(userId, {
        star_dust: user.starDust + finalAmount
      });

      // 거래 기록 저장
      await this.recordStarDustTransaction({
        userId,
        amount: finalAmount,
        type: 'earned',
        source,
        description: streakMultiplier > 1 
          ? `${description} (스트릭 보너스 ${Math.round((streakMultiplier - 1) * 100)}%)`
          : description,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('별의모래 지급 실패:', error);
      throw error;
    }
  }

  private getStreakMultiplier(streak: number): number {
    if (streak >= 30) return 2.5;
    if (streak >= 14) return 2.0;
    if (streak >= 7) return 1.5;
    if (streak >= 3) return 1.2;
    return 1.0;
  }

  async spendStarDust(userId: string, amount: number, itemId: string, description: string): Promise<boolean> {
    try {
      const user = await this.gameService.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      if (user.starDust < amount) {
        return false; // 별의모래 부족
      }

      // 별의모래 차감
      await this.updateUserMotivationData(userId, {
        star_dust: user.starDust - amount,
        purchased_items: [...user.purchasedItems, itemId]
      });

      // 거래 기록 저장
      await this.recordStarDustTransaction({
        userId,
        amount: -amount,
        type: 'spent',
        source: 'shop_purchase',
        description,
        timestamp: new Date()
      });

      return true;

    } catch (error) {
      console.error('별의모래 사용 실패:', error);
      throw error;
    }
  }

  private async recordStarDustTransaction(transaction: Omit<StarDustTransaction, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('stardust_transactions')
        .insert({
          id: crypto.randomUUID(),
          user_id: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          source: transaction.source,
          description: transaction.description,
          timestamp: transaction.timestamp.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('별의모래 거래 기록 실패:', error);
      // 거래 기록 실패는 치명적이지 않음 - 로깅만 하고 계속 진행
    }
  }

  // Badge System
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      const user = await this.gameService.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      if (user.earnedBadges.includes(badgeId)) {
        return; // 이미 보유한 배지
      }

      // 배지 추가
      await this.updateUserMotivationData(userId, {
        earned_badges: [...user.earnedBadges, badgeId]
      });

      // 배지 획득 기록
      await this.recordBadgeEarned(userId, badgeId);

    } catch (error) {
      console.error('배지 지급 실패:', error);
      throw error;
    }
  }

  private async recordBadgeEarned(userId: string, badgeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_badges')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          badge_id: badgeId,
          earned_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('배지 획득 기록 실패:', error);
    }
  }

  // Experience Award (for streak rewards)
  private async awardExperience(userId: string, amount: number, description: string): Promise<void> {
    try {
      const user = await this.gameService.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      const newTotalExperience = user.totalExperience + amount;
      const newLevel = this.calculateLevel(newTotalExperience);

      await this.updateUserMotivationData(userId, {
        total_experience: newTotalExperience,
        trainer_level: newLevel
      });

    } catch (error) {
      console.error('경험치 지급 실패:', error);
      throw error;
    }
  }

  private calculateLevel(experience: number): number {
    // 간단한 레벨 계산 공식
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  // Daily Bonus System
  async claimDailyBonus(userId: string): Promise<{
    starDust: number;
    experience: number;
    multiplier: number;
  }> {
    try {
      const user = await this.gameService.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      const today = new Date().toDateString();
      const lastActive = user.lastActiveDate.toDateString();

      if (today === lastActive) {
        throw new Error('오늘 이미 일일 보너스를 받았습니다.');
      }

      // 연속 일수에 따른 보너스 배수
      let multiplier = 1;
      if (user.currentStreak >= 14) multiplier = 3.0;
      else if (user.currentStreak >= 7) multiplier = 2.0;
      else if (user.currentStreak >= 3) multiplier = 1.5;

      const baseStarDust = 50;
      const baseExperience = 100;
      
      const finalStarDust = Math.floor(baseStarDust * multiplier);
      const finalExperience = Math.floor(baseExperience * multiplier);

      // 보상 지급
      await this.awardStarDust(userId, finalStarDust, 'daily_bonus', '일일 보너스');
      await this.awardExperience(userId, finalExperience, '일일 보너스');

      return {
        starDust: finalStarDust,
        experience: finalExperience,
        multiplier
      };

    } catch (error) {
      console.error('일일 보너스 지급 실패:', error);
      throw error;
    }
  }

  // Shop System
  async getShopItems(userId: string): Promise<ShopItem[]> {
    try {
      const user = await this.gameService.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      // 상점 아이템 목록 (실제로는 DB에서 조회)
      const allItems: ShopItem[] = [
        {
          id: 'golden_pokeball',
          name: '황금 포켓볼',
          description: '포켓몬 포획 확률 10% 증가',
          price: 500,
          type: 'functional',
          imageUrl: '/images/items/golden_pokeball.png',
          available: user.trainerLevel >= 5
        },
        {
          id: 'experience_boost',
          name: '경험치 부스터',
          description: '경험치 획득량 25% 증가 (24시간)',
          price: 200,
          type: 'functional',
          imageUrl: '/images/items/exp_boost.png',
          available: true
        },
        {
          id: 'rainbow_trainer_card',
          name: '무지개 트레이너 카드',
          description: '특별한 트레이너 카드 배경',
          price: 1000,
          type: 'cosmetic',
          imageUrl: '/images/items/rainbow_card.png',
          available: user.completedTables.length >= 8
        }
      ];

      return allItems.map(item => ({
        ...item,
        purchasedAt: user.purchasedItems.includes(item.id) ? new Date() : undefined
      }));

    } catch (error) {
      console.error('상점 아이템 조회 실패:', error);
      throw error;
    }
  }

  async purchaseShopItem(userId: string, itemId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const shopItems = await this.getShopItems(userId);
      const item = shopItems.find(i => i.id === itemId);

      if (!item) {
        return { success: false, message: '존재하지 않는 아이템입니다.' };
      }

      if (!item.available) {
        return { success: false, message: '구매 조건을 만족하지 않습니다.' };
      }

      if (item.purchasedAt) {
        return { success: false, message: '이미 구매한 아이템입니다.' };
      }

      const success = await this.spendStarDust(userId, item.price, itemId, `${item.name} 구매`);
      
      if (!success) {
        return { success: false, message: '별의모래가 부족합니다.' };
      }

      return { success: true, message: `${item.name}을(를) 성공적으로 구매했습니다!` };

    } catch (error) {
      console.error('상점 아이템 구매 실패:', error);
      return { success: false, message: '구매 처리 중 오류가 발생했습니다.' };
    }
  }

  // User Motivation Data Update Helper
  private async updateUserMotivationData(userId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  }

  // Statistics
  async getUserMotivationStats(userId: string) {
    try {
      const user = await this.gameService.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      // 별의모래 거래 내역 조회
      const { data: transactions, error: transError } = await supabase
        .from('stardust_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (transError) throw transError;

      return {
        streak: {
          current: user.currentStreak,
          longest: user.longestStreak,
          lastActive: user.lastActiveDate
        },
        starDust: {
          current: user.starDust,
          totalEarned: transactions?.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.amount, 0) || 0,
          totalSpent: transactions?.filter(t => t.type === 'spent').reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
        },
        badges: {
          earned: user.earnedBadges,
          total: user.earnedBadges.length
        },
        recentTransactions: transactions || []
      };

    } catch (error) {
      console.error('동기부여 통계 조회 실패:', error);
      throw error;
    }
  }
}