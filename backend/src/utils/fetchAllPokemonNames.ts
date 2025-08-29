import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

interface PokeAPISpecies {
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
}

interface PokeAPIPokemon {
  id: number;
  name: string;
  species: {
    url: string;
  };
}

interface PokemonNameData {
  id: number;
  englishName: string;
  koreanName: string;
}

async function fetchAllPokemonNames(): Promise<void> {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
  );

  try {
    console.log('PokeAPI에서 전체 포켓몬 이름 데이터 수집 시작...');
    
    const pokemonNames: PokemonNameData[] = [];
    const batchSize = 50;
    const maxId = 1025; // 현재까지 존재하는 포켓몬 최대 ID
    
    // 배치로 포켓몬 정보 가져오기
    for (let startId = 1; startId <= maxId; startId += batchSize) {
      const endId = Math.min(startId + batchSize - 1, maxId);
      console.log(`포켓몬 ID ${startId}-${endId} 처리 중... (${((startId/maxId)*100).toFixed(1)}%)`);
      
      const promises = [];
      for (let id = startId; id <= endId; id++) {
        promises.push(fetchPokemonName(id));
      }
      
      const results = await Promise.allSettled(promises);
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value) {
          pokemonNames.push(result.value);
        } else {
          const failedId = startId + i;
          console.log(`포켓몬 ID ${failedId}: 데이터 수집 실패`);
          // 실패한 경우 기본값 설정
          pokemonNames.push({
            id: failedId,
            englishName: `Pokemon${failedId.toString().padStart(3, '0')}`,
            koreanName: `포켓몬${failedId}`
          });
        }
      }
      
      // API 부하 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`총 ${pokemonNames.length}마리 포켓몬 이름 데이터 수집 완료`);
    
    // 현재 데이터베이스의 포켓몬들과 비교하여 업데이트 필요한 것들만 선별
    const { data: currentPokemon } = await supabase
      .from('pokemon')
      .select('id, name, korean_name')
      .order('id');
    
    const updates: Array<{ id: number; name: string; korean_name: string }> = [];
    
    for (const pokemon of pokemonNames) {
      if (pokemon.id > 842) continue; // 우리 DB에 없는 포켓몬은 스킵
      
      const current = currentPokemon?.find(p => p.id === pokemon.id);
      if (current) {
        const needsUpdate = 
          current.name !== pokemon.englishName || 
          current.korean_name !== pokemon.koreanName;
          
        if (needsUpdate) {
          updates.push({
            id: pokemon.id,
            name: pokemon.englishName,
            korean_name: pokemon.koreanName
          });
        }
      }
    }
    
    console.log(`업데이트가 필요한 포켓몬: ${updates.length}마리`);
    
    if (updates.length === 0) {
      console.log('✅ 모든 포켓몬 이름이 이미 최신 상태입니다!');
      return;
    }
    
    // 배치 업데이트 실행
    console.log('데이터베이스 업데이트 시작...');
    let updatedCount = 0;
    
    for (let i = 0; i < updates.length; i += 50) {
      const batch = updates.slice(i, i + 50);
      console.log(`배치 ${Math.floor(i/50) + 1}/${Math.ceil(updates.length/50)} 처리 중... (${batch.length}개)`);
      
      for (const update of batch) {
        try {
          const { error } = await supabase
            .from('pokemon')
            .update({
              name: update.name,
              korean_name: update.korean_name
            })
            .eq('id', update.id);
          
          if (error) {
            console.error(`포켓몬 ID ${update.id} 업데이트 실패:`, error);
          } else {
            updatedCount++;
            if (updatedCount % 100 === 0) {
              console.log(`진행률: ${updatedCount}/${updates.length} (${((updatedCount/updates.length)*100).toFixed(1)}%)`);
            }
          }
        } catch (err) {
          console.error(`포켓몬 ID ${update.id} 업데이트 오류:`, err);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    console.log(`\n✅ 완료! ${updatedCount}마리의 포켓몬 이름이 업데이트되었습니다.`);
    
    // 샘플 검증
    console.log('\n--- 업데이트 결과 샘플 ---');
    const sampleIds = [276, 300, 400, 500, 600, 700, 800];
    
    for (const id of sampleIds) {
      const { data: pokemon } = await supabase
        .from('pokemon')
        .select('id, name, korean_name')
        .eq('id', id)
        .single();
      
      if (pokemon) {
        console.log(`ID ${id}: ${pokemon.name} / ${pokemon.korean_name}`);
      }
    }
    
  } catch (error) {
    console.error('포켓몬 이름 수집 중 오류 발생:', error);
    throw error;
  }
}

async function fetchPokemonName(id: number): Promise<PokemonNameData | null> {
  try {
    // 1. 기본 포켓몬 정보 가져오기
    const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`, {
      timeout: 10000
    });
    const pokemon: PokeAPIPokemon = pokemonResponse.data;
    
    // 2. 종족 정보에서 다국어 이름 가져오기
    const speciesResponse = await axios.get(pokemon.species.url, {
      timeout: 10000
    });
    const species: PokeAPISpecies = speciesResponse.data;
    
    // 3. 영어 이름과 한국어 이름 추출
    const englishName = species.names.find(n => n.language.name === 'en')?.name || 
                       pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    
    const koreanName = species.names.find(n => n.language.name === 'ko')?.name || 
                      `포켓몬${id}`;
    
    return {
      id,
      englishName,
      koreanName
    };
    
  } catch (error) {
    console.error(`포켓몬 ID ${id} 정보 가져오기 실패:`, error);
    return null;
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  fetchAllPokemonNames()
    .then(() => {
      console.log('모든 포켓몬 이름 업데이트가 완료되었습니다!');
      process.exit(0);
    })
    .catch(error => {
      console.error('업데이트 실패:', error);
      process.exit(1);
    });
}

export { fetchAllPokemonNames };