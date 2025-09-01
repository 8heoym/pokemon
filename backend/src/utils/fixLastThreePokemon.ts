import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function fixLastThreePokemon(): Promise<void> {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
  );

  try {
    console.log('마지막 3마리 포켓몬 이름 수정...');
    
    const fixes = [
      { id: 83, name: 'Farfetchd', korean_name: '파오리' },
      { id: 188, name: 'Skiploom', korean_name: '두리코' },
      { id: 210, name: 'Granbull', korean_name: '그랑불' }
    ];
    
    for (const fix of fixes) {
      const { error } = await supabase
        .from('pokemon')
        .update({
          name: fix.name,
          korean_name: fix.korean_name
        })
        .eq('id', fix.id);
      
      if (error) {
        console.error(`포켓몬 ID ${fix.id} 수정 실패:`, error);
      } else {
        console.log(`✅ ID ${fix.id}: ${fix.name} / ${fix.korean_name}`);
      }
    }
    
    console.log('\n마지막 3마리 포켓몬 수정 완료!');
    
  } catch (error) {
    console.error('수정 중 오류:', error);
    throw error;
  }
}

if (require.main === module) {
  fixLastThreePokemon()
    .then(() => {
      console.log('완료!');
      process.exit(0);
    })
    .catch(error => {
      console.error('실패:', error);
      process.exit(1);
    });
}

export { fixLastThreePokemon };