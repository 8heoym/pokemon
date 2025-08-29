import { PokemonCrawler } from './pokemonCrawler';
import * as fs from 'fs/promises';
import * as path from 'path';

// 올바른 포켓몬 한국어 이름 매핑
const correctKoreanNames: { [key: number]: string } = {
  // 1세대 (1-151)
  1: '이상해씨', 2: '이상해풀', 3: '이상해꽃', 4: '파이리', 5: '리자드', 6: '리자몽',
  7: '꼬부기', 8: '어니부기', 9: '거북왕', 10: '캐터피', 11: '단데기', 12: '버터플',
  13: '뿔충이', 14: '딱충이', 15: '독침붕', 16: '구구', 17: '피죤', 18: '피죤투',
  19: '꼬렛', 20: '레트라', 21: '깨비참', 22: '깨비드릴조', 23: '아보', 24: '아보크',
  25: '피카츄', 26: '라이츄', 27: '모래두지', 28: '고지', 29: '니드런♀', 30: '니드리나',
  31: '니드퀸', 32: '니드런♂', 33: '니드리노', 34: '니드킹', 35: '삐삐', 36: '픽시',
  37: '식스테일', 38: '나인테일', 39: '푸린', 40: '푸크린', 41: '주뱃', 42: '골뱃',
  43: '뚜벅쵸', 44: '냄새꼬', 45: '라플레시아', 46: '파라스', 47: '파라섹트', 48: '콘팡',
  49: '도나리', 50: '디그다', 51: '닥트리오', 52: '나옹', 53: '페르시온', 54: '고라파덕',
  55: '골덕', 56: '망키', 57: '성원숭', 58: '가디', 59: '윈디', 60: '발챙이',
  61: '슈륙챙이', 62: '강챙이', 63: '캐이시', 64: '윤겔라', 65: '후딘', 66: '알통몬',
  67: '근육몬', 68: '괴력몬', 69: '모다피', 70: '우츠동', 71: '우츠보트', 72: '왕눈해',
  73: '독파리', 74: '꼬마돌', 75: '데구리', 76: '딱구리', 77: '포니타', 78: '날쌩마',
  79: '야돈', 80: '야도란', 81: '코일', 82: '레어코일', 83: '파오리', 84: '두두',
  85: '두트리오', 86: '쥬쥬', 87: '쥬레곤', 88: '질퍽이', 89: '질뻐기', 90: '셀러',
  91: '파르셀', 92: '고오스', 93: '고우스트', 94: '팬텀', 95: '롱스톤', 96: '슬리프',
  97: '슬리퍼', 98: '크랩', 99: '킹크랩', 100: '찌리리공', 101: '붐볼', 102: '아라리',
  103: '나시', 104: '탕구리', 105: '텅구리', 106: '시라소몬', 107: '홍수몬', 108: '내루미',
  109: '또가스', 110: '또도가스', 111: '뿔카노', 112: '코뿌리', 113: '럭키', 114: '덩쿠리',
  115: '캥카', 116: '쏘드라', 117: '시드라', 118: '콘치', 119: '왕콘치', 120: '별가사리',
  121: '아쿠스타', 122: '마임맨', 123: '스라크', 124: '루주라', 125: '에레브', 126: '마그마',
  127: '쁘사이저', 128: '켄타로스', 129: '잉어킹', 130: '갸라도스', 131: '라프라스', 132: '메타몽',
  133: '이브이', 134: '샤미드', 135: '쥬피썬더', 136: '부스터', 137: '폴리곤', 138: '암나이트',
  139: '암스타', 140: '투구', 141: '투구푸스', 142: '프테라', 143: '잠만보', 144: '프리져',
  145: '썬더', 146: '파이어', 147: '미뇽', 148: '신뇽', 149: '망나뇽', 150: '뮤츠', 151: '뮤',
  
  // 2세대 (152-251) - 주요 포켓몬들
  152: '치코리타', 153: '베이리프', 154: '메가니움', 155: '브케인', 156: '마그케인', 157: '블레이범',
  158: '리아코', 159: '엘리게이', 160: '장크로다일', 161: '꼬리선', 162: '다꼬리', 163: '부우부',
  164: '야부엉', 165: '레디바', 166: '레디안', 167: '페이검', 168: '아리아도스', 169: '크로뱃',
  170: '초라기', 171: '랜턴', 172: '피츄', 173: '삐', 174: '푸푸린', 175: '토게피',
  176: '토게틱', 177: '네이티', 178: '네이티오', 179: '메리프', 180: '보송송', 181: '전룡',
  
  // 3세대 (252-386) - 주요 포켓몬들
  252: '나무지기', 253: '나무돌이', 254: '나무킹', 255: '아차모', 256: '영치코', 257: '번치코',
  258: '물짱이', 259: '늪짱이', 260: '대짱이', 261: '포챠나', 262: '그라에나', 263: '지그제구리',
  264: '직구리', 265: '개무소', 266: '실쿤', 267: '뷰티플라이', 268: '카스쿤', 269: '독케일',
  270: '연꽃몬', 271: '로토스', 272: '로파파', 273: '도토링', 274: '잎새코', 275: '다탱구',
  
  // 4세대 (387-493) - 주요 포켓몬들  
  387: '모부기', 388: '수풀부기', 389: '토대부기', 390: '불꽃숭이', 391: '파이숭이', 392: '초염몽',
  393: '팽도리', 394: '팽태자', 395: '엠페르트', 396: '찌르꼬', 397: '찌르버드', 398: '찌르호크',
  
  // 5세대 (494-649) - 주요 포켓몬들
  494: '비크티니', 495: '주리비얀', 496: '샤비', 497: '샤로다', 498: '뚜꾸리', 499: '차오꿀',
  500: '엠보아', 501: '수댕이', 502: '쌍검자비', 503: '대검귀', 504: '보르쥐', 505: '보르그',
  
  // 6세대 (650-721) - 주요 포켓몬들
  650: '도치마론', 651: '도치보구', 652: '브리가론', 653: '푸호꼬', 654: '테일나', 655: '마폭시',
  656: '개구마르', 657: '개굴반숭', 658: '개굴닌자', 659: '파르빗', 660: '파르토'
};

// 올바른 영어 이름 매핑 (크롤러에서 가져온 것과 동일)
const correctEnglishNames: { [key: number]: string } = {
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
  176: 'Togetic', 177: 'Natu', 178: 'Xatu', 179: 'Mareep', 180: 'Flaaffy', 181: 'Ampharos'
};

async function updatePokemonCache(): Promise<void> {
  try {
    const cacheFilePath = path.join(__dirname, '..', '..', 'cache', 'pokemon_cache.json');
    
    // 기존 캐시 파일 읽기
    let existingData: any[] = [];
    try {
      const existingContent = await fs.readFile(cacheFilePath, 'utf-8');
      existingData = JSON.parse(existingContent);
    } catch (error) {
      console.log('기존 캐시 파일을 찾을 수 없습니다. 새로 생성합니다.');
    }

    console.log('포켓몬 이름 업데이트 시작...');
    
    // 업데이트된 포켓몬 데이터 생성
    const updatedData = existingData.map(pokemon => {
      const correctKorean = correctKoreanNames[pokemon.id];
      const correctEnglish = correctEnglishNames[pokemon.id];
      
      return {
        ...pokemon,
        name: correctEnglish || pokemon.name || `Pokemon${pokemon.id.toString().padStart(3, '0')}`,
        koreanName: correctKorean || pokemon.koreanName || `포켓몬 ${pokemon.id}`
      };
    });

    // 누락된 포켓몬이 있으면 추가
    for (let id = 1; id <= 151; id++) {
      const existing = updatedData.find(p => p.id === id);
      if (!existing) {
        const newPokemon = {
          id,
          name: correctEnglishNames[id] || `Pokemon${id.toString().padStart(3, '0')}`,
          koreanName: correctKoreanNames[id] || `포켓몬 ${id}`,
          imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          region: id <= 151 ? '관동지방' : '성도지방',
          multiplicationTable: 2 + (id % 8),
          rarity: id > 144 && id <= 151 ? 'legendary' : 'common',
          characteristics: ['포켓몬', '친근함', '활발함']
        };
        updatedData.push(newPokemon);
      }
    }

    // ID 순으로 정렬
    updatedData.sort((a, b) => a.id - b.id);

    // 업데이트된 캐시 파일 저장
    await fs.writeFile(cacheFilePath, JSON.stringify(updatedData, null, 2), 'utf-8');
    
    console.log(`총 ${updatedData.length}마리 포켓몬 이름 업데이트 완료`);
    console.log('첫 10마리 포켓몬:');
    updatedData.slice(0, 10).forEach(pokemon => {
      console.log(`ID: ${pokemon.id}, Name: ${pokemon.name}, Korean: ${pokemon.koreanName}`);
    });
    
  } catch (error) {
    console.error('포켓몬 캐시 업데이트 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시 업데이트 수행
if (require.main === module) {
  updatePokemonCache()
    .then(() => {
      console.log('포켓몬 이름 업데이트가 완료되었습니다!');
      process.exit(0);
    })
    .catch(error => {
      console.error('업데이트 실패:', error);
      process.exit(1);
    });
}

export { updatePokemonCache };