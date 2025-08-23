import puppeteer from 'puppeteer';
import { Pokemon } from '../../../shared/types';

export class PokemonCrawler {
  private browser: any = null;
  
  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async crawlAllPokemon(): Promise<Pokemon[]> {
    if (!this.browser) {
      await this.initialize();
    }

    console.log('포켓몬 크롤링 시작...');
    const page = await this.browser.newPage();
    const pokemonList: Pokemon[] = [];
    
    try {
      await page.goto('https://pokemonkorea.co.kr/pokedex', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // 페이지가 로드될 때까지 대기
      await page.waitForSelector('.pokedex-list', { timeout: 10000 });
      
      let previousPokemonCount = 0;
      let pokemonCount = 0;
      let scrollAttempts = 0;
      const maxScrollAttempts = 100;

      while (scrollAttempts < maxScrollAttempts) {
        // 현재 페이지의 포켓몬 개수 확인
        pokemonCount = await page.$$eval('.pokedex-item', items => items.length);
        
        console.log(`현재 로드된 포켓몬: ${pokemonCount}개`);
        
        // 더 이상 새로운 포켓몬이 로드되지 않으면 중단
        if (pokemonCount === previousPokemonCount) {
          console.log('더 이상 로드될 포켓몬이 없습니다.');
          break;
        }
        
        previousPokemonCount = pokemonCount;
        
        // 스크롤 다운
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // 새로운 콘텐츠 로딩 대기
        await page.waitForTimeout(2000);
        scrollAttempts++;
        
        // 목표 개수에 도달하면 중단
        if (pokemonCount >= 1025) {
          console.log('목표 포켓몬 개수에 도달했습니다.');
          break;
        }
      }

      // 모든 포켓몬 정보 추출
      const pokemonData = await page.$$eval('.pokedex-item', (items) => {
        return items.map((item: any) => {
          const numberElement = item.querySelector('.pokemon-number');
          const nameElement = item.querySelector('.pokemon-name');
          const imageElement = item.querySelector('.pokemon-image img');
          
          const number = numberElement ? parseInt(numberElement.textContent?.replace('#', '') || '0') : 0;
          const name = nameElement ? nameElement.textContent?.trim() || '' : '';
          const imageUrl = imageElement ? imageElement.src || '' : '';
          
          return {
            id: number,
            koreanName: name,
            imageUrl: imageUrl
          };
        });
      });

      // 구구단별 지역 및 희귀도 할당
      for (const pokemon of pokemonData) {
        const enrichedPokemon: Pokemon = {
          ...pokemon,
          name: this.getEnglishName(pokemon.id), // 영어 이름 매핑 필요
          region: this.assignRegion(pokemon.id),
          multiplicationTable: this.assignMultiplicationTable(pokemon.id),
          rarity: this.assignRarity(pokemon.id),
          characteristics: this.getCharacteristics(pokemon.id)
        };
        
        pokemonList.push(enrichedPokemon);
      }

      console.log(`총 ${pokemonList.length}마리 포켓몬 크롤링 완료`);
      return pokemonList;

    } catch (error) {
      console.error('포켓몬 크롤링 중 오류 발생:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private assignRegion(pokemonId: number): string {
    // 구구단별 지역 할당 로직
    const regions = [
      { name: '관동지방', tables: [2, 5], range: [1, 151] },
      { name: '성도지방', tables: [3, 6], range: [152, 251] },
      { name: '호연지방', tables: [4, 8], range: [252, 386] },
      { name: '신오지방', tables: [7, 9], range: [387, 493] },
      { name: '하나지방', tables: [1, 0], range: [494, 649] },
      { name: '칼로스지방', tables: [2, 3], range: [650, 721] },
      { name: '알로라지방', tables: [4, 5], range: [722, 809] },
      { name: '가라르지방', tables: [6, 7], range: [810, 905] },
      { name: '팔데아지방', tables: [8, 9], range: [906, 1025] }
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
    const tableMapping = [2, 3, 4, 5, 6, 7, 8, 9];
    return tableMapping[pokemonId % 8];
  }

  private assignRarity(pokemonId: number): 'common' | 'uncommon' | 'rare' | 'legendary' {
    // 전설/환상 포켓몬들
    const legendaries = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386];
    if (legendaries.includes(pokemonId)) return 'legendary';
    
    // 희귀도 랜덤 할당
    const rand = pokemonId % 10;
    if (rand <= 5) return 'common';
    if (rand <= 7) return 'uncommon';
    return 'rare';
  }

  private getEnglishName(pokemonId: number): string {
    // 일부 주요 포켓몬들의 영어 이름 매핑
    const nameMap: { [key: number]: string } = {
      1: 'Bulbasaur', 4: 'Charmander', 7: 'Squirtle', 25: 'Pikachu',
      39: 'Jigglypuff', 52: 'Meowth', 104: 'Cubone', 113: 'Chansey',
      131: 'Lapras', 133: 'Eevee', 150: 'Mewtwo', 151: 'Mew'
    };
    return nameMap[pokemonId] || `Pokemon${pokemonId}`;
  }

  private getCharacteristics(pokemonId: number): string[] {
    // 기본 특성들
    const characteristics = [
      '친근함', '활발함', '온순함', '용감함', '영리함', 
      '재빠름', '강함', '귀여움', '신비로움', '충실함'
    ];
    
    // 포켓몬 ID를 기반으로 2-3개의 특성 선택
    const selectedCharacteristics = [];
    for (let i = 0; i < 3; i++) {
      const index = (pokemonId + i) % characteristics.length;
      selectedCharacteristics.push(characteristics[index]);
    }
    
    return selectedCharacteristics;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 스크립트 직접 실행 시 크롤링 수행
if (require.main === module) {
  (async () => {
    const crawler = new PokemonCrawler();
    try {
      const pokemonList = await crawler.crawlAllPokemon();
      console.log('크롤링 완료!');
      console.log('처음 5마리:', pokemonList.slice(0, 5));
      console.log('마지막 5마리:', pokemonList.slice(-5));
    } catch (error) {
      console.error('크롤링 실패:', error);
    } finally {
      await crawler.close();
    }
  })();
}