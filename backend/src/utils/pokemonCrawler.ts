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
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // 뷰포트 설정
      await page.setViewport({ width: 1920, height: 1080 });
      
      await page.goto('https://pokemonkorea.co.kr/pokedex', { 
        waitUntil: 'networkidle0',
        timeout: 90000 
      });

      console.log('페이지 로드 완료, 포켓몬 요소 찾는 중...');
      
      // 포켓몬 리스트 컨테이너 대기
      await page.waitForSelector('#pokedexlist', { timeout: 30000 });
      console.log('포켓몬 리스트 컨테이너 찾음');
      
      // 포켓몬 카드 셀렉터
      const selector = '#pokedexlist a';
      
      // 첫 번째 포켓몬 카드가 로드될 때까지 대기
      await page.waitForSelector(selector, { timeout: 20000 });
      console.log('포켓몬 카드 요소 찾음');
      
      let previousPokemonCount = 0;
      let pokemonCount = 0;
      let scrollAttempts = 0;
      let consecutiveFailures = 0;
      const maxScrollAttempts = 500; // 증가
      const maxConsecutiveFailures = 15; // 증가

      console.log('스크롤링 시작...');
      
      while (scrollAttempts < maxScrollAttempts && consecutiveFailures < maxConsecutiveFailures) {
        // 현재 페이지의 포켓몬 개수 확인
        pokemonCount = await page.$$(selector).then((items: any[]) => items.length);
        
        console.log(`스크롤 ${scrollAttempts + 1}회 - 로드된 포켓몬: ${pokemonCount}개`);
        
        // 더 이상 새로운 포켓몬이 로드되지 않으면 연속 실패 카운트 증가
        if (pokemonCount === previousPokemonCount) {
          consecutiveFailures++;
          console.log(`연속 실패 ${consecutiveFailures}회`);
          
          // 더 긴 대기 시간으로 재시도
          await page.waitForTimeout(5000);
        } else {
          consecutiveFailures = 0;
          previousPokemonCount = pokemonCount;
        }
        
        // 목표 개수에 도달하면 중단
        if (pokemonCount >= 1025) {
          console.log('목표 포켓몬 개수 1025개에 도달했습니다!');
          break;
        }
        
        // 페이지 끝까지 스크롤
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // 새로운 콘텐츠 로딩 대기
        await page.waitForTimeout(4000);
        scrollAttempts++;
        
        // 25회마다 진행상황 출력
        if (scrollAttempts % 25 === 0) {
          console.log(`진행상황: ${pokemonCount}/1025 (${((pokemonCount/1025)*100).toFixed(1)}%)`);
        }
      }

      console.log(`스크롤링 완료. 총 ${pokemonCount}개 포켓몬 발견`);

      // 모든 포켓몬 정보 추출 - 더 정확한 데이터 추출
      const pokemonData = await page.$$eval(selector, (items: any[]) => {
        return items.map((item: any, index: number) => {
          try {
            // 포켓몬 번호 추출 (No.0001 형식에서)
            let number = 0;
            const textContent = item.textContent || '';
            const numberMatch = textContent.match(/No\.0*(\d+)/);
            if (numberMatch) {
              number = parseInt(numberMatch[1]);
            }
            
            // 번호를 찾지 못하면 인덱스 기반으로 설정
            if (number === 0) {
              number = index + 1;
            }
            
            // 포켓몬 한글 이름 추출
            let koreanName = '';
            const lines = textContent.split('\n').map((line: string) => line.trim()).filter((line: string) => line);
            
            // No.XXXX 다음에 오는 한글 이름 찾기
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('No.') && i + 1 < lines.length) {
                const nextLine = lines[i + 1];
                // 한글이 포함되고 타입명이 아닌 라인을 포켓몬 이름으로 간주
                if (/[가-힣]/.test(nextLine) && !nextLine.includes('타입') && !nextLine.includes('속성') && nextLine.length > 0) {
                  koreanName = nextLine;
                  break;
                }
              }
            }
            
            // 이미지 URL 추출
            let imageUrl = '';
            const imageElement = item.querySelector('img');
            if (imageElement) {
              imageUrl = imageElement.src || imageElement.getAttribute('data-src') || '';
            }
            
            // 특성 정보 추출 (타입 정보 등)
            const characteristics: string[] = [];
            for (const line of lines) {
              if (line.includes('타입') || line.includes('속성')) {
                characteristics.push(line);
              }
            }
            
            return {
              id: number,
              koreanName: koreanName || `포켓몬 ${number}`,
              imageUrl: imageUrl,
              rawText: textContent,
              characteristics: characteristics.length > 0 ? characteristics : ['일반타입']
            };
          } catch (error) {
            console.error(`포켓몬 데이터 추출 오류 (인덱스 ${index}):`, error);
            return {
              id: index + 1,
              koreanName: `포켓몬 ${index + 1}`,
              imageUrl: '',
              rawText: '',
              characteristics: ['일반타입']
            };
          }
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

      // 영문명 매핑 및 구구단별 지역, 희귀도 할당
      for (const pokemon of validPokemon) {
        const enrichedPokemon: Pokemon = {
          id: pokemon.id,
          name: this.getEnglishName(pokemon.id),
          koreanName: pokemon.koreanName,
          imageUrl: pokemon.imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
          region: this.assignRegion(pokemon.id),
          multiplicationTable: this.assignMultiplicationTable(pokemon.id),
          rarity: this.assignRarity(pokemon.id),
          characteristics: this.enhanceCharacteristics(pokemon.id, pokemon.characteristics)
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
    // 포켓몬들의 영어 이름 매핑 (1세대부터 확장)
    const nameMap: { [key: number]: string } = {
      // 1세대 (1-151)
      1: 'Bulbasaur', 2: 'Ivysaur', 3: 'Venusaur', 4: 'Charmander', 5: 'Charmeleon', 6: 'Charizard',
      7: 'Squirtle', 8: 'Wartortle', 9: 'Blastoise', 10: 'Caterpie', 11: 'Metapod', 12: 'Butterfree',
      13: 'Weedle', 14: 'Kakuna', 15: 'Beedrill', 16: 'Pidgey', 17: 'Pidgeotto', 18: 'Pidgeot',
      19: 'Rattata', 20: 'Raticate', 21: 'Spearow', 22: 'Fearow', 23: 'Ekans', 24: 'Arbok',
      25: 'Pikachu', 26: 'Raichu', 27: 'Sandshrew', 28: 'Sandslash', 29: 'Nidoran♀', 30: 'Nidorina',
      31: 'Nidoqueen', 32: 'Nidoran♂', 33: 'Nidorino', 34: 'Nidoking', 35: 'Clefairy', 36: 'Clefable',
      37: 'Vulpix', 38: 'Ninetales', 39: 'Jigglypuff', 40: 'Wigglytuff', 41: 'Zubat', 42: 'Golbat',
      43: 'Oddish', 44: 'Gloom', 45: 'Vileplume', 46: 'Paras', 47: 'Parasect', 48: 'Venonat',
      49: 'Venomoth', 50: 'Diglett', 51: 'Dugtrio', 52: 'Meowth', 53: 'Persian', 54: 'Psyduck',
      55: 'Golduck', 56: 'Mankey', 57: 'Primeape', 58: 'Growlithe', 59: 'Arcanine', 60: 'Poliwag',
      61: 'Poliwhirl', 62: 'Poliwrath', 63: 'Abra', 64: 'Kadabra', 65: 'Alakazam', 66: 'Machop',
      67: 'Machoke', 68: 'Machamp', 69: 'Bellsprout', 70: 'Weepinbell', 71: 'Victreebel', 72: 'Tentacool',
      73: 'Tentacruel', 74: 'Geodude', 75: 'Graveler', 76: 'Golem', 77: 'Ponyta', 78: 'Rapidash',
      79: 'Slowpoke', 80: 'Slowbro', 81: 'Magnemite', 82: 'Magneton', 83: 'Farfetchd', 84: 'Doduo',
      85: 'Dodrio', 86: 'Seel', 87: 'Dewgong', 88: 'Grimer', 89: 'Muk', 90: 'Shellder',
      91: 'Cloyster', 92: 'Gastly', 93: 'Haunter', 94: 'Gengar', 95: 'Onix', 96: 'Drowzee',
      97: 'Hypno', 98: 'Krabby', 99: 'Kingler', 100: 'Voltorb', 101: 'Electrode', 102: 'Exeggcute',
      103: 'Exeggutor', 104: 'Cubone', 105: 'Marowak', 106: 'Hitmonlee', 107: 'Hitmonchan', 108: 'Lickitung',
      109: 'Koffing', 110: 'Weezing', 111: 'Rhyhorn', 112: 'Rhydon', 113: 'Chansey', 114: 'Tangela',
      115: 'Kangaskhan', 116: 'Horsea', 117: 'Seadra', 118: 'Goldeen', 119: 'Seaking', 120: 'Staryu',
      121: 'Starmie', 122: 'Mr. Mime', 123: 'Scyther', 124: 'Jynx', 125: 'Electabuzz', 126: 'Magmar',
      127: 'Pinsir', 128: 'Tauros', 129: 'Magikarp', 130: 'Gyarados', 131: 'Lapras', 132: 'Ditto',
      133: 'Eevee', 134: 'Vaporeon', 135: 'Jolteon', 136: 'Flareon', 137: 'Porygon', 138: 'Omanyte',
      139: 'Omastar', 140: 'Kabuto', 141: 'Kabutops', 142: 'Aerodactyl', 143: 'Snorlax', 144: 'Articuno',
      145: 'Zapdos', 146: 'Moltres', 147: 'Dratini', 148: 'Dragonair', 149: 'Dragonite', 150: 'Mewtwo', 151: 'Mew',
      
      // 2세대 (152-251) - 주요 포켓몬
      152: 'Chikorita', 153: 'Bayleef', 154: 'Meganium', 155: 'Cyndaquil', 156: 'Quilava', 157: 'Typhlosion',
      158: 'Totodile', 159: 'Croconaw', 160: 'Feraligatr', 161: 'Sentret', 162: 'Furret', 163: 'Hoothoot',
      164: 'Noctowl', 165: 'Ledyba', 166: 'Ledian', 167: 'Spinarak', 168: 'Ariados', 169: 'Crobat',
      170: 'Chinchou', 171: 'Lanturn', 172: 'Pichu', 173: 'Cleffa', 174: 'Igglybuff', 175: 'Togepi',
      176: 'Togetic', 177: 'Natu', 178: 'Xatu', 179: 'Mareep', 180: 'Flaaffy', 181: 'Ampharos',
      
      // 3세대 (252-386) - 주요 포켓몬
      252: 'Treecko', 253: 'Grovyle', 254: 'Sceptile', 255: 'Torchic', 256: 'Combusken', 257: 'Blaziken',
      258: 'Mudkip', 259: 'Marshtomp', 260: 'Swampert', 261: 'Poochyena', 262: 'Mightyena', 263: 'Zigzagoon',
      264: 'Linoone', 265: 'Wurmple', 266: 'Silcoon', 267: 'Beautifly', 268: 'Cascoon', 269: 'Dustox',
      270: 'Lotad', 271: 'Lombre', 272: 'Ludicolo', 273: 'Seedot', 274: 'Nuzleaf', 275: 'Shiftry',
      
      // 4세대 (387-493) - 주요 포켓몬
      387: 'Turtwig', 388: 'Grotle', 389: 'Torterra', 390: 'Chimchar', 391: 'Monferno', 392: 'Infernape',
      393: 'Piplup', 394: 'Prinplup', 395: 'Empoleon', 396: 'Starly', 397: 'Staravia', 398: 'Staraptor',
      
      // 5세대 (494-649) - 주요 포켓몬
      494: 'Victini', 495: 'Snivy', 496: 'Servine', 497: 'Serperior', 498: 'Tepig', 499: 'Pignite',
      500: 'Emboar', 501: 'Oshawott', 502: 'Dewott', 503: 'Samurott', 504: 'Patrat', 505: 'Watchog',
      
      // 6세대 (650-721) - 주요 포켓몬
      650: 'Chespin', 651: 'Quilladin', 652: 'Chesnaught', 653: 'Fennekin', 654: 'Braixen', 655: 'Delphox',
      656: 'Froakie', 657: 'Frogadier', 658: 'Greninja', 659: 'Bunnelby', 660: 'Diggersby'
    };
    
    // 매핑에 없는 경우 PokeAPI를 통한 네이밍 컨벤션 적용
    return nameMap[pokemonId] || `Pokemon${pokemonId.toString().padStart(3, '0')}`;
  }

  private enhanceCharacteristics(pokemonId: number, rawCharacteristics: string[]): string[] {
    // 기본 특성 향상
    const enhanced = [...rawCharacteristics];
    
    // 포켓몬별 특별 특성 추가
    const specialCharacteristics: { [key: number]: string[] } = {
      1: ['씨앗포켓몬', '온순함', '풀타입'],
      4: ['도마뱀포켓몬', '용감함', '불타입'],
      7: ['거북포켓몬', '신중함', '물타입'],
      25: ['전기쥐포켓몬', '활발함', '전기타입'],
      133: ['진화포켓몬', '적응력', '일반타입'],
      150: ['유전자포켓몬', '강력함', '에스퍼타입']
    };
    
    if (specialCharacteristics[pokemonId]) {
      return specialCharacteristics[pokemonId];
    }
    
    // 기본 특성이 비어있거나 부족한 경우 기본값 추가
    if (enhanced.length === 0 || enhanced.every(c => c === '일반타입')) {
      enhanced.push(this.getTypeByGeneration(pokemonId));
      enhanced.push('포켓몬');
    }
    
    return enhanced.slice(0, 3); // 최대 3개까지만
  }

  private getTypeByGeneration(pokemonId: number): string {
    if (pokemonId <= 151) return '1세대';
    if (pokemonId <= 251) return '2세대';
    if (pokemonId <= 386) return '3세대';
    if (pokemonId <= 493) return '4세대';
    if (pokemonId <= 649) return '5세대';
    if (pokemonId <= 721) return '6세대';
    if (pokemonId <= 809) return '7세대';
    if (pokemonId <= 905) return '8세대';
    return '9세대';
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