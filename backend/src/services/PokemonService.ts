import { PokemonModel } from '../models/Pokemon';
import { Pokemon } from '../../../shared/types';

export class PokemonService {
  
  async initializePokemonDatabase() {
    try {
      // 기존 데이터 확인
      const existingCount = await PokemonModel.countDocuments();
      
      if (existingCount > 0) {
        console.log(`이미 ${existingCount}마리의 포켓몬이 데이터베이스에 존재합니다.`);
        return { success: true, message: '포켓몬 데이터베이스가 이미 초기화되어 있습니다.' };
      }

      console.log('포켓몬 데이터베이스 초기화 시작...');
      
      // 크롤링 기능은 개발 환경에서만 사용 가능
      throw new Error('크롤링 기능은 프로덕션 환경에서 비활성화되었습니다. 기존 캐시된 데이터를 사용하세요.');
      
      return { 
        success: true, 
        message: '포켓몬 데이터베이스 초기화 완료' 
      };
      
    } catch (error) {
      console.error('포켓몬 데이터베이스 초기화 실패:', error);
      return { 
        success: false, 
        message: `초기화 실패: ${error}` 
      };
    }
  }

  async getPokemonByMultiplicationTable(table: number): Promise<Pokemon[]> {
    try {
      const pokemon = await PokemonModel.find({ multiplicationTable: table }).lean();
      return pokemon;
    } catch (error) {
      console.error(`${table}단 포켓몬 조회 실패:`, error);
      throw error;
    }
  }

  async getPokemonByRegion(region: string): Promise<Pokemon[]> {
    try {
      const pokemon = await PokemonModel.find({ region }).lean();
      return pokemon;
    } catch (error) {
      console.error(`${region} 지역 포켓몬 조회 실패:`, error);
      throw error;
    }
  }

  async getPokemonById(id: number): Promise<Pokemon | null> {
    try {
      const pokemon = await PokemonModel.findOne({ id }).lean();
      return pokemon;
    } catch (error) {
      console.error(`포켓몬 ID ${id} 조회 실패:`, error);
      throw error;
    }
  }

  async getRandomPokemonByTable(table: number, rarity?: string): Promise<Pokemon | null> {
    try {
      const query: any = { multiplicationTable: table };
      if (rarity) {
        query.rarity = rarity;
      }

      const pokemon = await PokemonModel.aggregate([
        { $match: query },
        { $sample: { size: 1 } }
      ]);

      return pokemon.length > 0 ? pokemon[0] : null;
    } catch (error) {
      console.error(`${table}단 랜덤 포켓몬 조회 실패:`, error);
      throw error;
    }
  }

  async getAllPokemon(): Promise<Pokemon[]> {
    try {
      const pokemon = await PokemonModel.find({}).lean();
      return pokemon;
    } catch (error) {
      console.error('전체 포켓몬 조회 실패:', error);
      throw error;
    }
  }

  async getPokemonStats() {
    try {
      const totalCount = await PokemonModel.countDocuments();
      const regionStats = await PokemonModel.aggregate([
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      const tableStats = await PokemonModel.aggregate([
        { $group: { _id: '$multiplicationTable', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      const rarityStats = await PokemonModel.aggregate([
        { $group: { _id: '$rarity', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      return {
        totalCount,
        regionStats,
        tableStats,
        rarityStats
      };
    } catch (error) {
      console.error('포켓몬 통계 조회 실패:', error);
      throw error;
    }
  }
}