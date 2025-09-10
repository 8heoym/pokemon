import { Request, Response } from 'express';
import { SupabaseGameService } from '../services/SupabaseGameService';

export class SimpleGameController {
  private gameService: SupabaseGameService;

  constructor() {
    this.gameService = new SupabaseGameService();
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

      const user = await this.gameService.createUser(nickname);
      
      res.json(user);
    } catch (error) {
      console.error('사용자 생성 실패:', error);
      res.status(500).json({ error: '사용자 생성 중 오류가 발생했습니다.' });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const decodedUserId = decodeURIComponent(userId);
      
      // 🔍 디버깅 로그 추가
      console.log('🔍 사용자 조회 요청:', {
        original: userId,
        decoded: decodedUserId,
        originalLength: userId.length,
        decodedLength: decodedUserId.length,
        originalBytes: Buffer.from(userId).toString('hex'),
        decodedBytes: Buffer.from(decodedUserId).toString('hex')
      });
      
      // UUID 형식인지 확인 (간단한 방법)
      const isUUID = userId.length === 36 && userId.includes('-');
      
      let user;
      if (isUUID) {
        console.log('🔑 UUID 기반 조회 시도:', userId);
        user = await this.gameService.getUserById(userId);
      } else {
        // 닉네임으로 조회
        console.log('👤 닉네임 기반 조회 시도:', decodedUserId);
        user = await this.gameService.getUserByNickname(decodedUserId);
      }
      
      if (!user) {
        console.log('❌ 사용자 조회 실패 - 404 반환');
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }
      
      console.log('✅ 사용자 조회 성공:', user.nickname);
      
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
      
      res.json(result);
    } catch (error) {
      console.error('포켓몬 잡기 실패:', error);
      res.status(500).json({ error: '포켓몬 잡기 중 오류가 발생했습니다.' });
    }
  }

  async getPokedex(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const pokedex = await this.gameService.getPokedex(userId);
      
      res.json(pokedex);
    } catch (error) {
      console.error('포켓몬 도감 조회 실패:', error);
      res.status(500).json({ error: '포켓몬 도감 조회 중 오류가 발생했습니다.' });
    }
  }

  async getUserStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const stats = await this.gameService.getUserStats(userId);
      
      res.json(stats);
    } catch (error) {
      console.error('사용자 통계 조회 실패:', error);
      res.status(500).json({ error: '사용자 통계 조회 중 오류가 발생했습니다.' });
    }
  }

  async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const leaderboard = await this.gameService.getLeaderboard(limit);
      
      res.json(leaderboard);
    } catch (error) {
      console.error('리더보드 조회 실패:', error);
      res.status(500).json({ error: '리더보드 조회 중 오류가 발생했습니다.' });
    }
  }

  async getPokemonByIds(req: Request, res: Response) {
    try {
      const { pokemonIds } = req.body; // 포켓몬 ID 배열
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!pokemonIds || !Array.isArray(pokemonIds)) {
        return res.status(400).json({ error: '포켓몬 ID 배열이 필요합니다.' });
      }

      const result = await this.gameService.getPokemonByIds(pokemonIds, limit, offset);
      
      res.json(result);
    } catch (error) {
      console.error('포켓몬 일괄 조회 실패:', error);
      res.status(500).json({ error: '포켓몬 일괄 조회 중 오류가 발생했습니다.' });
    }
  }

  async getPokedexPaginated(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const filter = req.query.filter as string; // 'all' | 'caught' | 'uncaught'
      
      const result = await this.gameService.getPokedexPaginated(userId, page, limit, filter);
      
      res.json(result);
    } catch (error) {
      console.error('페이지네이션 도감 조회 실패:', error);
      res.status(500).json({ error: '페이지네이션 도감 조회 중 오류가 발생했습니다.' });
    }
  }
}