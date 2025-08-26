import axios from 'axios';
import { Pokemon } from '../../../shared/types';

export class PokeApiCrawler {
  private baseUrl = 'https://pokeapi.co/api/v2';
  
  async crawlAllPokemon(): Promise<Pokemon[]> {
    console.log('PokeAPI를 통한 포켓몬 데이터 수집 시작...');
    
    const pokemonList: Pokemon[] = [];
    const batchSize = 100;
    
    try {
      // 먼저 한글 이름 매핑을 위해 일부 데이터를 가져옴
      const koreanNames = await this.getKoreanNames();
      
      for (let i = 1; i <= 1025; i++) {
        try {
          const pokemonData = await this.getPokemonById(i);
          if (pokemonData) {
            const pokemon: Pokemon = {
              id: pokemonData.id,
              name: pokemonData.name,
              koreanName: koreanNames[pokemonData.id] || this.translateToKorean(pokemonData.name),
              imageUrl: pokemonData.sprites.other?.['official-artwork']?.front_default || 
                       pokemonData.sprites.front_default || 
                       `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`,
              region: this.assignRegion(pokemonData.id),
              multiplicationTable: this.assignMultiplicationTable(pokemonData.id),
              rarity: this.assignRarity(pokemonData.id),
              characteristics: this.getCharacteristics(pokemonData.id, pokemonData.types)
            };
            
            pokemonList.push(pokemon);
            
            // 진행률 출력
            if (i % 50 === 0) {
              console.log(`진행률: ${i}/1025 (${((i/1025)*100).toFixed(1)}%)`);
            }
          }
          
          // API 호출 제한을 위해 잠시 대기
          await this.delay(50);
          
        } catch (error) {
          console.error(`포켓몬 ID ${i} 수집 실패:`, error);
        }
      }
      
      console.log(`총 ${pokemonList.length}마리 포켓몬 데이터 수집 완료`);
      return pokemonList.sort((a, b) => a.id - b.id);
      
    } catch (error) {
      console.error('PokeAPI 크롤링 중 오류 발생:', error);
      throw error;
    }
  }
  
  private async getPokemonById(id: number): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/pokemon/${id}`, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  private async getKoreanNames(): Promise<{[key: number]: string}> {
    // 기본적인 한글 이름 매핑 (일부만)
    return {
      1: '이상해씨', 2: '이상해풀', 3: '이상해꽃',
      4: '파이리', 5: '리자드', 6: '리자몽',
      7: '꼬부기', 8: '어니부기', 9: '거북왕',
      10: '캐터피', 11: '단데기', 12: '버터플',
      25: '피카츄', 26: '라이츄',
      39: '푸린', 52: '나옹', 104: '탕구리', 113: '럭키',
      131: '라프라스', 133: '이브이', 150: '뮤츠', 151: '뮤'
    };
  }
  
  private translateToKorean(englishName: string): string {
    // 기본적인 영어->한글 변환 (실제로는 더 정교한 매핑이 필요)
    const nameMap: {[key: string]: string} = {
      'bulbasaur': '이상해씨', 'ivysaur': '이상해풀', 'venusaur': '이상해꽃',
      'charmander': '파이리', 'charmeleon': '리자드', 'charizard': '리자몽',
      'squirtle': '꼬부기', 'wartortle': '어니부기', 'blastoise': '거북왕',
      'pikachu': '피카츄', 'raichu': '라이츄',
      'jigglypuff': '푸린', 'meowth': '나옹', 'cubone': '탕구리',
      'chansey': '럭키', 'lapras': '라프라스', 'eevee': '이브이',
      'mewtwo': '뮤츠', 'mew': '뮤'
    };
    
    return nameMap[englishName.toLowerCase()] || this.capitalizeFirst(englishName);
  }
  
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  private assignRegion(pokemonId: number): string {
    const regions = [
      { name: '관동지방', range: [1, 151] },
      { name: '성도지방', range: [152, 251] },
      { name: '호연지방', range: [252, 386] },
      { name: '신오지방', range: [387, 493] },
      { name: '하나지방', range: [494, 649] },
      { name: '칼로스지방', range: [650, 721] },
      { name: '알로라지방', range: [722, 809] },
      { name: '가라르지방', range: [810, 905] },
      { name: '팔데아지방', range: [906, 1025] }
    ];

    for (const region of regions) {
      if (pokemonId >= region.range[0] && pokemonId <= region.range[1]) {
        return region.name;
      }
    }
    return '관동지방';
  }
  
  private assignMultiplicationTable(pokemonId: number): number {
    // 포켓몬 ID를 기반으로 구구단 할당 (2-9단)
    const tables = [2, 3, 4, 5, 6, 7, 8, 9];
    return tables[pokemonId % 8];
  }
  
  private assignRarity(pokemonId: number): 'common' | 'uncommon' | 'rare' | 'legendary' {
    // 전설/환상 포켓몬들
    const legendaries = new Set([
      144, 145, 146, 150, 151, // 1세대
      243, 244, 245, 249, 250, 251, // 2세대
      377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // 3세대
      480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, // 4세대
      494, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649 // 5세대 일부
    ]);
    
    if (legendaries.has(pokemonId)) return 'legendary';
    
    // 희귀도 할당
    const rarityValue = pokemonId % 10;
    if (rarityValue <= 5) return 'common';
    if (rarityValue <= 7) return 'uncommon';
    return 'rare';
  }
  
  private getCharacteristics(pokemonId: number, types: any[]): string[] {
    const characteristics = [];
    
    // 타입 기반 특성 추가
    const typeCharacteristics: {[key: string]: string} = {
      'normal': '평범함', 'fire': '열정적', 'water': '차분함', 'electric': '활발함',
      'grass': '온순함', 'ice': '냉정함', 'fighting': '용감함', 'poison': '신중함',
      'ground': '안정적', 'flying': '자유로움', 'psychic': '신비로움', 'bug': '부지런함',
      'rock': '견고함', 'ghost': '신비함', 'dragon': '강력함', 'dark': '까칠함',
      'steel': '단단함', 'fairy': '귀여움'
    };
    
    for (const type of types) {
      const typeName = type.type.name;
      if (typeCharacteristics[typeName]) {
        characteristics.push(typeCharacteristics[typeName]);
      }
    }
    
    // 기본 특성들로 보완
    const basicCharacteristics = [
      '친근함', '활발함', '온순함', '용감함', '영리함', 
      '재빠름', '강함', '귀여움', '신비로움', '충실함'
    ];
    
    while (characteristics.length < 3) {
      const index: number = (pokemonId + characteristics.length) % basicCharacteristics.length;
      const characteristic: string = basicCharacteristics[index];
      if (!characteristics.includes(characteristic)) {
        characteristics.push(characteristic);
      }
    }
    
    return characteristics.slice(0, 3);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 스크립트 직접 실행 시 크롤링 수행
if (require.main === module) {
  (async () => {
    const crawler = new PokeApiCrawler();
    try {
      const pokemonList = await crawler.crawlAllPokemon();
      console.log('PokeAPI 크롤링 완료!');
      console.log('처음 5마리:', pokemonList.slice(0, 5));
      console.log('마지막 5마리:', pokemonList.slice(-5));
    } catch (error) {
      console.error('PokeAPI 크롤링 실패:', error);
    }
  })();
}