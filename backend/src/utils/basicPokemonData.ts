// 기본 포켓몬 데이터 (100마리)
export const basicPokemonData = [
  // 1세대 포켓몬
  { id: 1, name: 'Bulbasaur', korean_name: '이상해씨', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', region: '관동지방', multiplication_table: 2, rarity: 'common', characteristics: ['온순함', '풀타입', '씨앗포켓몬'] },
  { id: 2, name: 'Ivysaur', korean_name: '이상해풀', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png', region: '관동지방', multiplication_table: 2, rarity: 'uncommon', characteristics: ['성장', '풀타입', '씨앗포켓몬'] },
  { id: 3, name: 'Venusaur', korean_name: '이상해꽃', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png', region: '관동지방', multiplication_table: 7, rarity: 'rare', characteristics: ['성숙함', '풀타입', '씨앗포켓몬'] },
  { id: 4, name: 'Charmander', korean_name: '파이리', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['용감함', '불타입', '도마뱀포켓몬'] },
  { id: 5, name: 'Charmeleon', korean_name: '리자드', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png', region: '관동지방', multiplication_table: 3, rarity: 'uncommon', characteristics: ['거친', '불타입', '화염포켓몬'] },
  { id: 6, name: 'Charizard', korean_name: '리자몽', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', region: '관동지방', multiplication_table: 9, rarity: 'rare', characteristics: ['강력함', '불타입', '화염포켓몬'] },
  { id: 7, name: 'Squirtle', korean_name: '꼬부기', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', region: '관동지방', multiplication_table: 4, rarity: 'common', characteristics: ['신중함', '물타입', '거북포켓몬'] },
  { id: 8, name: 'Wartortle', korean_name: '어니부기', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png', region: '관동지방', multiplication_table: 4, rarity: 'uncommon', characteristics: ['성장', '물타입', '거북포켓몬'] },
  { id: 9, name: 'Blastoise', korean_name: '거북왕', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['침착함', '물타입', '조개포켓몬'] },
  { id: 10, name: 'Caterpie', korean_name: '캐터피', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png', region: '관동지방', multiplication_table: 2, rarity: 'common', characteristics: ['순수함', '벌레타입', '애벌레포켓몬'] },
  
  // 인기 포켓몬들
  { id: 25, name: 'Pikachu', korean_name: '피카츄', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', region: '관동지방', multiplication_table: 2, rarity: 'uncommon', characteristics: ['활발함', '친근함', '전기타입'] },
  { id: 26, name: 'Raichu', korean_name: '라이츄', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png', region: '관동지방', multiplication_table: 5, rarity: 'rare', characteristics: ['강력함', '전기타입', '쥐포켓몬'] },
  { id: 39, name: 'Jigglypuff', korean_name: '푸린', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', region: '관동지방', multiplication_table: 5, rarity: 'common', characteristics: ['귀여움', '노래솜씨', '풍선포켓몬'] },
  { id: 52, name: 'Meowth', korean_name: '나옹', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png', region: '관동지방', multiplication_table: 6, rarity: 'common', characteristics: ['교활함', '고양이포켓몬', '장난기'] },
  { id: 54, name: 'Psyduck', korean_name: '고라파덕', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png', region: '관동지방', multiplication_table: 6, rarity: 'common', characteristics: ['멍함', '물타입', '오리포켓몬'] },
  
  // 중급 포켓몬들
  { id: 94, name: 'Gengar', korean_name: '팬텀', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['장난기', '고스트타입', '그림자포켓몬'] },
  { id: 104, name: 'Cubone', korean_name: '탕구리', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png', region: '관동지방', multiplication_table: 7, rarity: 'uncommon', characteristics: ['외로움', '땅타입', '외톨이포켓몬'] },
  { id: 113, name: 'Chansey', korean_name: '럭키', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/113.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['친절함', '알포켓몬', '치유력'] },
  { id: 131, name: 'Lapras', korean_name: '라프라스', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png', region: '관동지방', multiplication_table: 9, rarity: 'rare', characteristics: ['온화함', '운송포켓몬', '물타입'] },
  { id: 133, name: 'Eevee', korean_name: '이브이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', region: '관동지방', multiplication_table: 2, rarity: 'rare', characteristics: ['진화능력', '유전자불안정', '진화포켓몬'] },
  
  // 전설 포켓몬
  { id: 144, name: 'Articuno', korean_name: '프리져', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png', region: '관동지방', multiplication_table: 9, rarity: 'legendary', characteristics: ['냉정함', '얼음타입', '냉동포켓몬'] },
  { id: 145, name: 'Zapdos', korean_name: '썬더', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png', region: '관동지방', multiplication_table: 9, rarity: 'legendary', characteristics: ['전격', '전기타입', '전기포켓몬'] },
  { id: 146, name: 'Moltres', korean_name: '파이어', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png', region: '관동지방', multiplication_table: 9, rarity: 'legendary', characteristics: ['화염', '불타입', '화염포켓몬'] },
  { id: 150, name: 'Mewtwo', korean_name: '뮤츠', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', region: '관동지방', multiplication_table: 9, rarity: 'legendary', characteristics: ['강력함', '에스퍼타입', '유전자포켓몬'] },
  { id: 151, name: 'Mew', korean_name: '뮤', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png', region: '관동지방', multiplication_table: 9, rarity: 'legendary', characteristics: ['신비로움', '원조포켓몬', '환상포켓몬'] },
  
  // 2세대 포켓몬들
  { id: 152, name: 'Chikorita', korean_name: '치코리타', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png', region: '성도지방', multiplication_table: 3, rarity: 'common', characteristics: ['온순함', '풀타입', '잎사귀포켓몬'] },
  { id: 155, name: 'Cyndaquil', korean_name: '브케인', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png', region: '성도지방', multiplication_table: 3, rarity: 'common', characteristics: ['소극적', '불타입', '불쥐포켓몬'] },
  { id: 158, name: 'Totodile', korean_name: '리아코', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png', region: '성도지방', multiplication_table: 4, rarity: 'common', characteristics: ['활발함', '물타입', '큰턱포켓몬'] },
  
  // 3세대 포켓몬들  
  { id: 252, name: 'Treecko', korean_name: '나무지기', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/252.png', region: '호연지방', multiplication_table: 4, rarity: 'common', characteristics: ['침착함', '풀타입', '나무도마뱀포켓몬'] },
  { id: 255, name: 'Torchic', korean_name: '아차모', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/255.png', region: '호연지방', multiplication_table: 5, rarity: 'common', characteristics: ['활발함', '불타입', '병아리포켓몬'] },
  { id: 258, name: 'Mudkip', korean_name: '물짱이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png', region: '호연지방', multiplication_table: 5, rarity: 'common', characteristics: ['순수함', '물타입', '물고기포켓몬'] },
  
  // 4세대 포켓몬들
  { id: 387, name: 'Turtwig', korean_name: '모부기', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/387.png', region: '신오지방', multiplication_table: 7, rarity: 'common', characteristics: ['성실함', '풀타입', '꼬마거북포켓몬'] },
  { id: 390, name: 'Chimchar', korean_name: '불꽃숭이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/390.png', region: '신오지방', multiplication_table: 7, rarity: 'common', characteristics: ['장난기', '불타입', '꼬마원숭이포켓몬'] },
  { id: 393, name: 'Piplup', korean_name: '팽도리', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/393.png', region: '신오지방', multiplication_table: 8, rarity: 'common', characteristics: ['자존심', '물타입', '펭귄포켓몬'] },
  
  // 5세대 포켓몬들
  { id: 495, name: 'Snivy', korean_name: '주리비얀', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/495.png', region: '하나지방', multiplication_table: 2, rarity: 'common', characteristics: ['냉정함', '풀타입', '풀뱀포켓몬'] },
  { id: 498, name: 'Tepig', korean_name: '뚜꾸리', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/498.png', region: '하나지방', multiplication_table: 6, rarity: 'common', characteristics: ['활발함', '불타입', '불돼지포켓몬'] },
  { id: 501, name: 'Oshawott', korean_name: '수댕이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/501.png', region: '하나지방', multiplication_table: 6, rarity: 'common', characteristics: ['용감함', '물타입', '바다수달포켓몬'] },
  
  // 6세대 포켓몬들
  { id: 650, name: 'Chespin', korean_name: '도치마론', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/650.png', region: '칼로스지방', multiplication_table: 2, rarity: 'common', characteristics: ['호기심', '풀타입', '밤송이포켓몬'] },
  { id: 653, name: 'Fennekin', korean_name: '푸호꼬', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/653.png', region: '칼로스지방', multiplication_table: 3, rarity: 'common', characteristics: ['우아함', '불타입', '여우포켓몬'] },
  { id: 656, name: 'Froakie', korean_name: '개구마르', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/656.png', region: '칼로스지방', multiplication_table: 3, rarity: 'common', characteristics: ['민첩함', '물타입', '거품개구리포켓몬'] },
  
  // 7세대 포켓몬들
  { id: 722, name: 'Rowlet', korean_name: '나몰빼미', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/722.png', region: '알로라지방', multiplication_table: 4, rarity: 'common', characteristics: ['조용함', '풀타입', '풀깃포켓몬'] },
  { id: 725, name: 'Litten', korean_name: '냐오불', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/725.png', region: '알로라지방', multiplication_table: 5, rarity: 'common', characteristics: ['쿨함', '불타입', '불고양이포켓몬'] },
  { id: 728, name: 'Popplio', korean_name: '누리공', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/728.png', region: '알로라지방', multiplication_table: 5, rarity: 'common', characteristics: ['쾌활함', '물타입', '바다사자포켓몬'] },
  
  // 8세대 포켓몬들
  { id: 810, name: 'Grookey', korean_name: '흥나숭', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/810.png', region: '가라르지방', multiplication_table: 6, rarity: 'common', characteristics: ['활발함', '풀타입', '치팬지포켓몬'] },
  { id: 813, name: 'Scorbunny', korean_name: '염버니', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/813.png', region: '가라르지방', multiplication_table: 7, rarity: 'common', characteristics: ['활기참', '불타입', '토끼포켓몬'] },
  { id: 816, name: 'Sobble', korean_name: '울머기', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/816.png', region: '가라르지방', multiplication_table: 7, rarity: 'common', characteristics: ['소심함', '물타입', '물도마뱀포켓몬'] },
  
  // 9세대 포켓몬들
  { id: 906, name: 'Sprigatito', korean_name: '나오하', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/906.png', region: '팔데아지방', multiplication_table: 8, rarity: 'common', characteristics: ['자유로움', '풀타입', '풀고양이포켓몬'] },
  { id: 909, name: 'Fuecoco', korean_name: '뜨아거', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/909.png', region: '팔데아지방', multiplication_table: 9, rarity: 'common', characteristics: ['여유로움', '불타입', '불악어포켓몬'] },
  { id: 912, name: 'Quaxly', korean_name: '꽥쭈', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/912.png', region: '팔데아지방', multiplication_table: 9, rarity: 'common', characteristics: ['깔끔함', '물타입', '오리포켓몬'] },

  // 추가 포켓몬들 (50마리 더)
  { id: 11, name: 'Metapod', korean_name: '단데기', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/11.png', region: '관동지방', multiplication_table: 2, rarity: 'common', characteristics: ['인내', '벌레타입', '번데기포켓몬'] },
  { id: 12, name: 'Butterfree', korean_name: '버터플', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/12.png', region: '관동지방', multiplication_table: 3, rarity: 'uncommon', characteristics: ['우아함', '벌레타입', '나비포켓몬'] },
  { id: 13, name: 'Weedle', korean_name: '뿔충이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/13.png', region: '관동지방', multiplication_table: 2, rarity: 'common', characteristics: ['경계심', '벌레타입', '털벌레포켓몬'] },
  { id: 14, name: 'Kakuna', korean_name: '딱충이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/14.png', region: '관동지방', multiplication_table: 2, rarity: 'common', characteristics: ['굳건함', '벌레타입', '번데기포켓몬'] },
  { id: 15, name: 'Beedrill', korean_name: '독침붕', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/15.png', region: '관동지방', multiplication_table: 4, rarity: 'uncommon', characteristics: ['공격적', '벌레타입', '독벌포켓몬'] },
  
  { id: 16, name: 'Pidgey', korean_name: '구구', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png', region: '관동지방', multiplication_table: 2, rarity: 'common', characteristics: ['순수함', '비행타입', '아기새포켓몬'] },
  { id: 17, name: 'Pidgeotto', korean_name: '피죤투', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/17.png', region: '관동지방', multiplication_table: 3, rarity: 'uncommon', characteristics: ['영리함', '비행타입', '새포켓몬'] },
  { id: 18, name: 'Pidgeot', korean_name: '피죤투', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png', region: '관동지방', multiplication_table: 5, rarity: 'rare', characteristics: ['위풍당당', '비행타입', '새포켓몬'] },
  
  { id: 19, name: 'Rattata', korean_name: '꼬렛', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png', region: '관동지방', multiplication_table: 2, rarity: 'common', characteristics: ['재빠름', '일반타입', '쥐포켓몬'] },
  { id: 20, name: 'Raticate', korean_name: '레트라', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/20.png', region: '관동지방', multiplication_table: 4, rarity: 'uncommon', characteristics: ['공격성', '일반타입', '쥐포켓몬'] },
  
  { id: 21, name: 'Spearow', korean_name: '깨비참', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/21.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['까칠함', '비행타입', '아기새포켓몬'] },
  { id: 22, name: 'Fearow', korean_name: '깨비드릴조', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/22.png', region: '관동지방', multiplication_table: 6, rarity: 'uncommon', characteristics: ['날카로움', '비행타입', '부리포켓몬'] },
  
  { id: 23, name: 'Ekans', korean_name: '아보', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/23.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['교활함', '독타입', '뱀포켓몬'] },
  { id: 24, name: 'Arbok', korean_name: '아보크', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/24.png', region: '관동지방', multiplication_table: 6, rarity: 'uncommon', characteristics: ['위협적', '독타입', '코브라포켓몬'] },
  
  { id: 27, name: 'Sandshrew', korean_name: '모래두지', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/27.png', region: '관동지방', multiplication_table: 4, rarity: 'common', characteristics: ['방어적', '땅타입', '쥐포켓몬'] },
  { id: 28, name: 'Sandslash', korean_name: '고지', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/28.png', region: '관동지방', multiplication_table: 7, rarity: 'uncommon', characteristics: ['날카로움', '땅타입', '쥐포켓몬'] },
  
  { id: 29, name: 'Nidoran♀', korean_name: '니드런♀', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/29.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['온순함', '독타입', '독침포켓몬'] },
  { id: 30, name: 'Nidorina', korean_name: '니드리나', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/30.png', region: '관동지방', multiplication_table: 5, rarity: 'uncommon', characteristics: ['보호본능', '독타입', '독침포켓몬'] },
  { id: 31, name: 'Nidoqueen', korean_name: '니드퀸', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/31.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['모성애', '독타입', '드릴포켓몬'] },
  
  { id: 32, name: 'Nidoran♂', korean_name: '니드런♂', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/32.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['활발함', '독타입', '독침포켓몬'] },
  { id: 33, name: 'Nidorino', korean_name: '니드리노', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/33.png', region: '관동지방', multiplication_table: 5, rarity: 'uncommon', characteristics: ['공격성', '독타입', '독침포켓몬'] },
  { id: 34, name: 'Nidoking', korean_name: '니드킹', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/34.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['강력함', '독타입', '드릴포켓몬'] },
  
  { id: 35, name: 'Clefairy', korean_name: '삐삐', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png', region: '관동지방', multiplication_table: 4, rarity: 'uncommon', characteristics: ['귀여움', '페어리타입', '요정포켓몬'] },
  { id: 36, name: 'Clefable', korean_name: '픽시', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/36.png', region: '관동지방', multiplication_table: 7, rarity: 'rare', characteristics: ['신비로움', '페어리타입', '요정포켓몬'] },
  
  { id: 37, name: 'Vulpix', korean_name: '식스테일', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png', region: '관동지방', multiplication_table: 4, rarity: 'uncommon', characteristics: ['우아함', '불타입', '여우포켓몬'] },
  { id: 38, name: 'Ninetales', korean_name: '나인테일', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['신비로움', '불타입', '여우포켓몬'] },
  
  { id: 40, name: 'Wigglytuff', korean_name: '푸크린', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/40.png', region: '관동지방', multiplication_table: 6, rarity: 'uncommon', characteristics: ['부드러움', '페어리타입', '풍선포켓몬'] },
  
  { id: 41, name: 'Zubat', korean_name: '주뱃', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/41.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['야행성', '독타입', '박쥐포켓몬'] },
  { id: 42, name: 'Golbat', korean_name: '골뱃', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/42.png', region: '관동지방', multiplication_table: 6, rarity: 'uncommon', characteristics: ['혈액애호', '독타입', '박쥐포켓몬'] },
  
  { id: 43, name: 'Oddish', korean_name: '뚜벅쵸', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/43.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['순수함', '풀타입', '잡초포켓몬'] },
  { id: 44, name: 'Gloom', korean_name: '냄새꼬', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/44.png', region: '관동지방', multiplication_table: 5, rarity: 'uncommon', characteristics: ['악취', '풀타입', '잡초포켓몬'] },
  { id: 45, name: 'Vileplume', korean_name: '라플레시아', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/45.png', region: '관동지방', multiplication_table: 7, rarity: 'rare', characteristics: ['독성', '풀타입', '꽃포켓몬'] },
  
  { id: 46, name: 'Paras', korean_name: '파라스', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/46.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['기생', '벌레타입', '버섯포켓몬'] },
  { id: 47, name: 'Parasect', korean_name: '파라섹트', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/47.png', region: '관동지방', multiplication_table: 6, rarity: 'uncommon', characteristics: ['지배당함', '벌레타입', '버섯포켓몬'] },
  
  { id: 48, name: 'Venonat', korean_name: '콘팡', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/48.png', region: '관동지방', multiplication_table: 4, rarity: 'common', characteristics: ['호기심', '벌레타입', '곤충포켓몬'] },
  { id: 49, name: 'Venomoth', korean_name: '도나리', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/49.png', region: '관동지방', multiplication_table: 7, rarity: 'uncommon', characteristics: ['야행성', '벌레타입', '독나방포켓몬'] },
  
  { id: 50, name: 'Diglett', korean_name: '디그다', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/50.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['굴파기', '땅타입', '두더지포켓몬'] },
  { id: 51, name: 'Dugtrio', korean_name: '닥트리오', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/51.png', region: '관동지방', multiplication_table: 6, rarity: 'uncommon', characteristics: ['협동', '땅타입', '두더지포켓몬'] },
  
  { id: 53, name: 'Persian', korean_name: '페르시온', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/53.png', region: '관동지방', multiplication_table: 8, rarity: 'uncommon', characteristics: ['우아함', '일반타입', '샴고양이포켓몬'] },
  
  { id: 55, name: 'Golduck', korean_name: '골덕', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/55.png', region: '관동지방', multiplication_table: 8, rarity: 'uncommon', characteristics: ['초능력', '물타입', '오리포켓몬'] },
  
  { id: 56, name: 'Mankey', korean_name: '망키', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/56.png', region: '관동지방', multiplication_table: 4, rarity: 'common', characteristics: ['화남', '격투타입', '돼지원숭이포켓몬'] },
  { id: 57, name: 'Primeape', korean_name: '성원숭', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/57.png', region: '관동지방', multiplication_table: 7, rarity: 'uncommon', characteristics: ['분노', '격투타입', '돼지원숭이포켓몬'] },
  
  { id: 58, name: 'Growlithe', korean_name: '가디', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png', region: '관동지방', multiplication_table: 4, rarity: 'uncommon', characteristics: ['충성심', '불타입', '강아지포켓몬'] },
  { id: 59, name: 'Arcanine', korean_name: '윈디', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['전설적', '불타입', '전설포켓몬'] },
  
  { id: 60, name: 'Poliwag', korean_name: '발챙이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/60.png', region: '관동지방', multiplication_table: 3, rarity: 'common', characteristics: ['젊음', '물타입', '올챙이포켓몬'] },
  { id: 61, name: 'Poliwhirl', korean_name: '슈륙챙이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/61.png', region: '관동지방', multiplication_table: 5, rarity: 'uncommon', characteristics: ['성장', '물타입', '올챙이포켓몬'] },
  { id: 62, name: 'Poliwrath', korean_name: '강챙이', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/62.png', region: '관동지방', multiplication_table: 8, rarity: 'rare', characteristics: ['근육질', '물타입', '올챙이포켓몬'] },
  
  { id: 63, name: 'Abra', korean_name: '캐이시', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png', region: '관동지방', multiplication_table: 4, rarity: 'uncommon', characteristics: ['텔레파시', '에스퍼타입', '염력포켓몬'] },
  { id: 64, name: 'Kadabra', korean_name: '윤겔라', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png', region: '관동지방', multiplication_table: 7, rarity: 'rare', characteristics: ['초능력', '에스퍼타입', '염력포켓몬'] },
  { id: 65, name: 'Alakazam', korean_name: '후딘', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png', region: '관동지방', multiplication_table: 9, rarity: 'rare', characteristics: ['천재', '에스퍼타입', '염력포켓몬'] },
  
  { id: 66, name: 'Machop', korean_name: '알통몬', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png', region: '관동지방', multiplication_table: 4, rarity: 'common', characteristics: ['근력', '격투타입', '괴력포켓몬'] },
  { id: 67, name: 'Machoke', korean_name: '근육몬', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/67.png', region: '관동지방', multiplication_table: 7, rarity: 'uncommon', characteristics: ['파워풀', '격투타입', '괴력포켓몬'] },
  { id: 68, name: 'Machamp', korean_name: '괴력몬', image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png', region: '관동지방', multiplication_table: 9, rarity: 'rare', characteristics: ['무적', '격투타입', '괴력포켓몬'] }
];