import { AIProblemGenerator } from '../../src/services/AIProblemGenerator';
import Anthropic from '@anthropic-ai/sdk';

// Anthropic SDK 모킹
jest.mock('@anthropic-ai/sdk');

describe('AIProblemGenerator', () => {
  let generator: AIProblemGenerator;
  let mockAnthropic: jest.Mocked<Anthropic>;

  beforeEach(() => {
    mockAnthropic = {
      messages: {
        create: jest.fn()
      }
    } as any;

    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => mockAnthropic);
    
    generator = new AIProblemGenerator();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateProblem', () => {
    it('AI 문제를 정상적으로 생성해야 함', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            story: "피카츄 3마리가 각각 4개의 나무열매를 가지고 있어요.",
            hint: "3개 그룹에 각각 4개씩 있으니, 4 + 4 + 4와 같아요!",
            equation: "3 × 4 = ?",
            answer: 12,
            visualElements: {
              pokemonCount: 3,
              itemsPerPokemon: 4,
              totalItems: 12
            }
          })
        }]
      };

      mockAnthropic.messages.create.mockResolvedValue(mockResponse as any);

      const pokemon = {
        id: 1,
        name: 'pikachu',
        koreanName: '피카츄',
        imageUrl: 'http://example.com/pikachu.png',
        region: '관동',
        multiplicationTable: 2,
        rarity: 'common' as const,
        characteristics: ['전기', '귀여운']
      };

      const result = await generator.generateProblem(pokemon, 2, 1, []);

      expect(result).toEqual({
        story: "피카츄 3마리가 각각 4개의 나무열매를 가지고 있어요.",
        hint: "3개 그룹에 각각 4개씩 있으니, 4 + 4 + 4와 같아요!",
        equation: "3 × 4 = ?",
        answer: 12,
        multiplicationTable: 2,
        pokemonId: 1,
        difficulty: 1,
        visualElements: {
          pokemonCount: 3,
          itemsPerPokemon: 4,
          totalItems: 12
        }
      });

      expect(mockAnthropic.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user'
            })
          ])
        })
      );
    });

    it('잘못된 AI 응답 처리', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: 'Invalid JSON response'
        }]
      };

      mockAnthropic.messages.create.mockResolvedValue(mockResponse as any);

      const pokemon = {
        id: 1,
        name: 'pikachu',
        koreanName: '피카츄',
        imageUrl: 'http://example.com/pikachu.png',
        region: '관동',
        multiplicationTable: 2,
        rarity: 'common' as const,
        characteristics: ['전기', '귀여운']
      };

      await expect(generator.generateProblem(pokemon, 2, 1, [])).rejects.toThrow();
    });

    it('API 호출 실패 시 예외 처리', async () => {
      mockAnthropic.messages.create.mockRejectedValue(new Error('API Error'));

      const pokemon = {
        id: 1,
        name: 'pikachu',
        koreanName: '피카츄',
        imageUrl: 'http://example.com/pikachu.png',
        region: '관동',
        multiplicationTable: 2,
        rarity: 'common' as const,
        characteristics: ['전기', '귀여운']
      };

      await expect(generator.generateProblem(pokemon, 2, 1, [])).rejects.toThrow('AI 문제 생성 중 오류가 발생했습니다.');
    });
  });
});