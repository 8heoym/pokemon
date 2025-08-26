import { supabase, Database } from '../config/supabase';
import { Pokemon } from '../../../shared/types';

type PokemonRow = Database['public']['Tables']['pokemon']['Row'];
type PokemonInsert = Database['public']['Tables']['pokemon']['Insert'];

export class SupabasePokemonService {
  
  async getPokemonStats() {
    try {
      const { data, error } = await supabase
        .from('pokemon')
        .select('rarity, multiplication_table, region');
      
      if (error) throw error;

      const stats = {
        total: data.length,
        byRarity: this.groupBy(data, 'rarity'),
        byTable: this.groupBy(data, 'multiplication_table'),
        byRegion: this.groupBy(data, 'region')
      };

      return stats;
    } catch (error) {
      console.error('포켓몬 통계 조회 실패:', error);
      throw error;
    }
  }

  async getPokemonByMultiplicationTable(table: number): Promise<Pokemon[]> {
    try {
      const { data, error } = await supabase
        .from('pokemon')
        .select('*')
        .eq('multiplication_table', table);
      
      if (error) throw error;
      
      return this.convertToSharedType(data || []);
    } catch (error) {
      console.error('구구단별 포켓몬 조회 실패:', error);
      throw error;
    }
  }

  async getPokemonByRegion(region: string): Promise<Pokemon[]> {
    try {
      const { data, error } = await supabase
        .from('pokemon')
        .select('*')
        .eq('region', region);
      
      if (error) throw error;
      
      return this.convertToSharedType(data || []);
    } catch (error) {
      console.error('지역별 포켓몬 조회 실패:', error);
      throw error;
    }
  }

  async getRandomPokemonByTable(table: number, rarity?: string): Promise<Pokemon | null> {
    try {
      let query = supabase
        .from('pokemon')
        .select('*')
        .eq('multiplication_table', table);
      
      if (rarity) {
        query = query.eq('rarity', rarity);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * data.length);
      const pokemonData = data[randomIndex];
      
      return this.convertToSharedType([pokemonData])[0];
    } catch (error) {
      console.error('랜덤 포켓몬 조회 실패:', error);
      throw error;
    }
  }

  async getPokemonById(id: number): Promise<Pokemon | null> {
    try {
      const { data, error } = await supabase
        .from('pokemon')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      
      return this.convertToSharedType([data])[0];
    } catch (error) {
      console.error('포켓몬 조회 실패:', error);
      throw error;
    }
  }

  async createPokemon(pokemon: PokemonInsert): Promise<Pokemon> {
    try {
      const { data, error } = await supabase
        .from('pokemon')
        .insert(pokemon)
        .select()
        .single();
      
      if (error) throw error;
      
      return this.convertToSharedType([data])[0];
    } catch (error) {
      console.error('포켓몬 생성 실패:', error);
      throw error;
    }
  }

  async createMultiplePokemon(pokemonList: PokemonInsert[]): Promise<Pokemon[]> {
    try {
      const { data, error } = await supabase
        .from('pokemon')
        .insert(pokemonList)
        .select();
      
      if (error) throw error;
      
      return this.convertToSharedType(data || []);
    } catch (error) {
      console.error('포켓몬 일괄 생성 실패:', error);
      throw error;
    }
  }

  async initializePokemonDatabase() {
    try {
      console.log('포켓몬 데이터베이스 초기화 시작...');
      
      // 크롤링 건너뛰고 바로 기본 데이터 사용
      console.log('크롤링을 건너뛰고 기본 데이터로 초기화합니다.');

      // 크롤링 실패 시 기본 데이터로 초기화
      const { count, error: countError } = await supabase
        .from('pokemon')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      if (count && count >= 100) {
        return {
          success: true,
          message: `데이터베이스에 이미 ${count}마리의 포켓몬이 있습니다.`,
          count
        };
      }

      // 기본 포켓몬 데이터 가져오기
      const { basicPokemonData } = await import('../utils/basicPokemonData');
      const basicPokemon: PokemonInsert[] = basicPokemonData.map(pokemon => ({
        id: pokemon.id,
        name: pokemon.name,
        korean_name: pokemon.korean_name,
        image_url: pokemon.image_url,
        region: pokemon.region,
        multiplication_table: pokemon.multiplication_table,
        rarity: pokemon.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
        characteristics: pokemon.characteristics
      }));

      console.log(`${basicPokemon.length}마리의 기본 포켓몬 데이터 준비 완료`);

      // 기존 데이터 삭제
      console.log('기존 포켓몬 데이터 삭제 중...');
      const { error: deleteError } = await supabase
        .from('pokemon')
        .delete()
        .neq('id', 0); // 모든 데이터 삭제

      if (deleteError) {
        console.log('삭제 중 오류 (무시):', deleteError.message);
      }

      /*const basicPokemon: PokemonInsert[] = [
        // 1세대 스타터
        { id: 1, name: 'Bulbasaur', korean_name: '이상해씨', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', region: '관동지방', multiplication_table: 2, rarity: 'common', characteristics: ['온순함', '풀타입', '씨앗포켓몬'] },
        { id: 4, name: 'Charmander', korean_name: '파이리', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['용감함', '불타입', '도마뱀포켓몬'] },
        { id: 7, name: 'Squirtle', korean_name: '꼬부기', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', region: '관동지방', multiplication_table: 4, rarity: 'common', characteristics: ['신중함', '물타입', '거북포켓몬'] },
        
        // 인기 포켓몬
        { id: 25, name: 'Pikachu', korean_name: '피카츄', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', region: '관동지방', multiplication_table: 2, rarity: 'uncommon', characteristics: ['활발함', '친근함', '전기타입'] },
        { id: 39, name: 'Jigglypuff', korean_name: '푸린', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', region: '관동지방', multiplication_table: 5, rarity: 'common', characteristics: ['귀여움', '노래솜씨', '풍선포켓몬'] },
        { id: 52, name: 'Meowth', korean_name: '나옹', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png', region: '관동지방', multiplication_table: 6, rarity: 'common', characteristics: ['교활함', '고양이포켓몬', '장난기'] },
        
        // 중급 포켓몬
        { id: 104, name: 'Cubone', korean_name: '탕구리', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png', region: '관동지방', multiplication_table: 7, rarity: 'uncommon', characteristics: ['외로움', '땅타입', '외톨이포켓몬'] },
        { id: 113, name: 'Chansey', korean_name: '럭키', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/113.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['친절함', '알포켓몬', '치유력'] },
        { id: 131, name: 'Lapras', korean_name: '라프라스', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png', region: '관동지방', multiplication_table: 9, rarity: 'rare', characteristics: ['온화함', '운송포켓몬', '물타입'] },
        { id: 133, name: 'Eevee', korean_name: '이브이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', region: '관동지방', multiplication_table: 2, rarity: 'rare', characteristics: ['진화능력', '유전자불안정', '진화포켓몬'] },
        
        // 전설 포켓몬
        { id: 150, name: 'Mewtwo', korean_name: '뮤츠', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', region: '관동지방', multiplication_table: 9, rarity: 'legendary', characteristics: ['강력함', '에스퍼타입', '유전자포켓몬'] },
        { id: 151, name: 'Mew', korean_name: '뮤', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png', region: '관동지방', multiplication_table: 9, rarity: 'legendary', characteristics: ['신비로움', '원조포켓몬', '환상포켓몬'] },
        
        // 2세대 포켓몬
        { id: 152, name: 'Chikorita', korean_name: '치코리타', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png', region: '성도지방', multiplication_table: 3, rarity: 'common', characteristics: ['온순함', '풀타입', '잎사귀포켓몬'] },
        { id: 155, name: 'Cyndaquil', korean_name: '브케인', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png', region: '성도지방', multiplication_table: 3, rarity: 'common', characteristics: ['소극적', '불타입', '불쥐포켓몬'] },
        { id: 158, name: 'Totodile', korean_name: '리아코', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png', region: '성도지방', multiplication_table: 4, rarity: 'common', characteristics: ['활발함', '물타입', '큰턱포켓몬'] },
        
        // 3세대 포켓몬
        { id: 252, name: 'Treecko', korean_name: '나무지기', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/252.png', region: '호연지방', multiplication_table: 4, rarity: 'common', characteristics: ['침착함', '풀타입', '나무도마뱀포켓몬'] },
        { id: 255, name: 'Torchic', korean_name: '아차모', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/255.png', region: '호연지방', multiplication_table: 5, rarity: 'common', characteristics: ['활발함', '불타입', '병아리포켓몬'] },
        { id: 258, name: 'Mudkip', korean_name: '물짱이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png', region: '호연지방', multiplication_table: 5, rarity: 'common', characteristics: ['순수함', '물타입', '물고기포켓몬'] },
        
        // 4세대 포켓몬
        { id: 387, name: 'Turtwig', korean_name: '모부기', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/387.png', region: '신오지방', multiplication_table: 7, rarity: 'common', characteristics: ['성실함', '풀타입', '꼬마거북포켓몬'] },
        { id: 390, name: 'Chimchar', korean_name: '불꽃숭이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/390.png', region: '신오지방', multiplication_table: 7, rarity: 'common', characteristics: ['장난기', '불타입', '꼬마원숭이포켓몬'] },
        { id: 393, name: 'Piplup', korean_name: '팽도리', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/393.png', region: '신오지방', multiplication_table: 8, rarity: 'common', characteristics: ['자존심', '물타입', '펭귄포켓몬'] },
        
        // 5세대 포켓몬
        { id: 495, name: 'Snivy', korean_name: '주리비얀', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/495.png', region: '하나지방', multiplication_table: 2, rarity: 'common', characteristics: ['냉정함', '풀타입', '풀뱀포켓몬'] },
        { id: 498, name: 'Tepig', korean_name: '뚜꾸리', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/498.png', region: '하나지방', multiplication_table: 6, rarity: 'common', characteristics: ['활발함', '불타입', '불돼지포켓몬'] },
        { id: 501, name: 'Oshawott', korean_name: '수댕이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/501.png', region: '하나지방', multiplication_table: 6, rarity: 'common', characteristics: ['용감함', '물타입', '바다수달포켓몬'] },
        
        // 추가 인기 포켓몬들
        { id: 94, name: 'Gengar', korean_name: '팬텀', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['장난기', '고스트타입', '그림자포켓몬'] },
        { id: 6, name: 'Charizard', korean_name: '리자몽', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', region: '관동지방', multiplication_table: 9, rarity: 'rare', characteristics: ['강력함', '불타입', '화염포켓몬'] },
        { id: 9, name: 'Blastoise', korean_name: '거북왕', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['침착함', '물타입', '조개포켓몬'] },
        { id: 3, name: 'Venusaur', korean_name: '이상해꽃', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png', region: '관동지방', multiplication_table: 7, rarity: 'rare', characteristics: ['성숙함', '풀타입', '씨앗포켓몬'] },
        
        // 6세대 포켓몬
        { id: 650, name: 'Chespin', korean_name: '도치마론', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/650.png', region: '칼로스지방', multiplication_table: 2, rarity: 'common', characteristics: ['호기심', '풀타입', '밤송이포켓몬'] },
        { id: 653, name: 'Fennekin', korean_name: '푸호꼬', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/653.png', region: '칼로스지방', multiplication_table: 3, rarity: 'common', characteristics: ['우아함', '불타입', '여우포켓몬'] },
        { id: 656, name: 'Froakie', korean_name: '개구마르', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/656.png', region: '칼로스지방', multiplication_table: 3, rarity: 'common', characteristics: ['민첩함', '물타입', '거품개구리포켓몬'] }
      ]; */

      const created = await this.createMultiplePokemon(basicPokemon);
      
      return {
        success: true,
        message: `${created.length}마리의 포켓몬이 데이터베이스에 추가되었습니다.`,
        count: created.length
      };

    } catch (error) {
      console.error('포켓몬 데이터베이스 초기화 실패:', error);
      return {
        success: false,
        message: '포켓몬 데이터베이스 초기화에 실패했습니다.',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private findMissingPokemonIds(pokemonList: Pokemon[]): number[] {
    const existingIds = new Set(pokemonList.map(p => p.id));
    const missingIds: number[] = [];
    
    for (let i = 1; i <= 1025; i++) {
      if (!existingIds.has(i)) {
        missingIds.push(i);
      }
    }
    
    return missingIds;
  }

  private groupBy<T>(array: T[], key: keyof T) {
    return array.reduce((result: { [key: string]: number }, item) => {
      const group = String(item[key]);
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }

  private convertToSharedType(pokemonRows: PokemonRow[]): Pokemon[] {
    return pokemonRows.map(row => ({
      id: row.id,
      name: row.name,
      koreanName: row.korean_name,
      imageUrl: row.image_url,
      region: row.region,
      multiplicationTable: row.multiplication_table,
      rarity: row.rarity,
      characteristics: row.characteristics
    }));
  }
}