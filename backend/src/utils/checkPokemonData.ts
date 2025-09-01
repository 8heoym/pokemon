import { supabase } from '../config/supabase';
import dotenv from 'dotenv';

dotenv.config();

async function checkPokemonData() {
  try {
    console.log('🔍 포켓몬 데이터베이스 상태 확인 중...');

    // Check total pokemon count
    const { data: pokemonCount, error: countError } = await supabase
      .from('pokemon')
      .select('*', { count: 'exact' });

    if (countError) {
      throw new Error(`포켓몬 데이터 조회 실패: ${countError.message}`);
    }

    console.log(`📊 전체 포켓몬 수: ${pokemonCount?.length || 0}개`);

    if (pokemonCount && pokemonCount.length > 0) {
      console.log('\n📋 포켓몬 데이터 샘플:');
      pokemonCount.slice(0, 5).forEach((pokemon: any) => {
        console.log(`- ID: ${pokemon.id}, 이름: ${pokemon.korean_name} (${pokemon.name})`);
        console.log(`  이미지 URL: ${pokemon.image_url}`);
        console.log(`  이미지 데이터: ${pokemon.image ? '있음' : '없음'}`);
        console.log('');
      });

      // Check image status
      const { data: withImages, error: imageError } = await supabase
        .from('pokemon')
        .select('id')
        .not('image', 'is', null);

      if (imageError) {
        console.log('⚠️ 이미지 상태 조회 실패:', imageError.message);
      } else {
        console.log(`🖼️ 이미지가 있는 포켓몬: ${withImages?.length || 0}개`);
        console.log(`🚫 이미지가 없는 포켓몬: ${(pokemonCount?.length || 0) - (withImages?.length || 0)}개`);
      }

      // Check column structure
      console.log('\n🏗️ 테이블 구조 확인:');
      const { data: tableInfo, error: infoError } = await supabase
        .from('pokemon')
        .select('*')
        .limit(1);
      
      if (!infoError && tableInfo && tableInfo.length > 0) {
        console.log('컬럼들:', Object.keys(tableInfo[0]));
      }

    } else {
      console.log('❌ 포켓몬 데이터가 없습니다.');
      console.log('포켓몬 데이터 초기화가 필요합니다.');
    }

  } catch (error) {
    console.error('💥 데이터 확인 중 오류 발생:', error);
  }
}

checkPokemonData();