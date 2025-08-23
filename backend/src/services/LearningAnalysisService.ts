import { UserAnswerModel } from '../models/UserAnswer';
import { LearningAnalysis, UserAnswer } from '../../../shared/types';

export class LearningAnalysisService {
  
  async analyzeLearningProgress(
    userId: string,
    multiplicationTable: number
  ): Promise<LearningAnalysis> {
    try {
      // 해당 구구단의 모든 답안 조회 (최근 50개)
      const answers = await UserAnswerModel
        .find({ userId })
        .populate('problemId')
        .sort({ attemptedAt: -1 })
        .limit(50)
        .lean();

      // 해당 구구단만 필터링
      const tableAnswers = answers.filter((answer: any) => 
        answer.problemId?.multiplicationTable === multiplicationTable
      );

      if (tableAnswers.length === 0) {
        return this.createDefaultAnalysis(userId, multiplicationTable);
      }

      // 기본 통계 계산
      const correctAnswers = tableAnswers.filter(answer => answer.isCorrect).length;
      const totalAttempts = tableAnswers.length;
      const correctRate = correctAnswers / totalAttempts;
      
      const totalTime = tableAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0);
      const averageTime = totalTime / totalAttempts;

      // 자주 하는 실수 패턴 분석
      const commonMistakes = this.analyzeCommonMistakes(
        tableAnswers.filter(answer => !answer.isCorrect)
      );

      // 숙련도 레벨 결정
      const masteryLevel = this.determineMasteryLevel(correctRate, averageTime, totalAttempts);

      // 추천 행동 생성
      const recommendedActions = this.generateRecommendations(masteryLevel, commonMistakes, correctRate);

      return {
        userId,
        multiplicationTable,
        correctAnswers,
        totalAttempts,
        averageTime,
        commonMistakes,
        masteryLevel,
        recommendedActions
      };

    } catch (error) {
      console.error('학습 분석 실패:', error);
      return this.createDefaultAnalysis(userId, multiplicationTable);
    }
  }

  private createDefaultAnalysis(userId: string, multiplicationTable: number): LearningAnalysis {
    return {
      userId,
      multiplicationTable,
      correctAnswers: 0,
      totalAttempts: 0,
      averageTime: 0,
      commonMistakes: [],
      masteryLevel: 'beginner',
      recommendedActions: ['처음 시작하는 단계입니다. 쉬운 문제부터 차근차근 풀어보세요!']
    };
  }

  private analyzeCommonMistakes(wrongAnswers: any[]): string[] {
    const mistakes: { [key: string]: number } = {};

    for (const answer of wrongAnswers) {
      const userAnswer = answer.userAnswer;
      const correctAnswer = answer.correctAnswer;
      const problem = answer.problemId;

      if (!problem) continue;

      // 패턴 분석
      const diff = Math.abs(userAnswer - correctAnswer);
      
      if (diff === 0) continue;

      // 덧셈으로 계산한 경우 (예: 3×4를 3+4=7로 계산)
      if (this.isAdditionMistake(problem.equation, userAnswer)) {
        mistakes['곱셈을 덧셈으로 계산함'] = (mistakes['곱셈을 덧셈으로 계산함'] || 0) + 1;
      }
      // 구구단 기억 오류
      else if (this.isMemoryError(problem.equation, userAnswer, correctAnswer)) {
        mistakes['구구단 기억 오류'] = (mistakes['구구단 기억 오류'] || 0) + 1;
      }
      // 계산 실수
      else if (diff <= 5) {
        mistakes['계산 실수'] = (mistakes['계산 실수'] || 0) + 1;
      }
      // 큰 수 오류
      else {
        mistakes['답을 추측함'] = (mistakes['답을 추측함'] || 0) + 1;
      }
    }

    // 가장 빈번한 실수 3개 반환
    return Object.entries(mistakes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mistake]) => mistake);
  }

  private isAdditionMistake(equation: string, userAnswer: number): boolean {
    // "4 × 3 = ?" 형태에서 숫자 추출
    const match = equation.match(/(\d+)\s*×\s*(\d+)/);
    if (!match) return false;

    const num1 = parseInt(match[1]);
    const num2 = parseInt(match[2]);
    const additionResult = num1 + num2;

    return userAnswer === additionResult;
  }

  private isMemoryError(equation: string, userAnswer: number, correctAnswer: number): boolean {
    // 같은 구구단 내의 다른 답을 한 경우
    const match = equation.match(/(\d+)\s*×\s*(\d+)/);
    if (!match) return false;

    const num1 = parseInt(match[1]);
    const num2 = parseInt(match[2]);
    
    // 같은 단의 다른 곱셈 결과인지 확인
    for (let i = 1; i <= 9; i++) {
      if (num1 * i === userAnswer || num2 * i === userAnswer) {
        return true;
      }
    }
    return false;
  }

  private determineMasteryLevel(
    correctRate: number,
    averageTime: number,
    totalAttempts: number
  ): 'beginner' | 'intermediate' | 'advanced' | 'mastered' {
    if (totalAttempts < 5) return 'beginner';
    
    if (correctRate >= 0.9 && averageTime <= 10) return 'mastered';
    if (correctRate >= 0.8 && averageTime <= 15) return 'advanced';
    if (correctRate >= 0.6) return 'intermediate';
    
    return 'beginner';
  }

  private generateRecommendations(
    masteryLevel: string,
    commonMistakes: string[],
    correctRate: number
  ): string[] {
    const recommendations: string[] = [];

    // 숙련도별 추천
    switch (masteryLevel) {
      case 'beginner':
        recommendations.push('시각적 힌트를 활용해서 천천히 풀어보세요');
        recommendations.push('같은 구구단을 반복 연습해보세요');
        break;
      case 'intermediate':
        recommendations.push('실수를 줄이기 위해 차근차근 확인해보세요');
        break;
      case 'advanced':
        recommendations.push('더 어려운 문제에 도전해보세요');
        break;
      case 'mastered':
        recommendations.push('다음 구구단으로 넘어갈 준비가 되었어요!');
        break;
    }

    // 실수 패턴별 추천
    if (commonMistakes.includes('곱셈을 덧셈으로 계산함')) {
      recommendations.push('곱셈은 같은 수를 여러 번 더하는 것이에요');
    }
    if (commonMistakes.includes('구구단 기억 오류')) {
      recommendations.push('구구단을 소리내어 외워보세요');
    }
    if (commonMistakes.includes('계산 실수')) {
      recommendations.push('답을 한 번 더 확인하는 습관을 기르세요');
    }

    return recommendations.slice(0, 3); // 최대 3개 추천
  }

  async getUserProgressSummary(userId: string) {
    try {
      const allAnswers = await UserAnswerModel
        .find({ userId })
        .sort({ attemptedAt: -1 })
        .lean();

      // 구구단별 통계
      const tableStats: { [key: number]: any } = {};
      
      for (let table = 2; table <= 9; table++) {
        const tableAnswers = allAnswers.filter((answer: any) => 
          answer.problemId?.multiplicationTable === table
        );
        
        const correctAnswers = tableAnswers.filter(answer => answer.isCorrect).length;
        const totalAttempts = tableAnswers.length;
        
        tableStats[table] = {
          correctAnswers,
          totalAttempts,
          correctRate: totalAttempts > 0 ? correctAnswers / totalAttempts : 0,
          isCompleted: correctAnswers >= 10 && (correctAnswers / totalAttempts) >= 0.8
        };
      }

      return {
        totalProblemsAttempted: allAnswers.length,
        totalCorrectAnswers: allAnswers.filter(answer => answer.isCorrect).length,
        completedTables: Object.entries(tableStats)
          .filter(([_, stats]) => (stats as any).isCompleted)
          .map(([table]) => parseInt(table)),
        tableStats
      };

    } catch (error) {
      console.error('사용자 진도 요약 실패:', error);
      throw error;
    }
  }
}