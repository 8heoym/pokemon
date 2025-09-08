import { Request, Response } from 'express';
import { Phase2CompatibilityService } from '../services/Phase2CompatibilityService';

/**
 * Phase 2 호환성 모드 컨트롤러
 * 데이터베이스 스키마 변경 없이 Phase 2 기능 제공
 */
export class CompatibilityMotivationController {
  private compatibilityService: Phase2CompatibilityService;

  constructor() {
    this.compatibilityService = new Phase2CompatibilityService();
  }

  /**
   * 스트릭 업데이트 (호환성 모드)
   */
  async updateStreak(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      console.log('🔄 스트릭 업데이트 요청 (호환성 모드):', userId);
      
      const result = await this.compatibilityService.updateUserStreak(userId);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.streakData
        });
      } else {
        res.status(400).json({
          success: false,
          message: '스트릭 업데이트에 실패했습니다.'
        });
      }

    } catch (error: any) {
      console.error('스트릭 업데이트 실패:', error);
      res.status(500).json({
        success: false,
        message: `스트릭 업데이트 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }

  /**
   * 별의모래 지급 (호환성 모드)
   */
  async awardStarDust(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { amount, source = 'manual' } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: '유효한 별의모래 수량이 필요합니다.'
        });
      }

      console.log(`✨ 별의모래 지급 요청 (호환성 모드): ${userId} → +${amount}`);

      const result = await this.compatibilityService.awardStarDust(userId, amount, source);

      if (result.success) {
        const userData = await this.compatibilityService.getUserWithPhase2Data(userId);
        res.json({
          success: true,
          data: {
            awarded_amount: amount,
            total_star_dust: userData.star_dust,
            source
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: '별의모래 지급에 실패했습니다.'
        });
      }

    } catch (error: any) {
      console.error('별의모래 지급 실패:', error);
      res.status(500).json({
        success: false,
        message: `별의모래 지급 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }

  /**
   * 상점 아이템 구매 (호환성 모드)
   */
  async purchaseItem(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { itemId, price } = req.body;

      if (!itemId || !price || price <= 0) {
        return res.status(400).json({
          success: false,
          message: '유효한 아이템 정보가 필요합니다.'
        });
      }

      console.log(`🛒 아이템 구매 요청 (호환성 모드): ${userId} → ${itemId} (${price} 별의모래)`);

      // 별의모래 소비 시도
      const spendResult = await this.compatibilityService.spendStarDust(userId, price, `shop_purchase_${itemId}`);

      if (!spendResult.success) {
        return res.status(400).json({
          success: false,
          message: spendResult.message || '별의모래가 부족합니다.'
        });
      }

      // 구매한 아이템 기록
      const userData = await this.compatibilityService.getUserWithPhase2Data(userId);
      const purchasedItems = userData.purchased_items || [];
      purchasedItems.push(itemId);
      this.compatibilityService['setStoredValue'](userId, 'purchased_items', purchasedItems);

      const finalUserData = await this.compatibilityService.getUserWithPhase2Data(userId);

      res.json({
        success: true,
        data: {
          purchased_item: itemId,
          price,
          remaining_star_dust: finalUserData.star_dust,
          total_purchased_items: finalUserData.purchased_items.length
        }
      });

    } catch (error: any) {
      console.error('아이템 구매 실패:', error);
      res.status(500).json({
        success: false,
        message: `아이템 구매 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }

  /**
   * 배지 지급 (호환성 모드)
   */
  async awardBadge(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { badgeId } = req.body;

      if (!badgeId) {
        return res.status(400).json({
          success: false,
          message: '배지 ID가 필요합니다.'
        });
      }

      console.log(`🏆 배지 지급 요청 (호환성 모드): ${userId} → ${badgeId}`);

      const result = await this.compatibilityService.awardBadge(userId, badgeId);

      if (result.success) {
        const userData = await this.compatibilityService.getUserWithPhase2Data(userId);
        res.json({
          success: true,
          data: {
            badge_id: badgeId,
            total_badges: userData.earned_badges.length,
            earned_badges: userData.earned_badges
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: '배지 지급에 실패했습니다.'
        });
      }

    } catch (error: any) {
      console.error('배지 지급 실패:', error);
      res.status(500).json({
        success: false,
        message: `배지 지급 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }

  /**
   * 동기부여 통계 조회 (호환성 모드)
   */
  async getMotivationStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      console.log(`📊 동기부여 통계 조회 (호환성 모드): ${userId}`);

      const result = await this.compatibilityService.getUserMotivationStats(userId);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: '통계 조회에 실패했습니다.'
        });
      }

    } catch (error: any) {
      console.error('동기부여 통계 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: `통계 조회 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }

  /**
   * 상점 아이템 목록 조회 (호환성 모드)
   */
  async getShopItems(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      console.log(`🏪 상점 아이템 조회 (호환성 모드): ${userId}`);

      const userData = await this.compatibilityService.getUserWithPhase2Data(userId);
      const purchasedItems = userData.purchased_items || [];
      const currentStarDust = userData.star_dust;

      // 하드코딩된 상점 아이템 (실제로는 데이터베이스에서 조회)
      const shopItems = [
        {
          id: "golden_pokeball",
          name: "황금 포켓볼",
          description: "포켓몬 포획 확률 10% 증가",
          price: 500,
          type: "functional",
          imageUrl: "/images/items/golden_pokeball.png",
          available: currentStarDust >= 500 && !purchasedItems.includes("golden_pokeball"),
          purchased: purchasedItems.includes("golden_pokeball")
        },
        {
          id: "experience_boost",
          name: "경험치 부스터", 
          description: "경험치 획득량 25% 증가 (24시간)",
          price: 200,
          type: "functional",
          imageUrl: "/images/items/exp_boost.png",
          available: currentStarDust >= 200,
          purchased: purchasedItems.includes("experience_boost")
        },
        {
          id: "rainbow_trainer_card",
          name: "무지개 트레이너 카드",
          description: "특별한 트레이너 카드 배경",
          price: 1000,
          type: "cosmetic", 
          imageUrl: "/images/items/rainbow_card.png",
          available: currentStarDust >= 1000 && !purchasedItems.includes("rainbow_trainer_card"),
          purchased: purchasedItems.includes("rainbow_trainer_card")
        },
        {
          id: "shiny_hunter",
          name: "색이 다른 포켓몬 헌터",
          description: "색이 다른 포켓몬 출현율 5% 증가",
          price: 750,
          type: "functional",
          imageUrl: "/images/items/shiny_hunter.png",
          available: currentStarDust >= 750 && !purchasedItems.includes("shiny_hunter"),
          purchased: purchasedItems.includes("shiny_hunter")
        },
        {
          id: "legendary_collector",
          name: "전설의 수집가",
          description: "컬렉션 기념 배지",
          price: 2000,
          type: "cosmetic",
          imageUrl: "/images/items/legendary_collector.png", 
          available: currentStarDust >= 2000 && !purchasedItems.includes("legendary_collector"),
          purchased: purchasedItems.includes("legendary_collector")
        },
        {
          id: "streak_shield",
          name: "연속 학습 보호막",
          description: "1회 스트릭 보호 (하루 건너뛰기 가능)",
          price: 300,
          type: "functional",
          imageUrl: "/images/items/streak_shield.png",
          available: currentStarDust >= 300,
          purchased: purchasedItems.includes("streak_shield")
        }
      ];

      res.json({
        success: true,
        data: shopItems
      });

    } catch (error: any) {
      console.error('상점 아이템 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: `상점 조회 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }

  /**
   * 일일 보너스 지급 (호환성 모드)
   */
  async claimDailyBonus(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      console.log(`🎁 일일 보너스 지급 요청 (호환성 모드): ${userId}`);

      const userData = await this.compatibilityService.getUserWithPhase2Data(userId);
      const today = new Date().toISOString().split('T')[0];
      const lastBonusDate = this.compatibilityService['getStoredValue'](userId, 'last_bonus_date', null);

      // 오늘 이미 보너스를 받았는지 확인
      if (lastBonusDate === today) {
        return res.status(400).json({
          success: false,
          message: '오늘 이미 일일 보너스를 받았습니다.'
        });
      }

      // 스트릭에 따른 보너스 계산
      const currentStreak = userData.current_streak;
      let bonusAmount = 50; // 기본 보너스
      let multiplier = 1;

      if (currentStreak >= 30) multiplier = 2.5;
      else if (currentStreak >= 14) multiplier = 2.0;
      else if (currentStreak >= 7) multiplier = 1.5;
      else if (currentStreak >= 3) multiplier = 1.2;

      bonusAmount = Math.floor(bonusAmount * multiplier);

      // 별의모래 지급
      await this.compatibilityService.awardStarDust(userId, bonusAmount, 'daily_bonus');

      // 마지막 보너스 날짜 기록
      this.compatibilityService['setStoredValue'](userId, 'last_bonus_date', today);

      const finalUserData = await this.compatibilityService.getUserWithPhase2Data(userId);

      res.json({
        success: true,
        data: {
          bonus_amount: bonusAmount,
          streak_multiplier: multiplier,
          current_streak: currentStreak,
          total_star_dust: finalUserData.star_dust,
          next_bonus_available: '내일'
        }
      });

    } catch (error: any) {
      console.error('일일 보너스 지급 실패:', error);
      res.status(500).json({
        success: false,
        message: `일일 보너스 지급 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }

  /**
   * 호환성 서비스 상태 조회 (디버그용)
   */
  async getCompatibilityStatus(req: Request, res: Response) {
    try {
      const status = this.compatibilityService.getMemoryStoreStatus();
      
      res.json({
        success: true,
        message: '호환성 서비스 정상 동작 중',
        status: {
          service_mode: 'compatibility',
          database_schema_required: false,
          memory_store: status
        }
      });

    } catch (error: any) {
      console.error('호환성 상태 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: `상태 조회 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }
}