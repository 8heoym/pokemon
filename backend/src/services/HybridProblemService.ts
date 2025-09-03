import { ProblemTemplateService, ProblemTemplate, RenderedProblem } from './ProblemTemplateService';
import { SupabasePokemonService } from './SupabasePokemonService';
import { AIProblemGenerator } from './AIProblemGenerator';
import { SupabaseGameService } from './SupabaseGameService';
import { Pokemon, MathProblem } from '../types';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

type GenerationStrategy = 'TEMPLATE_PRIORITY' | 'AI_PERSONALIZED' | 'HYBRID_ENHANCED';

export class HybridProblemService {
  private templateService: ProblemTemplateService;
  private pokemonService: SupabasePokemonService;
  private aiGenerator: AIProblemGenerator;

  constructor() {
    this.templateService = new ProblemTemplateService();
    this.pokemonService = new SupabasePokemonService();
    this.aiGenerator = new AIProblemGenerator();
  }

  async generateProblem(
    userId: string,
    multiplicationTable: number,
    difficulty: 1 | 2 | 3 = 1
  ): Promise<{ problem: MathProblem; pokemon: Pokemon }> {
    try {
      // 1. 생성 전략 결정
      const strategy = await this.decideGenerationStrategy(
        userId,
        multiplicationTable,
        difficulty
      );

      console.log(`문제 생성 전략: ${strategy} (구구단: ${multiplicationTable}, 난이도: ${difficulty})`);

      switch (strategy) {
        case 'TEMPLATE_PRIORITY':
          return await this.generateFromTemplate(userId, multiplicationTable, difficulty);
        
        case 'AI_PERSONALIZED':
          return await this.generateWithAI(userId, multiplicationTable, difficulty);
        
        case 'HYBRID_ENHANCED':
          return await this.generateHybrid(userId, multiplicationTable, difficulty);
        
        default:
          return await this.generateFromTemplate(userId, multiplicationTable, difficulty);
      }
    } catch (error) {
      console.error('하이브리드 문제 생성 실패:', error);
      
      // 폴백: 기존 AI 생성 방식
      console.log('폴백: 기존 AI 생성 방식 사용');
      return await this.generateWithAI(userId, multiplicationTable, difficulty);
    }
  }

  private async decideGenerationStrategy(
    userId: string,
    multiplicationTable: number,
    difficulty: 1 | 2 | 3
  ): Promise<GenerationStrategy> {
    try {
      // 사용 가능한 템플릿 확인
      const availableTemplates = await this.templateService.getAvailableTemplates(
        multiplicationTable,
        difficulty,
        userId
      );

      // 사용자 학습 이력 확인 (간단한 버전)
      const userSolvedCount = await this.getUserSolvedCount(userId, multiplicationTable);

      // 전략 결정 로직
      if (availableTemplates.length >= 3) {
        // 충분한 템플릿이 있으면 템플릿 우선
        return 'TEMPLATE_PRIORITY';
      } else if (availableTemplates.length >= 1 && userSolvedCount > 10) {
        // 숙련된 사용자이고 템플릿이 일부 있으면 하이브리드
        return 'HYBRID_ENHANCED';
      } else {
        // 신규 사용자이거나 템플릿 부족 시 AI 생성
        return 'AI_PERSONALIZED';
      }
    } catch (error) {
      console.error('전략 결정 실패:', error);
      return 'TEMPLATE_PRIORITY'; // 기본값
    }
  }

  private async generateFromTemplate(
    userId: string,
    multiplicationTable: number,
    difficulty: 1 | 2 | 3
  ): Promise<{ problem: MathProblem; pokemon: Pokemon }> {
    try {
      // 1. 사용 가능한 템플릿 조회
      const templates = await this.templateService.getAvailableTemplates(
        multiplicationTable,
        difficulty,
        userId
      );

      if (templates.length === 0) {
        throw new Error('사용 가능한 템플릿이 없습니다.');
      }

      // 2. 품질 점수 기반 템플릿 선택
      const selectedTemplate = templates.sort((a, b) => b.qualityScore - a.qualityScore)[0];

      // 3. 적합한 포켓몬 선택
      const pokemon = await this.selectOptimalPokemon(userId, multiplicationTable);
      
      if (!pokemon) {
        throw new Error('적합한 포켓몬을 찾을 수 없습니다.');
      }

      // 4. 템플릿 렌더링
      const renderedProblem = await this.templateService.renderProblem(
        selectedTemplate,
        pokemon,
        multiplicationTable,
        userId
      );

      // 5. MathProblem 형태로 변환
      const mathProblem: MathProblem = {
        id: renderedProblem.id,
        story: renderedProblem.story,
        hint: renderedProblem.hint,
        equation: renderedProblem.equation,
        answer: renderedProblem.answer,
        multiplicationTable: renderedProblem.multiplicationTable,
        pokemonId: renderedProblem.pokemonId,
        difficulty: renderedProblem.difficulty,
        visualElements: renderedProblem.visualElements
      };

      console.log(`템플릿 문제 생성 완료: ${selectedTemplate.name} + ${pokemon.koreanName}`);

      return {
        problem: mathProblem,
        pokemon: pokemon
      };

    } catch (error) {
      console.error('템플릿 기반 문제 생성 실패:', error);
      throw error;
    }
  }

  private async generateWithAI(
    userId: string,
    multiplicationTable: number,
    difficulty: 1 | 2 | 3
  ): Promise<{ problem: MathProblem; pokemon: Pokemon }> {
    try {
      // 기존 AI 생성 방식 사용
      const pokemon = await this.selectOptimalPokemon(userId, multiplicationTable);
      
      if (!pokemon) {
        throw new Error('적합한 포켓몬을 찾을 수 없습니다.');
      }

      const problem = await this.aiGenerator.generatePersonalizedProblem(
        pokemon,
        multiplicationTable,
        difficulty
      );

      // AI 생성 문제도 세션에 저장
      const problemInstance = this.convertAIProblemToRendered(problem, pokemon, multiplicationTable);
      await this.templateService.saveToSession(userId, problemInstance);

      console.log(`AI 문제 생성 완료: ${pokemon.koreanName}`);

      return {
        problem,
        pokemon
      };

    } catch (error) {
      console.error('AI 기반 문제 생성 실패:', error);
      throw error;
    }
  }

  private async generateHybrid(
    userId: string,
    multiplicationTable: number,
    difficulty: 1 | 2 | 3
  ): Promise<{ problem: MathProblem; pokemon: Pokemon }> {
    try {
      // 60% 확률로 템플릿, 40% 확률로 AI
      const useTemplate = Math.random() < 0.6;

      if (useTemplate) {
        try {
          return await this.generateFromTemplate(userId, multiplicationTable, difficulty);
        } catch (error) {
          console.log('템플릿 생성 실패, AI로 폴백');
          return await this.generateWithAI(userId, multiplicationTable, difficulty);
        }
      } else {
        return await this.generateWithAI(userId, multiplicationTable, difficulty);
      }

    } catch (error) {
      console.error('하이브리드 문제 생성 실패:', error);
      throw error;
    }
  }

  private async selectOptimalPokemon(
    userId: string,
    multiplicationTable: number
  ): Promise<Pokemon | null> {
    try {
      // 1차: 구구단별 포켓몬 조회
      let pokemon = await this.pokemonService.getRandomPokemonByTable(multiplicationTable);
      
      if (pokemon) {
        return pokemon;
      }

      // 2차: 전체 포켓몬에서 랜덤 선택
      console.log(`구구단 ${multiplicationTable}에 해당하는 포켓몬이 없어서 전체에서 선택`);
      return await this.pokemonService.getRandomPokemonByTable(0); // 0 = 전체

    } catch (error) {
      console.error('포켓몬 선택 실패:', error);
      return null;
    }
  }

  private async getUserSolvedCount(userId: string, multiplicationTable: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_answers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('사용자 해결 문제 수 조회 실패:', error);
      return 0;
    }
  }

  async submitAnswer(
    userId: string,
    problemId: string,
    userAnswer: number,
    timeSpent: number,
    hintsUsed: number = 0
  ): Promise<{
    isCorrect: boolean;
    correctAnswer: number;
    pokemonCaught?: any;
    experienceGained: number;
    feedback: string;
  }> {
    try {
      // 1. 세션에서 문제 조회
      const problemInstance = await this.templateService.getProblemFromSession(userId, problemId);
      
      if (!problemInstance) {
        return {
          isCorrect: false,
          correctAnswer: 0,
          experienceGained: 0,
          feedback: '문제가 만료되었거나 찾을 수 없습니다. 새로운 문제를 요청해주세요.',
          requireNewProblem: true
        } as any;
      }

      // 2. 정답 확인
      const isCorrect = userAnswer === problemInstance.answer;

      // 3. 답안 기록 (user_answers 테이블에 저장)
      await this.recordAnswer(userId, problemInstance, userAnswer, timeSpent, hintsUsed, isCorrect);

      // 4. 문제 세션 완료 처리
      await this.templateService.markProblemAnswered(problemId, userId);

      // 5. 포켓몬 잡기 및 경험치 (기존 로직 사용)
      let pokemonCaught = null;
      let experienceGained = 0;

      if (isCorrect) {
        // 기존 게임 서비스의 포켓몬 잡기 로직 사용
        experienceGained = this.calculateExperience(problemInstance.difficulty, timeSpent);
      }

      const feedback = isCorrect ? 
        '정답입니다! 🎉' : 
        `아쉽지만 틀렸습니다. 정답은 ${problemInstance.answer}입니다.`;

      return {
        isCorrect,
        correctAnswer: problemInstance.answer,
        pokemonCaught,
        experienceGained,
        feedback
      };

    } catch (error) {
      console.error('답안 제출 처리 실패:', error);
      throw error;
    }
  }

  private async recordAnswer(
    userId: string,
    problem: RenderedProblem,
    userAnswer: number,
    timeSpent: number,
    hintsUsed: number,
    isCorrect: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_answers')
        .insert({
          id: uuidv4(),
          user_id: userId,
          problem_id: problem.id,
          user_answer: userAnswer,
          correct_answer: problem.answer,
          is_correct: isCorrect,
          time_spent: timeSpent,
          hints_used: hintsUsed,
          template_id: problem.templateId,
          pokemon_id: problem.pokemonId,
          attempted_at: new Date().toISOString()
        });

      if (error) throw error;

      // 템플릿 사용 통계 업데이트
      if (isCorrect) {
        await this.updateTemplatePerformance(userId, problem.templateId, problem.multiplicationTable, true);
      }

    } catch (error) {
      console.error('답안 기록 실패:', error);
      // 답안 기록 실패는 치명적이지 않으므로 계속 진행
    }
  }

  private async updateTemplatePerformance(
    userId: string,
    templateId: string,
    multiplicationTable: number,
    isCorrect: boolean
  ): Promise<void> {
    try {
      // 템플릿별 성능 통계 업데이트
      const { error } = await supabase.rpc('update_template_performance', {
        p_user_id: userId,
        p_template_id: templateId,
        p_multiplication_table: multiplicationTable,
        p_is_correct: isCorrect
      });

      if (error) console.error('템플릿 성능 업데이트 실패:', error);
    } catch (error) {
      console.error('템플릿 성능 업데이트 실패:', error);
    }
  }

  private calculateExperience(difficulty: 1 | 2 | 3, timeSpent: number): number {
    const baseExp = difficulty * 10;
    const timeBonus = Math.max(0, 30 - timeSpent); // 빠를수록 보너스
    return baseExp + timeBonus;
  }

  private convertAIProblemToRendered(
    problem: MathProblem,
    pokemon: Pokemon,
    multiplicationTable: number
  ): RenderedProblem {
    return {
      id: problem.id,
      story: problem.story,
      hint: problem.hint,
      equation: problem.equation,
      answer: problem.answer,
      multiplicationTable: multiplicationTable,
      pokemonId: pokemon.id,
      difficulty: problem.difficulty,
      templateId: 'ai-generated', // AI 생성임을 표시
      variablesUsed: {
        a: multiplicationTable,
        b: problem.answer / multiplicationTable,
        answer: problem.answer
      },
      visualElements: problem.visualElements
    };
  }
}