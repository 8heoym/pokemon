import { Request, Response } from 'express';
import { HybridProblemService } from '../services/HybridProblemService';
import { ProblemTemplateService } from '../services/ProblemTemplateService';
import { SupabaseGameService } from '../services/SupabaseGameService';

export class SimpleProblemController {
  private hybridService: HybridProblemService;
  private templateService: ProblemTemplateService;
  private gameService: SupabaseGameService;

  constructor() {
    this.hybridService = new HybridProblemService();
    this.templateService = new ProblemTemplateService();
    this.gameService = new SupabaseGameService();
  }

  async generateProblem(req: Request, res: Response) {
    try {
      const { userId, multiplicationTable, difficulty = 1 } = req.body;

      if (!userId || !multiplicationTable) {
        return res.status(400).json({ 
          error: '사용자 ID와 구구단이 필요합니다.' 
        });
      }

      if (multiplicationTable < 2 || multiplicationTable > 9) {
        return res.status(400).json({ 
          error: '구구단은 2단부터 9단까지만 가능합니다.' 
        });
      }

      // 하이브리드 서비스로 문제 생성
      const result = await this.hybridService.generateProblem(
        userId,
        multiplicationTable,
        difficulty
      );

      res.json(result);

    } catch (error) {
      console.error('문제 생성 실패:', error);
      res.status(500).json({ 
        error: '문제 생성 중 오류가 발생했습니다.' 
      });
    }
  }

  async submitAnswer(req: Request, res: Response) {
    try {
      const { userId, problemId, answer, timeSpent = 0, hintsUsed = 0 } = req.body;

      if (!userId || !problemId || answer === undefined) {
        return res.status(400).json({ 
          error: '필수 정보가 누락되었습니다.' 
        });
      }

      // 하이브리드 서비스로 답안 처리
      const result = await this.hybridService.submitAnswer(
        userId,
        problemId,
        parseInt(answer),
        timeSpent,
        hintsUsed
      );

      // 정답일 경우 포켓몬 잡기 시도 (기존 로직 유지)
      if (result.isCorrect) {
        const randomPokemonId = Math.floor(Math.random() * 842) + 1;
        const catchResult = await this.gameService.catchPokemon(userId, randomPokemonId);
        if (catchResult.success) {
          result.pokemonCaught = catchResult.pokemon;
          result.experienceGained = catchResult.experienceGained;
        }
      }

      res.json(result);

    } catch (error) {
      console.error('답안 제출 실패:', error);
      res.status(500).json({ 
        error: '답안 제출 중 오류가 발생했습니다.' 
      });
    }
  }

  async getHint(req: Request, res: Response) {
    try {
      const { problemId, userId } = req.params;

      // 세션에서 문제 조회
      const problemInstance = await this.templateService.getProblemFromSession(userId, problemId);
      if (!problemInstance) {
        return res.status(404).json({
          error: '문제를 찾을 수 없습니다.'
        });
      }

      // 문제의 기본 힌트 반환
      res.json({
        hint: problemInstance.hint
      });

    } catch (error) {
      console.error('힌트 조회 실패:', error);
      res.status(500).json({ 
        error: '힌트 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  async getUserProgress(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const userStats = await this.gameService.getUserStats(userId);
      
      res.json(userStats);

    } catch (error) {
      console.error('사용자 진행도 조회 실패:', error);
      res.status(500).json({ 
        error: '진행도 조회 중 오류가 발생했습니다.' 
      });
    }
  }
}