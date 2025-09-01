import { Request, Response } from 'express';
import { AIProblemGenerator } from '../services/AIProblemGenerator';
import { SupabasePokemonService } from '../services/SupabasePokemonService';
import { SupabaseGameService } from '../services/SupabaseGameService';
import { v4 as uuidv4 } from 'uuid';

export class ProblemController {
  private aiGenerator: AIProblemGenerator;
  private pokemonService: SupabasePokemonService;
  private gameService: SupabaseGameService;

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

      if (multiplicationTable < 0 || multiplicationTable > 9) {
        return res.status(400).json({ 
          error: '유효하지 않은 구구단입니다.' 
        });
      }

      // 사용자의 학습 분석 조회
      const userAnalysis = await this.learningService.analyzeLearningProgress(
        userId,
        multiplicationTable
      );

      // 해당 구구단의 포켓몬 랜덤 선택
      const pokemon = await this.pokemonService.getRandomPokemonByTable(multiplicationTable);
      
      if (!pokemon) {
        return res.status(404).json({ 
          error: '해당 구구단의 포켓몬을 찾을 수 없습니다.' 
        });
      }

      // AI로 개인화된 문제 생성
      const problem = await this.aiGenerator.generatePersonalizedProblem(
        pokemon,
        multiplicationTable,
        difficulty as 1 | 2 | 3,
        userAnalysis
      );

      // 문제를 데이터베이스에 저장
      const savedProblem = new MathProblemModel(problem);
      await savedProblem.save();

      // 포켓몬 정보와 함께 응답
      res.json({
        problem,
        pokemon: {
          id: pokemon.id,
          name: pokemon.name,
          koreanName: pokemon.koreanName,
          imageUrl: pokemon.imageUrl,
          characteristics: pokemon.characteristics
        },
        userAnalysis: {
          masteryLevel: userAnalysis.masteryLevel,
          recommendedActions: userAnalysis.recommendedActions
        }
      });

    } catch (error) {
      console.error('문제 생성 실패:', error);
      res.status(500).json({ error: '문제 생성 중 오류가 발생했습니다.' });
    }
  }

  async submitAnswer(req: Request, res: Response) {
    try {
      const { userId, problemId, userAnswer, timeSpent, hintsUsed = 0 } = req.body;

      if (!userId || !problemId || userAnswer === undefined || !timeSpent) {
        return res.status(400).json({ 
          error: '필수 정보가 누락되었습니다.' 
        });
      }

      // 문제 조회
      const problem = await MathProblemModel.findOne({ id: problemId });
      if (!problem) {
        return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
      }

      const isCorrect = userAnswer === problem.answer;
      
      // 답안 저장
      const answerRecord = new UserAnswerModel({
        id: uuidv4(),
        userId,
        problemId,
        userAnswer,
        correctAnswer: problem.answer,
        isCorrect,
        timeSpent,
        hintsUsed,
        attemptedAt: new Date()
      });

      await answerRecord.save();

      // 응답 데이터 구성
      const response: any = {
        isCorrect,
        correctAnswer: problem.answer,
        explanation: problem.hint
      };

      // 틀린 경우 오답 분석 추가
      if (!isCorrect) {
        const mistakeAnalysis = await this.aiGenerator.analyzeWrongAnswer(
          problem,
          userAnswer,
          problem.answer
        );
        
        const improvedHint = await this.aiGenerator.generateHintForStruggling(
          problem,
          mistakeAnalysis
        );

        response.mistakeAnalysis = mistakeAnalysis;
        response.improvedHint = improvedHint;
      }

      // 포켓몬 획득 확인 (정답인 경우)
      if (isCorrect) {
        const catchResult = await this.checkPokemonCatch(userId, problem.pokemonId);
        response.pokemonCaught = catchResult;
      }

      res.json(response);

    } catch (error) {
      console.error('답안 제출 실패:', error);
      res.status(500).json({ error: '답안 제출 중 오류가 발생했습니다.' });
    }
  }

  async getHint(req: Request, res: Response) {
    try {
      const { problemId, userId } = req.params;

      const problem = await MathProblemModel.findOne({ id: problemId });
      if (!problem) {
        return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
      }

      // 사용자의 학습 분석 조회
      const userAnalysis = await this.learningService.analyzeLearningProgress(
        userId,
        problem.multiplicationTable
      );

      // 사용자 수준에 맞는 힌트 생성
      let hint = problem.hint;
      if (userAnalysis.masteryLevel === 'beginner') {
        hint = await this.aiGenerator.generateHintForStruggling(
          problem,
          '초급자를 위한 쉬운 설명 필요'
        );
      }

      res.json({ 
        hint,
        visualElements: problem.visualElements 
      });

    } catch (error) {
      console.error('힌트 조회 실패:', error);
      res.status(500).json({ error: '힌트 조회 중 오류가 발생했습니다.' });
    }
  }

  async getUserProgress(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const progressSummary = await this.learningService.getUserProgressSummary(userId);
      
      // 구구단별 상세 분석
      const tableAnalyses: { [key: number]: any } = {};
      for (let table = 2; table <= 9; table++) {
        tableAnalyses[table] = await this.learningService.analyzeLearningProgress(
          userId,
          table
        );
      }

      res.json({
        summary: progressSummary,
        tableAnalyses
      });

    } catch (error) {
      console.error('진도 조회 실패:', error);
      res.status(500).json({ error: '진도 조회 중 오류가 발생했습니다.' });
    }
  }

  private async checkPokemonCatch(userId: string, pokemonId: number): Promise<any> {
    try {
      // 랜덤 확률로 포켓몬 획득 결정 (정답 시 70% 확률)
      const catchChance = Math.random();
      const isCaught = catchChance < 0.7;

      if (isCaught) {
        // 실제로는 사용자 모델에 포켓몬 추가해야 함
        const pokemon = await this.pokemonService.getPokemonById(pokemonId);
        return {
          success: true,
          pokemon: {
            id: pokemon?.id,
            name: pokemon?.koreanName,
            imageUrl: pokemon?.imageUrl,
            rarity: pokemon?.rarity
          },
          message: `${pokemon?.koreanName}를 잡았다!`
        };
      }

      return { success: false };

    } catch (error) {
      console.error('포켓몬 획득 확인 실패:', error);
      return { success: false };
    }
  }
}