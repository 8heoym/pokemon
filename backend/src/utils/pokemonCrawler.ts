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
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto('https://pokemonkorea.co.kr/pokedex', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      console.log('페이지 로드 완료, 포켓몬 요소 찾는 중...');
      
      // 포켓몬 리스트 컨테이너 대기
      await page.waitForSelector('#pokedexlist', { timeout: 15000 });
      console.log('포켓몬 리스트 컨테이너 찾음');
      
      // 포켓몬 카드 셀렉터
      const selector = '#pokedexlist a';
      
      // 첫 번째 포켓몬 카드가 로드될 때까지 대기
      await page.waitForSelector(selector, { timeout: 10000 });
      console.log('포켓몬 카드 요소 찾음');
      
      let previousPokemonCount = 0;
      let pokemonCount = 0;
      let scrollAttempts = 0;
      let consecutiveFailures = 0;
      const maxScrollAttempts = 200;
      const maxConsecutiveFailures = 10;

      console.log('스크롤링 시작...');
      
      while (scrollAttempts < maxScrollAttempts && consecutiveFailures < maxConsecutiveFailures) {
        // 현재 페이지의 포켓몬 개수 확인
        pokemonCount = await page.$$(selector).then((items: any[]) => items.length);
        
        console.log(`스크롤 ${scrollAttempts + 1}회 - 로드된 포켓몬: ${pokemonCount}개`);
        
        // 더 이상 새로운 포켓몬이 로드되지 않으면 연속 실패 카운트 증가
        if (pokemonCount === previousPokemonCount) {
          consecutiveFailures++;
          console.log(`연속 실패 ${consecutiveFailures}회`);
        } else {
          consecutiveFailures = 0;
          previousPokemonCount = pokemonCount;
        }
        
        // 목표 개수에 도달하면 중단
        if (pokemonCount >= 1025) {
          console.log('목표 포켓몬 개수 1025개에 도달했습니다!');
          break;
        }
        
        // 스크롤 다운 (더 부드러운 스크롤)
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
        
        // 새로운 콘텐츠 로딩 대기 (조금 더 길게)
        await page.waitForTimeout(3000);
        scrollAttempts++;
        
        // 50회마다 진행상황 출력
        if (scrollAttempts % 50 === 0) {
          console.log(`진행상황: ${pokemonCount}/1025 (${((pokemonCount/1025)*100).toFixed(1)}%)`);
        }
      }

      console.log(`스크롤링 완료. 총 ${pokemonCount}개 포켓몬 발견`);

      // 모든 포켓몬 정보 추출
      const pokemonData = await page.$$eval(selector, (items: any[]) => {
        return items.map((item: any, index: number) => {
          // 포켓몬 번호 추출 (No.0001 형식에서)
          let number = 0;
          const textContent = item.textContent || '';
          const numberMatch = textContent.match(/No\.(\d+)/);
          if (numberMatch) {
            number = parseInt(numberMatch[1]);
          }
          
          // 번호를 찾지 못하면 인덱스 기반으로 설정
          if (number === 0) {
            number = index + 1;
          }
          
          // 포켓몬 이름 추출 (No.XXXX 다음 줄에서)
          let name = '';
          const lines = textContent.split('\n').map((line: string) => line.trim()).filter((line: string) => line);
          
          // No.XXXX 다음에 오는 한글 이름 찾기
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('No.') && i + 1 < lines.length) {
              const nextLine = lines[i + 1];
              // 한글이 포함된 라인이면 포켓몬 이름으로 간주
              if (/[가-힣]/.test(nextLine) && !nextLine.includes('타입')) {
                name = nextLine;
                break;
              }
            }
          }
          
          // 이미지 URL 추출
          let imageUrl = '';
          const imageElement = item.querySelector('img');
          if (imageElement && imageElement.src) {
            imageUrl = imageElement.src;
          }
          
          return {
            id: number,
            koreanName: name || `포켓몬 ${number}`,
            imageUrl: imageUrl
          };
        });
      });

      console.log(`원시 데이터 수집 완료: ${pokemonData.length}개`);
      
      // 중복 제거 및 유효성 검사
      const validPokemon = pokemonData
        .filter((pokemon: any) => pokemon.id > 0 && pokemon.id <= 1025)
        .reduce((acc: any[], current: any) => {
          const existing = acc.find((p: any) => p.id === current.id);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, [] as any[]);
      
      console.log(`유효한 포켓몬 데이터: ${validPokemon.length}개`);

      // 구구단별 지역 및 희귀도 할당
      for (const pokemon of validPokemon) {
        const enrichedPokemon: Pokemon = {
          ...pokemon,
          name: this.getEnglishName(pokemon.id),
          region: this.assignRegion(pokemon.id),
          multiplicationTable: this.assignMultiplicationTable(pokemon.id),
          rarity: this.assignRarity(pokemon.id),
          characteristics: this.getCharacteristics(pokemon.id)
        };
        
        pokemonList.push(enrichedPokemon);
      }

      // ID 순으로 정렬
      pokemonList.sort((a, b) => a.id - b.id);

      console.log(`총 ${pokemonList.length}마리 포켓몬 크롤링 완료`);
      console.log(`포켓몬 ID 범위: ${pokemonList[0]?.id} ~ ${pokemonList[pokemonList.length-1]?.id}`);
      
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