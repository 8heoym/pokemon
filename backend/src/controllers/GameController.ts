import { Request, Response } from 'express';
import { GameService } from '../services/GameService';

export class GameController {
  private gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  async createUser(req: Request, res: Response) {
    try {
      const { nickname } = req.body;

      if (!nickname || nickname.trim().length === 0) {
        return res.status(400).json({ error: '닉네임이 필요합니다.' });
      }

      if (nickname.trim().length > 20) {
        return res.status(400).json({ error: '닉네임은 20자 이하여야 합니다.' });
      }

      const newUser = await this.gameService.createUser(nickname);
      
      res.status(201).json({
        success: true,
        user: newUser,
        message: `${nickname} 트레이너님, 환영합니다!`
      });

    } catch (error) {
      console.error('사용자 생성 실패:', error);
      res.status(500).json({ error: '사용자 생성 중 오류가 발생했습니다.' });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await this.gameService.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      res.json(user);

    } catch (error) {
      console.error('사용자 조회 실패:', error);
      res.status(500).json({ error: '사용자 조회 중 오류가 발생했습니다.' });
    }
  }

  async catchPokemon(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { pokemonId } = req.body;

      if (!pokemonId) {
        return res.status(400).json({ error: '포켓몬 ID가 필요합니다.' });
      }

      const result = await this.gameService.catchPokemon(userId, pokemonId);
      
      if (result.success) {
        // 지역 진행 상태 확인
        const regionUpdate = await this.gameService.updateRegionProgress(userId);
        
        res.json({
          ...result,
          regionUpdate: regionUpdate.regionUnlocked ? {
            newRegion: regionUpdate.regionUnlocked,
            message: regionUpdate.message
          } : null
        });
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('포켓몬 잡기 실패:', error);
      res.status(500).json({ error: '포켓몬 잡기 중 오류가 발생했습니다.' });
    }
  }

  async getPokedex(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const pokedexStatus = await this.gameService.getPokdexStatus(userId);
      
      res.json(pokedexStatus);

    } catch (error) {
      console.error('도감 조회 실패:', error);
      res.status(500).json({ error: '도감 조회 중 오류가 발생했습니다.' });
    }
  }

  async getLeaderboard(req: Request, res: Response) {
    try {
      const leaderboard = await this.gameService.getLeaderboard();
      
      res.json({
        leaderboard,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('리더보드 조회 실패:', error);
      res.status(500).json({ error: '리더보드 조회 중 오류가 발생했습니다.' });
    }
  }

  async getUserStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // 사용자 기본 정보
      const user = await this.gameService.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      // 포켓몬 도감 상태
      const pokedexStatus = await this.gameService.getPokdexStatus(userId);
      
      // 종합 통계
      const stats = {
        trainerInfo: {
          nickname: user.nickname,
          level: user.trainerLevel,
          currentRegion: user.currentRegion,
          totalExperience: user.totalExperience,
          joinDate: user.createdAt
        },
        progress: {
          totalPokemonCaught: user.caughtPokemon.length,
          completedTables: user.completedTables.length,
          currentRegionCompletion: pokedexStatus.regionCompletionRate
        },
        achievements: this.calculateAchievements(user, pokedexStatus)
      };

      res.json(stats);

    } catch (error) {
      console.error('사용자 통계 조회 실패:', error);
      res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
    }
  }

  private calculateAchievements(user: any, pokedexStatus: any) {
    const achievements = [];

    // 레벨 관련 업적
    if (user.trainerLevel >= 10) achievements.push('베테랑 트레이너');
    if (user.trainerLevel >= 20) achievements.push('마스터 트레이너');
    
    // 포켓몬 수집 관련 업적
    if (user.caughtPokemon.length >= 50) achievements.push('포켓몬 콜렉터');
    if (user.caughtPokemon.length >= 100) achievements.push('포켓몬 마스터');
    
    // 구구단 관련 업적
    if (user.completedTables.length >= 3) achievements.push('곱셈 초급자');
    if (user.completedTables.length >= 6) achievements.push('곱셈 전문가');
    if (user.completedTables.length >= 8) achievements.push('구구단 마스터');

    // 지역 완성도 관련 업적
    if (pokedexStatus.regionCompletionRate >= 50) achievements.push('지역 탐험가');
    if (pokedexStatus.regionCompletionRate >= 100) achievements.push('지역 정복자');

    return achievements;
  }
}