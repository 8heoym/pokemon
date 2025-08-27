import { SupabasePokemonService } from '../../src/services/SupabasePokemonService';
import { supabase } from '../../src/config/supabase';

// Supabase 모킹
jest.mock('../../src/config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('SupabasePokemonService', () => {
  let pokemonService: SupabasePokemonService;
  let mockSupabaseFrom: jest.Mock;

  beforeEach(() => {
    pokemonService = new SupabasePokemonService();
    mockSupabaseFrom = supabase.from as jest.Mock;
    jest.clearAllMocks();
  });

  describe('getPokemonStats', () => {
    it('포켓몬 통계를 정상적으로 반환해야 함', async () => {
      const mockData = [
        { multiplication_table: 2, count: 10 },
        { multiplication_table: 3, count: 8 }
      ];

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          data: mockData,
          error: null
        })
      });

      const result = await pokemonService.getPokemonStats();

      expect(result).toEqual({
        totalPokemon: 18,
        pokemonByTable: {
          '2': 10,
          '3': 8
        }
      });
    });

    it('데이터베이스 오류 시 예외를 던져야 함', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          data: null,
          error: { message: 'Database error' }
        })
      });

      await expect(pokemonService.getPokemonStats()).rejects.toThrow('Database error');
    });
  });

  describe('getPokemonByMultiplicationTable', () => {
    it('특정 구구단의 포켓몬을 반환해야 함', async () => {
      const mockPokemon = [
        {
          id: 1,
          name: 'pikachu',
          korean_name: '피카츄',
          image_url: 'http://example.com/pikachu.png',
          region: '관동',
          multiplication_table: 2,
          rarity: 'common',
          characteristics: ['전기', '귀여운']
        }
      ];

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockPokemon,
            error: null
          })
        })
      });

      const result = await pokemonService.getPokemonByMultiplicationTable(2);

      expect(result).toEqual(mockPokemon.map(p => ({
        id: p.id,
        name: p.name,
        koreanName: p.korean_name,
        imageUrl: p.image_url,
        region: p.region,
        multiplicationTable: p.multiplication_table,
        rarity: p.rarity,
        characteristics: p.characteristics
      })));
    });
  });

  describe('getRandomPokemonByTable', () => {
    it('랜덤 포켓몬을 반환해야 함', async () => {
      const mockPokemon = {
        id: 1,
        name: 'pikachu',
        korean_name: '피카츄',
        image_url: 'http://example.com/pikachu.png',
        region: '관동',
        multiplication_table: 2,
        rarity: 'common',
        characteristics: ['전기', '귀여운']
      };

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [mockPokemon],
            error: null
          })
        })
      });

      // Math.random 모킹
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const result = await pokemonService.getRandomPokemonByTable(2);

      expect(result).toEqual({
        id: mockPokemon.id,
        name: mockPokemon.name,
        koreanName: mockPokemon.korean_name,
        imageUrl: mockPokemon.image_url,
        region: mockPokemon.region,
        multiplicationTable: mockPokemon.multiplication_table,
        rarity: mockPokemon.rarity,
        characteristics: mockPokemon.characteristics
      });

      jest.restoreAllMocks();
    });

    it('포켓몬이 없으면 null을 반환해야 함', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null
          })
        })
      });

      const result = await pokemonService.getRandomPokemonByTable(2);

      expect(result).toBeNull();
    });
  });
});