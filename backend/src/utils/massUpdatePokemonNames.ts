import { createClient } from '@supabase/supabase-js';
import { correctPokemonNames } from './checkAllPokemonNames';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

interface PokemonInsert {
  id: number;
  name: string;
  korean_name: string;
  image_url: string;
  region: string;
  multiplication_table: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  characteristics: string[];
}

async function massUpdatePokemonNames(): Promise<void> {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
  );
  
  try {
    console.log('대량 포켓몬 이름 업데이트 시작...');
    
    // 모든 포켓몬 데이터 가져오기
    const { data: allPokemon, error } = await supabase
      .from('pokemon')
      .select('id, name, korean_name')
      .order('id');
    
    if (error) throw error;
    
    console.log(`총 ${allPokemon?.length || 0}마리 포켓몬을 확인합니다.`);
    
    const updates: Array<{ id: number; name: string; korean_name: string }> = [];
    
    // 각 포켓몬에 대해 올바른 이름으로 업데이트가 필요한지 확인
    for (const pokemon of allPokemon || []) {
      const correctData = correctPokemonNames[pokemon.id];
      
      if (correctData) {
        // 현재 이름과 올바른 이름 비교
        const needsUpdate = 
          pokemon.name !== correctData.name || 
          pokemon.korean_name !== correctData.korean_name;
          
        if (needsUpdate) {
          updates.push({
            id: pokemon.id,
            name: correctData.name,
            korean_name: correctData.korean_name
          });
        }
      } else {
        // 매핑이 없는 포켓몬은 Pokemon001 형식으로 설정
        const needsUpdate = 
          !pokemon.name?.startsWith('Pokemon') || 
          !pokemon.korean_name?.startsWith('포켓몬');
          
        if (needsUpdate) {
          updates.push({
            id: pokemon.id,
            name: `Pokemon${pokemon.id.toString().padStart(3, '0')}`,
            korean_name: `포켓몬${pokemon.id}`
          });
        }
      }
    }
    
    console.log(`업데이트가 필요한 포켓몬: ${updates.length}마리`);
    
    if (updates.length === 0) {
      console.log('✅ 모든 포켓몬 이름이 이미 올바릅니다!');
      return;
    }
    
    // 배치 업데이트 실행 (한 번에 100개씩)
    const batchSize = 100;
    let updatedCount = 0;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      console.log(`배치 ${Math.floor(i/batchSize) + 1}/${Math.ceil(updates.length/batchSize)} 업데이트 중... (${batch.length}개)`);
      
      // 각 포켓몬 개별 업데이트 (Supabase upsert를 사용하여 안전하게)
      for (const update of batch) {
        try {
          const { error: updateError } = await supabase
            .from('pokemon')
            .update({
              name: update.name,
              korean_name: update.korean_name
            })
            .eq('id', update.id);
          
          if (updateError) {
            console.error(`포켓몬 ID ${update.id} 업데이트 실패:`, updateError);
          } else {
            updatedCount++;
            if (updatedCount % 50 === 0) {
              console.log(`진행률: ${updatedCount}/${updates.length} (${((updatedCount/updates.length)*100).toFixed(1)}%)`);
            }
          }
        } catch (err) {
          console.error(`포켓몬 ID ${update.id} 업데이트 중 오류:`, err);
        }
        
        // API 부하 방지를 위한 작은 딜레이
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    console.log(`\n✅ 완료! ${updatedCount}마리의 포켓몬 이름이 업데이트되었습니다.`);
    
    // 몇 개 샘플 검증
    console.log('\n--- 업데이트 결과 검증 ---');
    const sampleIds = [1, 25, 161, 182, 252];
    
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
    console.error('대량 업데이트 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시 업데이트 수행
if (require.main === module) {
  massUpdatePokemonNames()
    .then(() => {
      console.log('대량 포켓몬 이름 업데이트가 완료되었습니다!');
      process.exit(0);
    })
    .catch(error => {
      console.error('업데이트 실패:', error);
      process.exit(1);
    });
}

export { massUpdatePokemonNames };