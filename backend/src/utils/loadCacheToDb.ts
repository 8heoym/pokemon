import fs from 'fs/promises';
import path from 'path';
import { Pokemon } from '../types';
import { SupabasePokemonService } from '../services/SupabasePokemonService';
import { supabase } from '../config/supabase';

export class CacheLoader {
  private cacheFile = path.join(__dirname, '../../cache/pokemon_cache.json');
  private pokemonService = new SupabasePokemonService();

  async getExistingPokemonIds(): Promise<Set<number>> {
    try {
      const { data, error } = await supabase
        .from('pokemon')
        .select('id');

      if (error) throw error;

      const existingIds = new Set(data?.map((p: any) => p.id) || []);
      return existingIds;
    } catch (error) {
      console.error('기존 포켓몬 ID 조회 실패:', error);
      return new Set();
    }
  }

  async loadCacheToDatabase(): Promise<void> {
    try {
      console.log('캐시 파일에서 포켓몬 데이터 로딩...');
      
      // 캐시 파일 읽기
      const cacheData = await fs.readFile(this.cacheFile, 'utf-8');
      const pokemonList: Pokemon[] = JSON.parse(cacheData);
      
      console.log(`캐시에서 ${pokemonList.length}마리 포켓몬 데이터 로드`);
      
      // 기존 DB에 있는 포켓몬 ID들 확인
      const existingIds = await this.getExistingPokemonIds();
      console.log(`DB에 기존 포켓몬 ${existingIds.size}마리 확인`);
      
      // 새로운 포켓몬만 필터링
      const newPokemon = pokemonList.filter(pokemon => !existingIds.has(pokemon.id));
      console.log(`새로 추가할 포켓몬: ${newPokemon.length}마리`);
      
      if (newPokemon.length === 0) {
        console.log('새로 추가할 포켓몬이 없습니다.');
        return;
      }
      
      // Pokemon 타입을 DB 타입으로 변환
      const pokemonInserts = newPokemon.map(pokemon => ({
        id: pokemon.id,
        name: pokemon.name,
        korean_name: pokemon.koreanName,
        image_url: pokemon.imageUrl,
        region: pokemon.region,
        multiplication_table: pokemon.multiplicationTable,
        rarity: pokemon.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
        characteristics: pokemon.characteristics
      }));
      
      // 일괄 저장
      await this.pokemonService.createMultiplePokemon(pokemonInserts);
      
      console.log('캐시 데이터 DB 저장 완료!');
      
      // 최종 통계 출력
      const stats = await this.pokemonService.getPokemonStats();
      console.log(`총 DB 포켓몬: ${stats.total}마리`);
      
    } catch (error) {
      console.error('캐시 데이터 로딩 실패:', error);
      throw error;
    }
  }
}

// 스크립트 직접 실행 시 캐시 로드
if (require.main === module) {
  (async () => {
    const loader = new CacheLoader();
    try {
      await loader.loadCacheToDatabase();
    } catch (error) {
      console.error('캐시 로딩 실패:', error);
      process.exit(1);
    }
  })();
}