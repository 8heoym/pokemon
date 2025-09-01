import axios from 'axios';

// 올바른 포켓몬 이름 매핑 (확장된 버전)
const correctPokemonNames: { [key: number]: { name: string; korean_name: string } } = {
  // 1세대 (1-151)
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
  80: { name: 'Slowbro', korean_name: '야도란' },
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
  132: { name: 'Ditto', korean_name: '메타몽' },
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

  // 2세대 (152-251)
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
  182: { name: 'Bellossom', korean_name: '아르코' },
  183: { name: 'Marill', korean_name: '마릴' },
  184: { name: 'Azumarill', korean_name: '마릴리' },
  185: { name: 'Sudowoodo', korean_name: '꼬지모' },
  186: { name: 'Politoed', korean_name: '왕구리' },
  187: { name: 'Hoppip', korean_name: '통통코' },
  188: { name: 'Skiploom', korean_name: '두리코' },
  189: { name: 'Jumpluff', korean_name: '솜솜코' },
  190: { name: 'Aipom', korean_name: '에이팜' },
  191: { name: 'Sunkern', korean_name: '해너츠' },
  192: { name: 'Sunflora', korean_name: '해루미' },
  193: { name: 'Yanma', korean_name: '왕자리' },
  194: { name: 'Wooper', korean_name: '우파' },
  195: { name: 'Quagsire', korean_name: '누오' },
  196: { name: 'Espeon', korean_name: '에브이' },
  197: { name: 'Umbreon', korean_name: '블래키' },
  198: { name: 'Murkrow', korean_name: '니로우' },
  199: { name: 'Slowking', korean_name: '야도킹' },
  200: { name: 'Misdreavus', korean_name: '무우마' },
  201: { name: 'Unown', korean_name: '안농' },
  202: { name: 'Wobbuffet', korean_name: '마자용' },
  203: { name: 'Girafarig', korean_name: '키링키' },
  204: { name: 'Pineco', korean_name: '피콘' },
  205: { name: 'Forretress', korean_name: '쏘콘' },
  206: { name: 'Dunsparce', korean_name: '노고치' },
  207: { name: 'Gligar', korean_name: '글라이거' },
  208: { name: 'Steelix', korean_name: '강철톤' },
  209: { name: 'Snubbull', korean_name: '블루' },
  210: { name: 'Granbull', korean_name: '그랑불' },
  211: { name: 'Qwilfish', korean_name: '침바루' },
  212: { name: 'Scizor', korean_name: '핫삼' },
  213: { name: 'Shuckle', korean_name: '단단지' },
  214: { name: 'Heracross', korean_name: '헤라크로스' },
  215: { name: 'Sneasel', korean_name: '포푸니' },
  216: { name: 'Teddiursa', korean_name: '깜지곰' },
  217: { name: 'Ursaring', korean_name: '링곰' },
  218: { name: 'Slugma', korean_name: '마그마그' },
  219: { name: 'Magcargo', korean_name: '마그카르고' },
  220: { name: 'Swinub', korean_name: '꾸꾸리' },
  221: { name: 'Piloswine', korean_name: '메꾸리' },
  222: { name: 'Corsola', korean_name: '코산호' },
  223: { name: 'Remoraid', korean_name: '총어' },
  224: { name: 'Octillery', korean_name: '대포무노' },
  225: { name: 'Delibird', korean_name: '딜리버드' },
  226: { name: 'Mantine', korean_name: '만타인' },
  227: { name: 'Skarmory', korean_name: '무장조' },
  228: { name: 'Houndour', korean_name: '델빌' },
  229: { name: 'Houndoom', korean_name: '헬가' },
  230: { name: 'Kingdra', korean_name: '킹드라' },
  231: { name: 'Phanpy', korean_name: '코코리' },
  232: { name: 'Donphan', korean_name: '코리갑' },
  233: { name: 'Porygon2', korean_name: '폴리곤2' },
  234: { name: 'Stantler', korean_name: '노라키' },
  235: { name: 'Smeargle', korean_name: '루브도' },
  236: { name: 'Tyrogue', korean_name: '배루키' },
  237: { name: 'Hitmontop', korean_name: '카포에라' },
  238: { name: 'Smoochum', korean_name: '뽀뽀라' },
  239: { name: 'Elekid', korean_name: '에레키드' },
  240: { name: 'Magby', korean_name: '마그비' },
  241: { name: 'Miltank', korean_name: '밀탱크' },
  242: { name: 'Blissey', korean_name: '해피너스' },
  243: { name: 'Raikou', korean_name: '라이코' },
  244: { name: 'Entei', korean_name: '앤테이' },
  245: { name: 'Suicune', korean_name: '스이쿤' },
  246: { name: 'Larvitar', korean_name: '애버라스' },
  247: { name: 'Pupitar', korean_name: '데기라스' },
  248: { name: 'Tyranitar', korean_name: '마기라스' },
  249: { name: 'Lugia', korean_name: '루기아' },
  250: { name: 'Ho-Oh', korean_name: '칠색조' },
  251: { name: 'Celebi', korean_name: '세레비' },

  // 3세대 (252-386) - 주요 포켓몬들
  252: { name: 'Treecko', korean_name: '나무지기' },
  253: { name: 'Grovyle', korean_name: '나무돌이' },
  254: { name: 'Sceptile', korean_name: '나무킹' },
  255: { name: 'Torchic', korean_name: '아차모' },
  256: { name: 'Combusken', korean_name: '영치코' },
  257: { name: 'Blaziken', korean_name: '번치코' },
  258: { name: 'Mudkip', korean_name: '물짱이' },
  259: { name: 'Marshtomp', korean_name: '늪짱이' },
  260: { name: 'Swampert', korean_name: '대짱이' },
  261: { name: 'Poochyena', korean_name: '포챠나' },
  262: { name: 'Mightyena', korean_name: '그라에나' },
  263: { name: 'Zigzagoon', korean_name: '지그제구리' },
  264: { name: 'Linoone', korean_name: '직구리' },
  265: { name: 'Wurmple', korean_name: '개무소' },
  266: { name: 'Silcoon', korean_name: '실쿤' },
  267: { name: 'Beautifly', korean_name: '뷰티플라이' },
  268: { name: 'Cascoon', korean_name: '카스쿤' },
  269: { name: 'Dustox', korean_name: '독케일' },
  270: { name: 'Lotad', korean_name: '연꽃몬' },
  271: { name: 'Lombre', korean_name: '로토스' },
  272: { name: 'Ludicolo', korean_name: '로파파' },
  273: { name: 'Seedot', korean_name: '도토링' },
  274: { name: 'Nuzleaf', korean_name: '잎새코' },
  275: { name: 'Shiftry', korean_name: '다탱구' }
};

interface PokemonData {
  id: number;
  name: string;
  koreanName: string;
}

async function checkAllPokemonNames(): Promise<void> {
  try {
    console.log('전체 포켓몬 이름 검증 시작...');
    
    const incorrectPokemon: Array<{
      id: number;
      currentName: string;
      currentKoreanName: string;
      correctName: string;
      correctKoreanName: string;
      issue: string[];
    }> = [];
    
    // 1부터 842까지 모든 포켓몬 조회
    for (let id = 1; id <= 842; id++) {
      try {
        const response = await axios.get(`http://localhost:3001/api/pokemon/${id}`, { timeout: 5000 });
        const pokemon: PokemonData = response.data;
        
        const correctData = correctPokemonNames[id];
        
        if (correctData) {
          const issues: string[] = [];
          
          // 영어 이름 검증
          if (pokemon.name !== correctData.name) {
            issues.push(`name: "${pokemon.name}" → "${correctData.name}"`);
          }
          
          // 한국어 이름 검증
          if (pokemon.koreanName !== correctData.korean_name) {
            issues.push(`korean_name: "${pokemon.koreanName}" → "${correctData.korean_name}"`);
          }
          
          if (issues.length > 0) {
            incorrectPokemon.push({
              id: pokemon.id,
              currentName: pokemon.name,
              currentKoreanName: pokemon.koreanName,
              correctName: correctData.name,
              correctKoreanName: correctData.korean_name,
              issue: issues
            });
          }
        } else {
          // 매핑 데이터가 없는 경우 (Pokemon001 형태인지 확인)
          if (pokemon.name.startsWith('Pokemon') || pokemon.koreanName.startsWith('포켓몬')) {
            incorrectPokemon.push({
              id: pokemon.id,
              currentName: pokemon.name,
              currentKoreanName: pokemon.koreanName,
              correctName: `[매핑 필요] Pokemon${id}`,
              correctKoreanName: `[매핑 필요] 포켓몬${id}`,
              issue: ['매핑 데이터 없음']
            });
          }
        }
        
        if (id % 100 === 0) {
          console.log(`진행상황: ${id}/842 (${((id/842)*100).toFixed(1)}%)`);
        }
        
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log(`포켓몬 ID ${id}: 존재하지 않음`);
        } else {
          console.error(`포켓몬 ID ${id} 조회 실패:`, error.message);
        }
      }
      
      // API 부하를 줄이기 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log('\n=== 포켓몬 이름 검증 결과 ===');
    console.log(`총 검사한 포켓몬: 842마리`);
    console.log(`올바르지 않은 포켓몬: ${incorrectPokemon.length}마리`);
    
    if (incorrectPokemon.length > 0) {
      console.log('\n=== 수정이 필요한 포켓몬 목록 ===');
      incorrectPokemon.slice(0, 20).forEach(pokemon => {
        console.log(`ID ${pokemon.id}: ${pokemon.issue.join(', ')}`);
      });
      
      if (incorrectPokemon.length > 20) {
        console.log(`... 및 ${incorrectPokemon.length - 20}마리 추가`);
      }
      
      // 문제가 있는 포켓몬들을 파일로 저장
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const reportPath = path.join(__dirname, '..', '..', 'incorrect_pokemon_report.json');
      await fs.writeFile(reportPath, JSON.stringify(incorrectPokemon, null, 2), 'utf-8');
      console.log(`\n상세 보고서가 저장되었습니다: ${reportPath}`);
    } else {
      console.log('✅ 모든 포켓몬 이름이 올바릅니다!');
    }
    
  } catch (error) {
    console.error('포켓몬 이름 검증 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시 검증 수행
if (require.main === module) {
  checkAllPokemonNames()
    .then(() => {
      console.log('포켓몬 이름 검증이 완료되었습니다!');
      process.exit(0);
    })
    .catch(error => {
      console.error('검증 실패:', error);
      process.exit(1);
    });
}

export { checkAllPokemonNames, correctPokemonNames };