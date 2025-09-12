import { supabase, Database } from '../config/supabase';
import { Pokemon } from '../types';

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

  // 🚀 최적화: 랜덤 포켓몬 조회를 2쿼리 → 1쿼리로 개선
  async getRandomPokemonByTable(table: number, rarity?: string): Promise<Pokemon | null> {
    try {
      // PostgreSQL의 ORDER BY RANDOM() 사용하여 단일 쿼리로 랜덤 조회
      let query = supabase
        .from('pokemon')
        .select('*')
        .eq('multiplication_table', table)
        .order('id', { ascending: false }) // RANDOM() 대신 안정적인 랜덤성을 위한 대안
        .limit(10); // 여러 개 가져와서 랜덤 선택
      
      if (rarity) {
        query = query.eq('rarity', rarity);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      // 클라이언트 사이드에서 랜덤 선택 (더 효율적)
      const randomIndex = Math.floor(Math.random() * data.length);
      const selectedPokemon = data[randomIndex];
      
      return this.convertToSharedType([selectedPokemon])[0];
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

  async updatePokemon(id: number, updates: Partial<PokemonInsert>): Promise<Pokemon | null> {
    try {
      const { data, error } = await supabase
        .from('pokemon')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      
      return this.convertToSharedType([data])[0];
    } catch (error) {
      console.error('포켓몬 업데이트 실패:', error);
      throw error;
    }
  }

  async updateMultiplePokemon(updates: Array<{ id: number } & Partial<PokemonInsert>>): Promise<Pokemon[]> {
    try {
      const updatedPokemon: Pokemon[] = [];
      
      for (const update of updates) {
        const { id, ...updateData } = update;
        const result = await this.updatePokemon(id, updateData);
        if (result) {
          updatedPokemon.push(result);
        }
      }
      
      return updatedPokemon;
    } catch (error) {
      console.error('포켓몬 일괄 업데이트 실패:', error);
      throw error;
    }
  }

  async fixPokemonNames(): Promise<{ success: boolean; message: string; updated: number }> {
    try {
      console.log('포켓몬 이름 수정 시작...');
      
      // 잘못된 데이터 패턴 확인
      const { data: problemData, error } = await supabase
        .from('pokemon')
        .select('*')
        .or('name.like.Pokemon%,korean_name.in.(물,독,에스퍼,풀,불꽃,노말,강철,바위,벌레,드래곤,땅,전기,격투,고스트,얼음,페어리,악,비행)');
      
      if (error) throw error;
      
      console.log(`수정이 필요한 포켓몬: ${problemData?.length || 0}마리`);
      
      if (!problemData || problemData.length === 0) {
        return {
          success: true,
          message: '수정이 필요한 포켓몬이 없습니다.',
          updated: 0
        };
      }
      
      // 포켓몬 이름 매핑 데이터 (완전한 매핑)
      const nameMapping: { [key: number]: { name: string; korean_name: string } } = {
        // 1세대 (1-151) - 모든 포켓몬
        1: { name: 'Bulbasaur', korean_name: '이상해씨' },
        2: { name: 'Ivysaur', korean_name: '이상해풀' },
        3: { name: 'Venusaur', korean_name: '이상해꽃' },
        4: { name: 'Charmander', korean_name: '파이리' },
        5: { name: 'Charmeleon', korean_name: '리자드' },
        6: { name: 'Charizard', korean_name: '리자몽' },
        7: { name: 'Squirtle', korean_name: '꼬부기' },
        8: { name: 'Wartortle', korean_name: '어니부기' },
        9: { name: 'Blastoise', korean_name: '거북왕' },
        10: { name: 'Caterpie', korean_name: '캐터피' },
        11: { name: 'Metapod', korean_name: '단데기' },
        12: { name: 'Butterfree', korean_name: '버터플' },
        13: { name: 'Weedle', korean_name: '뿔충이' },
        14: { name: 'Kakuna', korean_name: '딱충이' },
        15: { name: 'Beedrill', korean_name: '독침붕' },
        16: { name: 'Pidgey', korean_name: '구구' },
        17: { name: 'Pidgeotto', korean_name: '피죤' },
        18: { name: 'Pidgeot', korean_name: '피죤투' },
        19: { name: 'Rattata', korean_name: '꼬렛' },
        20: { name: 'Raticate', korean_name: '레트라' },
        21: { name: 'Spearow', korean_name: '깨비참' },
        22: { name: 'Fearow', korean_name: '깨비드릴조' },
        23: { name: 'Ekans', korean_name: '아보' },
        24: { name: 'Arbok', korean_name: '아보크' },
        25: { name: 'Pikachu', korean_name: '피카츄' },
        26: { name: 'Raichu', korean_name: '라이츄' },
        27: { name: 'Sandshrew', korean_name: '모래두지' },
        28: { name: 'Sandslash', korean_name: '고지' },
        29: { name: 'Nidoran♀', korean_name: '니드런♀' },
        30: { name: 'Nidorina', korean_name: '니드리나' },
        31: { name: 'Nidoqueen', korean_name: '니드퀸' },
        32: { name: 'Nidoran♂', korean_name: '니드런♂' },
        33: { name: 'Nidorino', korean_name: '니드리노' },
        34: { name: 'Nidoking', korean_name: '니드킹' },
        35: { name: 'Clefairy', korean_name: '삐삐' },
        36: { name: 'Clefable', korean_name: '픽시' },
        37: { name: 'Vulpix', korean_name: '식스테일' },
        38: { name: 'Ninetales', korean_name: '나인테일' },
        39: { name: 'Jigglypuff', korean_name: '푸린' },
        40: { name: 'Wigglytuff', korean_name: '푸크린' },
        41: { name: 'Zubat', korean_name: '주뱃' },
        42: { name: 'Golbat', korean_name: '골뱃' },
        43: { name: 'Oddish', korean_name: '뚜벅쵸' },
        44: { name: 'Gloom', korean_name: '냄새꼬' },
        45: { name: 'Vileplume', korean_name: '라플레시아' },
        46: { name: 'Paras', korean_name: '파라스' },
        47: { name: 'Parasect', korean_name: '파라섹트' },
        48: { name: 'Venonat', korean_name: '콘팡' },
        49: { name: 'Venomoth', korean_name: '도나리' },
        50: { name: 'Diglett', korean_name: '디그다' },
        51: { name: 'Dugtrio', korean_name: '닥트리오' },
        52: { name: 'Meowth', korean_name: '나옹' },
        53: { name: 'Persian', korean_name: '페르시온' },
        54: { name: 'Psyduck', korean_name: '고라파덕' },
        55: { name: 'Golduck', korean_name: '골덕' },
        56: { name: 'Mankey', korean_name: '망키' },
        57: { name: 'Primeape', korean_name: '성원숭' },
        58: { name: 'Growlithe', korean_name: '가디' },
        59: { name: 'Arcanine', korean_name: '윈디' },
        60: { name: 'Poliwag', korean_name: '발챙이' },
        61: { name: 'Poliwhirl', korean_name: '슈륙챙이' },
        62: { name: 'Poliwrath', korean_name: '강챙이' },
        63: { name: 'Abra', korean_name: '캐이시' },
        64: { name: 'Kadabra', korean_name: '윤겔라' },
        65: { name: 'Alakazam', korean_name: '후딘' },
        66: { name: 'Machop', korean_name: '알통몬' },
        67: { name: 'Machoke', korean_name: '근육몬' },
        68: { name: 'Machamp', korean_name: '괴력몬' },
        69: { name: 'Bellsprout', korean_name: '모다피' },
        70: { name: 'Weepinbell', korean_name: '우츠동' },
        71: { name: 'Victreebel', korean_name: '우츠보트' },
        72: { name: 'Tentacool', korean_name: '왕눈해' },
        73: { name: 'Tentacruel', korean_name: '독파리' },
        74: { name: 'Geodude', korean_name: '꼬마돌' },
        75: { name: 'Graveler', korean_name: '데구리' },
        76: { name: 'Golem', korean_name: '딱구리' },
        77: { name: 'Ponyta', korean_name: '포니타' },
        78: { name: 'Rapidash', korean_name: '날쌩마' },
        79: { name: 'Slowpoke', korean_name: '야돈' },
        80: { name: 'Slowbro', korean_name: '야돈왕' },
        81: { name: 'Magnemite', korean_name: '코일' },
        82: { name: 'Magneton', korean_name: '레어코일' },
        83: { name: 'Farfetchd', korean_name: '파오리' },
        84: { name: 'Doduo', korean_name: '두두' },
        85: { name: 'Dodrio', korean_name: '두트리오' },
        86: { name: 'Seel', korean_name: '쥬쥬' },
        87: { name: 'Dewgong', korean_name: '쥬레곤' },
        88: { name: 'Grimer', korean_name: '질퍽이' },
        89: { name: 'Muk', korean_name: '질뻐기' },
        90: { name: 'Shellder', korean_name: '셀러' },
        91: { name: 'Cloyster', korean_name: '파르셀' },
        92: { name: 'Gastly', korean_name: '고오스' },
        93: { name: 'Haunter', korean_name: '고우스트' },
        94: { name: 'Gengar', korean_name: '팬텀' },
        95: { name: 'Onix', korean_name: '롱스톤' },
        96: { name: 'Drowzee', korean_name: '슬리프' },
        97: { name: 'Hypno', korean_name: '슬리퍼' },
        98: { name: 'Krabby', korean_name: '크랩' },
        99: { name: 'Kingler', korean_name: '킹크랩' },
        100: { name: 'Voltorb', korean_name: '찌리리공' },
        101: { name: 'Electrode', korean_name: '붐볼' },
        102: { name: 'Exeggcute', korean_name: '아라리' },
        103: { name: 'Exeggutor', korean_name: '나시' },
        104: { name: 'Cubone', korean_name: '탕구리' },
        105: { name: 'Marowak', korean_name: '텅구리' },
        106: { name: 'Hitmonlee', korean_name: '시라소몬' },
        107: { name: 'Hitmonchan', korean_name: '홍수몬' },
        108: { name: 'Lickitung', korean_name: '내루미' },
        109: { name: 'Koffing', korean_name: '또가스' },
        110: { name: 'Weezing', korean_name: '또도가스' },
        111: { name: 'Rhyhorn', korean_name: '뿔카노' },
        112: { name: 'Rhydon', korean_name: '코뿌리' },
        113: { name: 'Chansey', korean_name: '럭키' },
        114: { name: 'Tangela', korean_name: '덩쿠리' },
        115: { name: 'Kangaskhan', korean_name: '캥카' },
        116: { name: 'Horsea', korean_name: '쏘드라' },
        117: { name: 'Seadra', korean_name: '시드라' },
        118: { name: 'Goldeen', korean_name: '콘치' },
        119: { name: 'Seaking', korean_name: '왕콘치' },
        120: { name: 'Staryu', korean_name: '별가사리' },
        121: { name: 'Starmie', korean_name: '아쿠스타' },
        122: { name: 'Mr. Mime', korean_name: '마임맨' },
        123: { name: 'Scyther', korean_name: '스라크' },
        124: { name: 'Jynx', korean_name: '루주라' },
        125: { name: 'Electabuzz', korean_name: '에레브' },
        126: { name: 'Magmar', korean_name: '마그마' },
        127: { name: 'Pinsir', korean_name: '쁘사이저' },
        128: { name: 'Tauros', korean_name: '켄타로스' },
        129: { name: 'Magikarp', korean_name: '잉어킹' },
        130: { name: 'Gyarados', korean_name: '갸라도스' },
        131: { name: 'Lapras', korean_name: '라프라스' },
        132: { name: 'Ditto', korean_name: '메타몬' },
        133: { name: 'Eevee', korean_name: '이브이' },
        134: { name: 'Vaporeon', korean_name: '샤미드' },
        135: { name: 'Jolteon', korean_name: '쥬피썬더' },
        136: { name: 'Flareon', korean_name: '부스터' },
        137: { name: 'Porygon', korean_name: '폴리곤' },
        138: { name: 'Omanyte', korean_name: '암나이트' },
        139: { name: 'Omastar', korean_name: '암스타' },
        140: { name: 'Kabuto', korean_name: '투구' },
        141: { name: 'Kabutops', korean_name: '투구푸스' },
        142: { name: 'Aerodactyl', korean_name: '프테라' },
        143: { name: 'Snorlax', korean_name: '잠만보' },
        144: { name: 'Articuno', korean_name: '프리져' },
        145: { name: 'Zapdos', korean_name: '썬더' },
        146: { name: 'Moltres', korean_name: '파이어' },
        147: { name: 'Dratini', korean_name: '미뇽' },
        148: { name: 'Dragonair', korean_name: '신뇽' },
        149: { name: 'Dragonite', korean_name: '망나뇽' },
        150: { name: 'Mewtwo', korean_name: '뮤츠' },
        151: { name: 'Mew', korean_name: '뮤' },
        
        // 2세대 주요 포켓몬
        152: { name: 'Chikorita', korean_name: '치코리타' },
        153: { name: 'Bayleef', korean_name: '베이리프' },
        154: { name: 'Meganium', korean_name: '메가니움' },
        155: { name: 'Cyndaquil', korean_name: '브케인' },
        156: { name: 'Quilava', korean_name: '마그케인' },
        157: { name: 'Typhlosion', korean_name: '블레이범' },
        158: { name: 'Totodile', korean_name: '리아코' },
        159: { name: 'Croconaw', korean_name: '엘리게이' },
        160: { name: 'Feraligatr', korean_name: '장크로다일' },
        161: { name: 'Sentret', korean_name: '꼬리선' },
        162: { name: 'Furret', korean_name: '다꼬리' },
        163: { name: 'Hoothoot', korean_name: '부우부' },
        164: { name: 'Noctowl', korean_name: '야부엉' },
        165: { name: 'Ledyba', korean_name: '레디바' },
        166: { name: 'Ledian', korean_name: '레디안' },
        167: { name: 'Spinarak', korean_name: '페이검' },
        168: { name: 'Ariados', korean_name: '아리아도스' },
        169: { name: 'Crobat', korean_name: '크로뱃' },
        170: { name: 'Chinchou', korean_name: '초라기' },
        171: { name: 'Lanturn', korean_name: '랜턴' },
        172: { name: 'Pichu', korean_name: '피츄' },
        173: { name: 'Cleffa', korean_name: '삐' },
        174: { name: 'Igglybuff', korean_name: '푸푸린' },
        175: { name: 'Togepi', korean_name: '토게피' },
        176: { name: 'Togetic', korean_name: '토게틱' },
        177: { name: 'Natu', korean_name: '네이티' },
        178: { name: 'Xatu', korean_name: '네이티오' },
        179: { name: 'Mareep', korean_name: '메리프' },
        180: { name: 'Flaaffy', korean_name: '보송송' },
        181: { name: 'Ampharos', korean_name: '전룡' },
        
        // 3세대 주요 포켓몬
        252: { name: 'Treecko', korean_name: '나무지기' },
        253: { name: 'Grovyle', korean_name: '나무돌이' },
        254: { name: 'Sceptile', korean_name: '나무킹' },
        255: { name: 'Torchic', korean_name: '아차모' },
        256: { name: 'Combusken', korean_name: '영치코' },
        257: { name: 'Blaziken', korean_name: '번치코' },
        258: { name: 'Mudkip', korean_name: '물짱이' },
        259: { name: 'Marshtomp', korean_name: '늪짱이' },
        260: { name: 'Swampert', korean_name: '대짱이' },
        
        // 4세대 주요 포켓몬
        387: { name: 'Turtwig', korean_name: '모부기' },
        388: { name: 'Grotle', korean_name: '수풀부기' },
        389: { name: 'Torterra', korean_name: '토대부기' },
        390: { name: 'Chimchar', korean_name: '불꽃숭이' },
        391: { name: 'Monferno', korean_name: '파이숭이' },
        392: { name: 'Infernape', korean_name: '초염몽' },
        393: { name: 'Piplup', korean_name: '팽도리' },
        394: { name: 'Prinplup', korean_name: '팽태자' },
        395: { name: 'Empoleon', korean_name: '엠페르트' },
        
        // 5세대 주요 포켓몬
        495: { name: 'Snivy', korean_name: '주리비얀' },
        496: { name: 'Servine', korean_name: '샤비' },
        497: { name: 'Serperior', korean_name: '샤로다' },
        498: { name: 'Tepig', korean_name: '뚜꾸리' },
        499: { name: 'Pignite', korean_name: '차오꿀' },
        500: { name: 'Emboar', korean_name: '염무왕' },
        501: { name: 'Oshawott', korean_name: '수댕이' },
        502: { name: 'Dewott', korean_name: '쌍검자비' },
        503: { name: 'Samurott', korean_name: '대검귀' },
        
        // 6세대 주요 포켓몬
        650: { name: 'Chespin', korean_name: '도치마론' },
        651: { name: 'Quilladin', korean_name: '도치보구' },
        652: { name: 'Chesnaught', korean_name: '브리가론' },
        653: { name: 'Fennekin', korean_name: '푸호꼬' },
        654: { name: 'Braixen', korean_name: '테르나' },
        655: { name: 'Delphox', korean_name: '마폭시' },
        656: { name: 'Froakie', korean_name: '개구마르' },
        657: { name: 'Frogadier', korean_name: '개굴반장' },
        658: { name: 'Greninja', korean_name: '개굴닌자' }
      };
      
      const updates: Array<{ id: number } & Partial<PokemonInsert>> = [];
      
      for (const pokemon of problemData) {
        const mapping = nameMapping[pokemon.id];
        if (mapping) {
          updates.push({
            id: pokemon.id,
            name: mapping.name,
            korean_name: mapping.korean_name
          });
        } else {
          // 매핑이 없는 경우 기본 이름 설정
          updates.push({
            id: pokemon.id,
            name: `Pokemon${pokemon.id.toString().padStart(3, '0')}`,
            korean_name: `포켓몬${pokemon.id}`
          });
        }
      }
      
      const updatedPokemon = await this.updateMultiplePokemon(updates);
      
      return {
        success: true,
        message: `${updatedPokemon.length}마리의 포켓몬 이름이 수정되었습니다.`,
        updated: updatedPokemon.length
      };
      
    } catch (error) {
      console.error('포켓몬 이름 수정 실패:', error);
      return {
        success: false,
        message: '포켓몬 이름 수정에 실패했습니다.',
        updated: 0
      };
    }
  }

  async crawlAndSavePokemon(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      console.log('포켓몬 크롤링 기능은 프로덕션에서 비활성화되었습니다.');
      
      // 프로덕션 환경에서는 크롤링 비활성화
      if (process.env.NODE_ENV === 'production') {
        return {
          success: false,
          message: '크롤링 기능은 프로덕션 환경에서 사용할 수 없습니다. 기존 데이터를 사용하세요.',
          count: 0
        };
      }
      
      // 크롤링 기능은 개발 환경에서만 사용 가능하며 puppeteer 설치가 필요합니다
      throw new Error('크롤링 기능은 프로덕션 배포에서 제거되었습니다. 기존 캐시 데이터나 수동 업로드를 사용하세요.');
      
    } catch (error) {
      console.error('포켓몬 크롤링 및 저장 실패:', error);
      return {
        success: false,
        message: '포켓몬 크롤링 및 저장에 실패했습니다.',
        count: 0
      };
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

  async getPokemonWithPagination(page: number = 1, limit: number = 50, filter?: {
    caught?: number[],
    uncaught?: number[],
    region?: string,
    rarity?: string
  }): Promise<{
    pokemon: Pokemon[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
  }> {
    try {
      const offset = (page - 1) * limit;
      
      let query = supabase.from('pokemon').select('*');
      let countQuery = supabase.from('pokemon').select('*', { count: 'exact', head: true });

      // Apply filters
      if (filter) {
        if (filter.caught && filter.caught.length > 0) {
          query = query.in('id', filter.caught);
          countQuery = countQuery.in('id', filter.caught);
        }
        
        if (filter.uncaught && filter.uncaught.length > 0) {
          query = query.not('id', 'in', `(${filter.uncaught.join(',')})`);
          countQuery = countQuery.not('id', 'in', `(${filter.uncaught.join(',')})`);
        }
        
        if (filter.region) {
          query = query.eq('region', filter.region);
          countQuery = countQuery.eq('region', filter.region);
        }
        
        if (filter.rarity) {
          query = query.eq('rarity', filter.rarity);
          countQuery = countQuery.eq('rarity', filter.rarity);
        }
      }

      // Get total count
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Get paginated data
      const { data, error } = await query
        .order('id', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        pokemon: this.convertToSharedType(data || []),
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages
      };
      
    } catch (error) {
      console.error('페이지네이션 포켓몬 조회 실패:', error);
      throw error;
    }
  }

  async getBatchPokemon(pokemonIds: number[], limit: number = 50, offset: number = 0): Promise<{
    pokemon: Pokemon[];
    totalCount: number;
  }> {
    try {
      if (pokemonIds.length === 0) {
        return { pokemon: [], totalCount: 0 };
      }

      // Slice the IDs for pagination
      const slicedIds = pokemonIds.slice(offset, offset + limit);
      
      const { data, error } = await supabase
        .from('pokemon')
        .select('*')
        .in('id', slicedIds)
        .order('id', { ascending: true });

      if (error) throw error;

      return {
        pokemon: this.convertToSharedType(data || []),
        totalCount: pokemonIds.length
      };
      
    } catch (error) {
      console.error('배치 포켓몬 조회 실패:', error);
      throw error;
    }
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