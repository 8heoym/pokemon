import { Request, Response } from 'express';
import { MotivationService } from '../services/MotivationService';

export class MotivationController {
  private motivationService: MotivationService;

  constructor() {
    this.motivationService = new MotivationService();
  }

  // Streak endpoints
  updateStreak = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '사용자 ID가 필요합니다.'
        });
      }

      const streakData = await this.motivationService.updateUserStreak(userId);

      res.json({
        success: true,
        data: streakData,
        message: `연속 학습 ${streakData.currentStreak}일 달성!`
      });

    } catch (error: any) {
      console.error('Streak 업데이트 실패:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Streak 업데이트에 실패했습니다.'
      });
    }
  };

  // Daily bonus endpoints
  claimDailyBonus = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '사용자 ID가 필요합니다.'
        });
      }

      const bonus = await this.motivationService.claimDailyBonus(userId);

      res.json({
        success: true,
        data: bonus,
        message: `일일 보너스 획득! 별의모래 ${bonus.starDust}, 경험치 ${bonus.experience} (${bonus.multiplier}x)`
      });

    } catch (error: any) {
      console.error('일일 보너스 지급 실패:', error);
      res.status(400).json({
        success: false,
        message: error.message || '일일 보너스 지급에 실패했습니다.'
      });
    }
  };

  // Star Dust endpoints
  awardStarDust = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { amount, source, description } = req.body;

      if (!userId || !amount || !source) {
        return res.status(400).json({
          success: false,
          message: '필수 정보가 누락되었습니다.'
        });
      }

      await this.motivationService.awardStarDust(
        userId,
        parseInt(amount),
        source,
        description || '별의모래 획득'
      );

      res.json({
        success: true,
        message: `별의모래 ${amount}개를 획득했습니다!`
      });

    } catch (error: any) {
      console.error('별의모래 지급 실패:', error);
      res.status(500).json({
        success: false,
        message: error.message || '별의모래 지급에 실패했습니다.'
      });
    }
  };

  // Shop endpoints
  getShopItems = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '사용자 ID가 필요합니다.'
        });
      }

      const items = await this.motivationService.getShopItems(userId);

      res.json({
        success: true,
        data: items
      });

    } catch (error: any) {
      console.error('상점 아이템 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: error.message || '상점 정보를 불러오는데 실패했습니다.'
      });
    }
  };

  purchaseItem = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { itemId } = req.body;

      if (!userId || !itemId) {
        return res.status(400).json({
          success: false,
          message: '필수 정보가 누락되었습니다.'
        });
      }

      const result = await this.motivationService.purchaseShopItem(userId, itemId);

      res.json({
        success: result.success,
        message: result.message
      });

    } catch (error: any) {
      console.error('상점 아이템 구매 실패:', error);
      res.status(500).json({
        success: false,
        message: error.message || '아이템 구매에 실패했습니다.'
      });
    }
  };

  // Badge endpoints
  awardBadge = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { badgeId } = req.body;

      if (!userId || !badgeId) {
        return res.status(400).json({
          success: false,
          message: '필수 정보가 누락되었습니다.'
        });
      }

      await this.motivationService.awardBadge(userId, badgeId);

      res.json({
        success: true,
        message: `새로운 배지를 획득했습니다: ${badgeId}`
      });

    } catch (error: any) {
      console.error('배지 지급 실패:', error);
      res.status(500).json({
        success: false,
        message: error.message || '배지 지급에 실패했습니다.'
      });
    }
  };

  // Statistics endpoints
  getMotivationStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '사용자 ID가 필요합니다.'
        });
      }

      const stats = await this.motivationService.getUserMotivationStats(userId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error: any) {
      console.error('동기부여 통계 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: error.message || '통계 정보를 불러오는데 실패했습니다.'
      });
    }
  };
}