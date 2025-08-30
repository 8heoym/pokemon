import { PokemonImageDownloader } from './imageDownloader';
import { supabase } from '../config/supabase';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🔧 포켓몬 이미지 다운로드 프로세스 시작...');
  
  try {
    // Test database connection
    const { data, error } = await supabase.from('pokemon').select('count').limit(1);
    if (error) {
      throw new Error(`데이터베이스 연결 실패: ${error.message}`);
    }
    console.log('✅ 데이터베이스 연결 확인');

    const downloader = new PokemonImageDownloader();

    // Show current statistics
    console.log('\n📊 현재 다운로드 상태:');
    const stats = await downloader.getDownloadStats();
    console.log(`- 전체 포켓몬: ${stats.total}개`);
    console.log(`- 이미지 있음: ${stats.withImages}개`);
    console.log(`- 이미지 없음: ${stats.withoutImages}개`);
    console.log(`- 완료율: ${stats.completionRate}%\n`);

    if (stats.withoutImages === 0) {
      console.log('🎉 모든 포켓몬 이미지가 이미 다운로드되어 있습니다!');
      return;
    }

    // Note: IMAGE column should be added manually in Supabase dashboard or SQL editor
    console.log('ℹ️ IMAGE 컬럼이 이미 존재한다고 가정하고 진행합니다.');
    console.log('   만약 컬럼이 없다면 Supabase에서 수동으로 추가해주세요:');
    console.log('   ALTER TABLE pokemon ADD COLUMN IF NOT EXISTS image BYTEA;');

    // Start downloading images
    await downloader.downloadAllPokemonImages();

    // Show final statistics
    console.log('\n📊 최종 다운로드 상태:');
    const finalStats = await downloader.getDownloadStats();
    console.log(`- 전체 포켓몬: ${finalStats.total}개`);
    console.log(`- 이미지 있음: ${finalStats.withImages}개`);
    console.log(`- 이미지 없음: ${finalStats.withoutImages}개`);
    console.log(`- 완료율: ${finalStats.completionRate}%`);

    console.log('\n✨ 포켓몬 이미지 다운로드 프로세스 완료!');

  } catch (error) {
    console.error('💥 프로세스 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}