import { supabase } from '../config/supabase';
import dotenv from 'dotenv';

dotenv.config();

async function addImageColumn() {
  try {
    console.log('🔧 IMAGE 컬럼 추가 중...');

    // First, let's try a test to see if we can add the column
    console.log('📋 현재 테이블 구조 확인...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('pokemon')
      .select('*')
      .limit(1);

    if (sampleError) {
      throw new Error(`테이블 조회 실패: ${sampleError.message}`);
    }

    if (sampleData && sampleData.length > 0) {
      console.log('현재 컬럼들:', Object.keys(sampleData[0]));
      
      if ('image' in sampleData[0]) {
        console.log('✅ IMAGE 컬럼이 이미 존재합니다!');
        return;
      }
    }

    console.log('❌ IMAGE 컬럼이 존재하지 않습니다.');
    console.log('');
    console.log('🔧 다음 SQL을 Supabase SQL 에디터에서 실행해주세요:');
    console.log('='.repeat(50));
    console.log('ALTER TABLE pokemon ADD COLUMN image BYTEA;');
    console.log('');
    console.log('CREATE INDEX IF NOT EXISTS idx_pokemon_image_not_null');
    console.log('ON pokemon(id) WHERE image IS NOT NULL;');
    console.log('');
    console.log('COMMENT ON COLUMN pokemon.image IS');
    console.log("'Binary data of the Pokemon image downloaded from image_url';");
    console.log('='.repeat(50));
    console.log('');
    console.log('📍 Supabase 대시보드 → SQL Editor → 위 SQL 실행 → 그 후 이미지 다운로드 진행');

  } catch (error) {
    console.error('💥 컬럼 추가 체크 중 오류:', error);
  }
}

addImageColumn();