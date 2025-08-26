import { supabase } from '../config/supabase';

async function checkMissingPokemon() {
  try {
    const { data, error } = await supabase
      .from('pokemon')
      .select('id')
      .order('id');

    if (error) {
      console.error('DB 조회 오류:', error);
      return;
    }

    const existingIds = new Set(data?.map((p: any) => p.id) || []);
    const missingIds: number[] = [];
    
    for (let i = 1; i <= 1025; i++) {
      if (!existingIds.has(i)) {
        missingIds.push(i);
      }
    }

    console.log(`총 DB 포켓몬: ${existingIds.size}마리`);
    console.log(`누락된 포켓몬: ${missingIds.length}마리`);
    console.log(`수집 완료율: ${((existingIds.size / 1025) * 100).toFixed(1)}%`);

    if (missingIds.length <= 100) {
      console.log('누락된 ID:', missingIds.join(', '));
    } else {
      console.log('처음 50개 누락 ID:', missingIds.slice(0, 50).join(', '));
      console.log('마지막 50개 누락 ID:', missingIds.slice(-50).join(', '));
    }

    // 지역별 통계
    const { data: regionStats } = await supabase
      .from('pokemon')
      .select('region')
      .order('region');

    if (regionStats) {
      const regionCounts = regionStats.reduce((acc: any, pokemon: any) => {
        acc[pokemon.region] = (acc[pokemon.region] || 0) + 1;
        return acc;
      }, {});

      console.log('\n지역별 포켓몬 수:');
      Object.entries(regionCounts).forEach(([region, count]) => {
        console.log(`  ${region}: ${count}마리`);
      });
    }

  } catch (error) {
    console.error('확인 중 오류 발생:', error);
  }
}

// 스크립트 직접 실행
if (require.main === module) {
  checkMissingPokemon();
}