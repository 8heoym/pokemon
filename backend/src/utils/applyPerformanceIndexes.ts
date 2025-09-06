import { supabase } from '../config/supabase';
import fs from 'fs';
import path from 'path';

export class PerformanceIndexManager {
  
  async applyPerformanceIndexes(): Promise<{ success: boolean; message: string; errors: string[] }> {
    try {
      console.log('🚀 성능 최적화 인덱스 적용 시작...');
      
      const sqlFilePath = path.join(__dirname, '../../database/performance_indexes.sql');
      
      if (!fs.existsSync(sqlFilePath)) {
        throw new Error('인덱스 SQL 파일을 찾을 수 없습니다.');
      }
      
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      
      // SQL 문을 개별 명령으로 분리 (주석과 빈 줄 제거)
      const sqlCommands = sqlContent
        .split('\n')
        .filter(line => line.trim() && !line.trim().startsWith('--'))
        .join('\n')
        .split(';')
        .filter(cmd => cmd.trim())
        .map(cmd => cmd.trim());
      
      const errors: string[] = [];
      let successCount = 0;
      
      console.log(`📊 총 ${sqlCommands.length}개의 인덱스 생성 명령 실행...`);
      
      // Supabase는 직접 SQL 실행 제한이 있으므로, 개별 테이블별로 접근
      console.log('🔄 Supabase 환경에서는 수동으로 인덱스를 생성해야 합니다.');
      console.log('📋 다음 SQL을 Supabase Dashboard SQL Editor에서 실행하세요:');
      console.log('='.repeat(60));
      
      sqlCommands.forEach((command, index) => {
        console.log(`-- 인덱스 ${index + 1}`);
        console.log(command + ';');
        console.log('');
      });
      
      console.log('='.repeat(60));
      
      // 대신 기존 인덱스 존재 여부를 확인
      const indexValidation = await this.validateIndexes();
      
      if (indexValidation.valid) {
        successCount = sqlCommands.length;
        console.log('✅ 모든 필요한 인덱스가 이미 존재합니다!');
      } else {
        console.log('⚠️  일부 인덱스가 누락되어 있습니다. 수동으로 생성이 필요합니다.');
        errors.push('일부 인덱스가 누락되어 있어 수동 생성이 필요합니다.');
      }
      
      const message = `성능 인덱스 적용 완료: ${successCount}개 성공, ${errors.length}개 오류`;
      console.log(`🎉 ${message}`);
      
      return {
        success: errors.length === 0,
        message,
        errors
      };
      
    } catch (error: any) {
      console.error('❌ 성능 인덱스 적용 실패:', error);
      return {
        success: false,
        message: '성능 인덱스 적용에 실패했습니다.',
        errors: [error.message]
      };
    }
  }
  
  async analyzeQueryPerformance(): Promise<{
    slowQueries: any[];
    indexUsage: any[];
    recommendations: string[];
  }> {
    try {
      console.log('📊 쿼리 성능 분석 중...');
      
      // 인덱스 사용률 분석 (PostgreSQL 통계 활용)
      const { data: indexStats, error: indexError } = await supabase.rpc('analyze_index_usage');
      
      if (indexError) {
        console.warn('인덱스 통계 조회 실패:', indexError.message);
      }
      
      // 권장사항 생성
      const recommendations = [
        '새로 추가된 인덱스의 효과를 모니터링하세요.',
        '쿼리 실행 계획을 주기적으로 확인하세요.',
        '사용되지 않는 인덱스는 제거를 고려하세요.',
        '테이블 통계를 정기적으로 업데이트하세요.'
      ];
      
      return {
        slowQueries: [], // 실제 구현시 pg_stat_statements 활용
        indexUsage: indexStats || [],
        recommendations
      };
      
    } catch (error: any) {
      console.error('쿼리 성능 분석 실패:', error);
      return {
        slowQueries: [],
        indexUsage: [],
        recommendations: ['성능 분석을 위한 모니터링 도구 설정이 필요합니다.']
      };
    }
  }
  
  async validateIndexes(): Promise<{ valid: boolean; details: any[] }> {
    try {
      console.log('🔍 인덱스 유효성 검사 중...');
      
      const indexNames = [
        'idx_user_answers_user_correct',
        'idx_user_answers_user_table',
        'idx_problem_templates_table_difficulty',
        'idx_pokemon_table_rarity',
        'idx_problem_instances_user_active',
        'idx_users_nickname',
        'idx_users_leaderboard'
      ];
      
      const details = [];
      
      for (const indexName of indexNames) {
        try {
          const { data, error } = await supabase
            .from('pg_indexes')
            .select('indexname, tablename')
            .eq('indexname', indexName)
            .maybeSingle();
          
          if (error && error.code !== 'PGRST116') {
            details.push({ 
              index: indexName, 
              status: 'error', 
              message: error.message 
            });
          } else if (data) {
            details.push({ 
              index: indexName, 
              status: 'exists', 
              table: data.tablename 
            });
          } else {
            details.push({ 
              index: indexName, 
              status: 'missing' 
            });
          }
        } catch (checkError: any) {
          details.push({ 
            index: indexName, 
            status: 'check_failed', 
            message: checkError.message 
          });
        }
      }
      
      const valid = details.every(d => d.status === 'exists');
      
      console.log(`📋 인덱스 검사 결과: ${details.length}개 중 ${details.filter(d => d.status === 'exists').length}개 존재`);
      
      return { valid, details };
      
    } catch (error: any) {
      console.error('인덱스 유효성 검사 실패:', error);
      return { 
        valid: false, 
        details: [{ error: error.message }] 
      };
    }
  }
}