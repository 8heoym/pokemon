import { Request, Response } from 'express';
import { AIProblemGenerator } from '../services/AIProblemGenerator';
import { SupabasePokemonService } from '../services/SupabasePokemonService';
import { SupabaseGameService } from '../services/SupabaseGameService';

export class SimpleProblemController {
  private aiGenerator: AIProblemGenerator;
  private pokemonService: SupabasePokemonService;
  private gameService: SupabaseGameService;
  private problemCache: Map<string, { answer: number; equation: string }> = new Map();

  constructor() {
    this.aiGenerator = new AIProblemGenerator();
    this.pokemonService = new SupabasePokemonService();
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

      // 해당 구구단의 랜덤 포켓몬 선택
      const pokemon = await this.pokemonService.getRandomPokemonByTable(multiplicationTable);
      
      if (!pokemon) {
        return res.status(404).json({ 
          error: '해당 구구단의 포켓몬을 찾을 수 없습니다.' 
        });
      }

      // AI 문제 생성 (간단한 버전)
      const problem = await this.aiGenerator.generatePersonalizedProblem(
        pokemon,
        multiplicationTable,
        difficulty
      );

      // 문제 정보를 캐시에 저장
      this.problemCache.set(problem.id, {
        answer: problem.answer,
        equation: problem.equation
      });

      res.json({
        problem,
        pokemon
      });

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

      // 캐시에서 문제 정답 조회
      const cachedProblem = this.problemCache.get(problemId);
      let correctAnswer = 0;
      let isCorrect = false;

      if (cachedProblem) {
        correctAnswer = cachedProblem.answer;
        isCorrect = parseInt(answer) === correctAnswer;
        
        // 사용된 문제는 캐시에서 제거 (메모리 절약)
        this.problemCache.delete(problemId);
      } else {
        // 캐시에서 찾을 수 없는 경우 (서버 재시작 등)
        console.error(`Problem ${problemId} not found in cache`);
        return res.status(404).json({ 
          error: '문제를 찾을 수 없습니다.', 
          needsRetry: true,
          requireNewProblem: true
        });
      }

      // 답안 기록
      const userAnswer = {
        userId,
        problemId,
        userAnswer: parseInt(answer),
        correctAnswer,
        isCorrect,
        timeSpent,
        hintsUsed,
        attemptedAt: new Date()
      };

      // await this.gameService.recordAnswer(userAnswer); // 임시로 주석처리 - 테이블 미생성

      // 정답일 경우 포켓몬 잡기 시도
      let pokemonCaught = null;
      let experienceGained = 0;
      if (isCorrect) {
        const randomPokemonId = Math.floor(Math.random() * 842) + 1; // 1-842 (전체 포켓몬 범위)
        const catchResult = await this.gameService.catchPokemon(userId, randomPokemonId);
        if (catchResult.success) {
          pokemonCaught = catchResult.pokemon;
          experienceGained = catchResult.experienceGained;
        }
      }

      res.json({
        isCorrect,
        correctAnswer,
        pokemonCaught,
        experienceGained,
        feedback: isCorrect ? '정답입니다! 🎉' : '아쉽지만 틀렸습니다. 다시 도전해보세요!'
      });

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

      // problemId 유효성 검사
      const cachedProblem = this.problemCache.get(problemId);
      if (!cachedProblem) {
        return res.status(404).json({
          error: '문제를 찾을 수 없습니다.'
        });
      }

      // 간단한 힌트 제공
      const hints = [
        '차근차근 계산해보세요!',
        '손가락으로 세어보는 것도 좋은 방법이에요.',
        '구구단을 외워보세요!',
        '그림을 그려서 생각해보세요.'
      ];

      const randomHint = hints[Math.floor(Math.random() * hints.length)];

      res.json({
        hint: randomHint
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