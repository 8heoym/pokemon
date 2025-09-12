import Anthropic from '@anthropic-ai/sdk';
import { MathProblem, Pokemon, UserAnswer, LearningAnalysis } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AIProblemGenerator {
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
      });
    } else {
      console.warn('ANTHROPIC_API_KEY가 설정되지 않음. Mock 모드로 실행합니다.');
      this.anthropic = null as any; // Mock 모드에서는 사용하지 않음
    }
  }

  async generatePersonalizedProblem(
    pokemon: Pokemon,
    multiplicationTable: number,
    difficulty: 1 | 2 | 3,
    userAnalysis?: LearningAnalysis
  ): Promise<MathProblem> {
    try {
      // AI 키가 있으면 실제 AI 사용, 없으면 Mock 사용
      if (this.anthropic) {
        const prompt = this.createProblemPrompt(pokemon, multiplicationTable, difficulty, userAnalysis);
        
        // 🚀 개선: Claude-3 모델로 업그레이드 (기존 SDK 호환)
        const completion = await this.anthropic.completions.create({
          model: 'claude-3-haiku-20240307',
          prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
          max_tokens_to_sample: 1000
        });

        const responseText = completion.completion;
        const problemData = this.parseProblemResponse(responseText);
        
        console.log('AI 문제 생성 완료:', problemData.story.substring(0, 50) + '...');
        
        return {
          id: uuidv4(),
          ...problemData,
          multiplicationTable,
          pokemonId: pokemon.id,
          difficulty
        };
      } else {
        // Fallback to mock generation
        console.log('AI API 키 없음 - Mock 모드 사용');
        const factors = [2, 3, 4, 5, 6, 7, 8, 9];
        const randomFactor = factors[Math.floor(Math.random() * factors.length)];
        const answer = multiplicationTable * randomFactor;
        
        const problemData = {
          story: `${pokemon.koreanName}가 ${multiplicationTable}마리씩 ${randomFactor}그룹에 있습니다. 모두 몇 마리일까요?`,
          hint: `${multiplicationTable} × ${randomFactor}을 계산해보세요!`,
          equation: `${multiplicationTable} × ${randomFactor}`,
          answer: answer,
          visualElements: {
            pokemonCount: multiplicationTable,
            itemsPerPokemon: randomFactor,
            totalItems: answer
          }
        };
        
        return {
          id: uuidv4(),
          ...problemData,
          multiplicationTable,
          pokemonId: pokemon.id,
          difficulty
        };
      }
      
    } catch (error) {
      console.error('문제 생성 실패:', error);
      // AI 실패 시 Mock으로 폴백
      console.log('AI 실패 - Mock 모드로 폴백');
      const factors = [2, 3, 4, 5, 6, 7, 8, 9];
      const randomFactor = factors[Math.floor(Math.random() * factors.length)];
      const answer = multiplicationTable * randomFactor;
      
      const problemData = {
        story: `${pokemon.koreanName}가 ${multiplicationTable}마리씩 ${randomFactor}그룹에 있습니다. 모두 몇 마리일까요?`,
        hint: `${multiplicationTable} × ${randomFactor}을 계산해보세요!`,
        equation: `${multiplicationTable} × ${randomFactor}`,
        answer: answer,
        visualElements: {
          pokemonCount: multiplicationTable,
          itemsPerPokemon: randomFactor,
          totalItems: answer
        }
      };
      
      return {
        id: uuidv4(),
        ...problemData,
        multiplicationTable,
        pokemonId: pokemon.id,
        difficulty
      };
    }
  }

  private createProblemPrompt(
    pokemon: Pokemon,
    table: number,
    difficulty: 1 | 2 | 3,
    userAnalysis?: LearningAnalysis
  ): string {
    const difficultyDesc = {
      1: '가장 쉬운 수준',
      2: '보통 수준', 
      3: '도전적인 수준'
    };

    const mistakeContext = userAnalysis?.commonMistakes.length 
      ? `이 학생의 자주 하는 실수: ${userAnalysis.commonMistakes.join(', ')}`
      : '';

    return `
당신은 초등학교 2학년생을 위한 수학 교육 전문가입니다. 다음 조건에 맞는 곱셈 문제를 생성해주세요.

**조건:**
- 포켓몬: ${pokemon.koreanName} (${pokemon.name})
- 구구단: ${table}단
- 난이도: ${difficultyDesc[difficulty]}
- 특성: ${pokemon.characteristics.join(', ')}

**문제 형식 (반드시 JSON 형태로 응답):**
{
  "story": "포켓몬이 등장하는 재미있는 이야기 형태의 문제",
  "hint": "곱셈이 '반복되는 덧셈'임을 알려주는 힌트 (예: 4개를 3번 더하는 것과 같아요!)",
  "equation": "곱셈식 (예: 4 × 3 = ?)",
  "answer": 정답 숫자,
  "visualElements": {
    "pokemonCount": 포켓몬 개수,
    "itemsPerPokemon": 각 포켓몬당 아이템 개수,
    "totalItems": 전체 아이템 개수
  }
}

**중요 원칙:**
1. CRA 순서: 구체적 상황 → 시각적 표현 → 추상적 공식
2. 이야기는 포켓몬의 특성을 활용하여 흥미롭게 구성
3. 시각적 요소가 명확히 드러나도록 구성
4. ${table}단에 해당하는 곱셈만 사용

${mistakeContext ? `**학습자 고려사항:** ${mistakeContext}` : ''}

JSON 형태로만 응답해주세요.`;
  }

  private parseProblemResponse(response: string): Omit<MathProblem, 'id' | 'multiplicationTable' | 'pokemonId' | 'difficulty'> {
    try {
      // JSON 추출 (마크다운 코드블록이 있을 수 있음)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('유효한 JSON 응답을 찾을 수 없습니다.');
      }
      
      const problemData = JSON.parse(jsonMatch[0]);
      
      // 필수 필드 검증
      const requiredFields = ['story', 'hint', 'equation', 'answer', 'visualElements'];
      for (const field of requiredFields) {
        if (!problemData[field]) {
          throw new Error(`필수 필드 ${field}가 누락되었습니다.`);
        }
      }
      
      // visualElements 검증
      const visualFields = ['pokemonCount', 'itemsPerPokemon', 'totalItems'];
      for (const field of visualFields) {
        if (!problemData.visualElements[field]) {
          throw new Error(`visualElements의 ${field} 필드가 누락되었습니다.`);
        }
      }
      
      return problemData;
      
    } catch (error) {
      console.error('문제 응답 파싱 실패:', error);
      console.error('응답 내용:', response);
      throw new Error('AI 응답을 파싱할 수 없습니다.');
    }
  }

  async analyzeWrongAnswer(
    problem: MathProblem,
    userAnswer: number,
    correctAnswer: number
  ): Promise<string> {
    try {
      const prompt = `
학생이 다음 곱셈 문제를 틀렸습니다. 오답을 분석해주세요.

**문제:** ${problem.story}
**정답:** ${correctAnswer}
**학생 답:** ${userAnswer}
**곱셈식:** ${problem.equation}

다음 중 어떤 오류 유형인지 판단하고 간단한 설명을 제공해주세요:
1. 개념적 오류: 곱셈과 덧셈을 혼동
2. 기억 오류: 구구단을 잘못 기억
3. 계산 실수: 개념은 맞지만 계산 과정에서 실수
4. 기타

응답은 "오류유형: 설명" 형식으로 50자 이내로 해주세요.
      `;

      // AI 키가 있으면 실제 AI 사용, 없으면 Mock 사용
      if (this.anthropic) {
        const completion = await this.anthropic.completions.create({
          model: 'claude-3-haiku-20240307',
          prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
          max_tokens_to_sample: 100
        });

        const responseText = completion.completion;
        console.log('AI 오답 분석 완료:', responseText.trim());
        return responseText.trim();
      } else {
        // Fallback to mock analysis
        console.log('AI API 키 없음 - Mock 오답 분석 사용');
        const errorTypes = ['계산 실수: 단순한 계산 오류', '개념적 오류: 곱셈 이해 부족', '기억 오류: 구구단 실수'];
        return errorTypes[Math.floor(Math.random() * errorTypes.length)];
      }
      
    } catch (error) {
      console.error('오답 분석 실패:', error);
      // AI 실패 시 Mock으로 폴백
      const errorTypes = ['계산 실수: 단순한 계산 오류', '개념적 오류: 곱셈 이해 부족', '기억 오류: 구구단 실수'];
      return errorTypes[Math.floor(Math.random() * errorTypes.length)];
    }
  }

  async generateHintForStruggling(
    problem: MathProblem,
    mistakeType: string
  ): Promise<string> {
    try {
      const prompt = `
학생이 다음 문제에서 "${mistakeType}" 실수를 했습니다.
더 쉬운 힌트를 제공해주세요.

**문제:** ${problem.story}
**기존 힌트:** ${problem.hint}

초등학교 2학년이 이해할 수 있는 더 구체적이고 쉬운 힌트를 50자 이내로 제공해주세요.
시각적 설명이나 단계별 설명을 포함하세요.
      `;

      // AI 키가 있으면 실제 AI 사용, 없으면 Mock 사용
      if (this.anthropic) {
        const completion = await this.anthropic.completions.create({
          model: 'claude-3-haiku-20240307',
          prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
          max_tokens_to_sample: 100
        });

        const responseText = completion.completion;
        const generatedHint = responseText.trim();
        console.log('AI 힌트 생성 완료:', generatedHint);
        return generatedHint || problem.hint;
      } else {
        // Fallback to mock hint generation
        console.log('AI API 키 없음 - Mock 힌트 생성 사용');
        const hints = [
          '손가락으로 세어보세요!',
          '더 작은 숫자부터 시작해보세요.',
          '그림을 그려서 생각해보세요!',
          '덧셈으로 바꿔서 계산해보세요.'
        ];
        return hints[Math.floor(Math.random() * hints.length)];
      }
      
    } catch (error) {
      console.error('힌트 생성 실패:', error);
      // AI 실패 시 Mock으로 폴백
      const hints = [
        '손가락으로 세어보세요!',
        '더 작은 숫자부터 시작해보세요.',
        '그림을 그려서 생각해보세요!',
        '덧셈으로 바꿔서 계산해보세요.'
      ];
      return hints[Math.floor(Math.random() * hints.length)];
    }
  }
}