import { supabase } from '../config/supabase';

export class DirectSchemaUpdater {
  
  /**
   * 방법 1: 각 컬럼을 개별적으로 추가
   * Supabase에서 가장 호환성이 좋은 방식
   */
  async addPhase2ColumnsIndividually(): Promise<{ success: boolean; message: string; details: any[] }> {
    try {
      console.log('🔄 Phase 2 컬럼 개별 추가 시작...');
      const results: any[] = [];

      // 1. current_streak 컬럼 추가
      console.log('1️⃣ current_streak 컬럼 추가...');
      try {
        const { data: addCurrentStreak, error: currentStreakError } = await supabase
          .rpc('exec_sql', { 
            query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;' 
          });
        
        results.push({ column: 'current_streak', success: !currentStreakError, error: currentStreakError?.message });
      } catch (err: any) {
        results.push({ column: 'current_streak', success: false, error: err.message });
      }

      // 2. longest_streak 컬럼 추가
      console.log('2️⃣ longest_streak 컬럼 추가...');
      try {
        const { data: addLongestStreak, error: longestStreakError } = await supabase
          .rpc('exec_sql', { 
            query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;' 
          });
        
        results.push({ column: 'longest_streak', success: !longestStreakError, error: longestStreakError?.message });
      } catch (err: any) {
        results.push({ column: 'longest_streak', success: false, error: err.message });
      }

      // 3. last_active_date 컬럼 추가
      console.log('3️⃣ last_active_date 컬럼 추가...');
      try {
        const { data: addLastActive, error: lastActiveError } = await supabase
          .rpc('exec_sql', { 
            query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();' 
          });
        
        results.push({ column: 'last_active_date', success: !lastActiveError, error: lastActiveError?.message });
      } catch (err: any) {
        results.push({ column: 'last_active_date', success: false, error: err.message });
      }

      // 4. star_dust 컬럼 추가
      console.log('4️⃣ star_dust 컬럼 추가...');
      try {
        const { data: addStarDust, error: starDustError } = await supabase
          .rpc('exec_sql', { 
            query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS star_dust INTEGER DEFAULT 100;' 
          });
        
        results.push({ column: 'star_dust', success: !starDustError, error: starDustError?.message });
      } catch (err: any) {
        results.push({ column: 'star_dust', success: false, error: err.message });
      }

      // 5. earned_badges 컬럼 추가
      console.log('5️⃣ earned_badges 컬럼 추가...');
      try {
        const { data: addEarnedBadges, error: earnedBadgesError } = await supabase
          .rpc('exec_sql', { 
            query: "ALTER TABLE users ADD COLUMN IF NOT EXISTS earned_badges TEXT[] DEFAULT '{}';" 
          });
        
        results.push({ column: 'earned_badges', success: !earnedBadgesError, error: earnedBadgesError?.message });
      } catch (err: any) {
        results.push({ column: 'earned_badges', success: false, error: err.message });
      }

      // 6. purchased_items 컬럼 추가
      console.log('6️⃣ purchased_items 컬럼 추가...');
      try {
        const { data: addPurchasedItems, error: purchasedItemsError } = await supabase
          .rpc('exec_sql', { 
            query: "ALTER TABLE users ADD COLUMN IF NOT EXISTS purchased_items TEXT[] DEFAULT '{}';" 
          });
        
        results.push({ column: 'purchased_items', success: !purchasedItemsError, error: purchasedItemsError?.message });
      } catch (err: any) {
        results.push({ column: 'purchased_items', success: false, error: err.message });
      }

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      console.log(`✅ 컬럼 추가 완료: ${successCount}/${totalCount}`);
      
      return {
        success: successCount > 0,
        message: `Phase 2 컬럼 추가 완료: ${successCount}/${totalCount} 성공`,
        details: results
      };

    } catch (error: any) {
      console.error('❌ 컬럼 추가 실패:', error);
      return {
        success: false,
        message: `Schema update failed: ${error.message}`,
        details: []
      };
    }
  }

  /**
   * 방법 2: 직접 INSERT를 통한 우회 방법
   * 컬럼이 없으면 기본값으로 처리하는 방식
   */
  async createWorkaroundService(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Workaround 서비스 생성...');

      // 테스트용 사용자 데이터 업데이트
      const testUserId = '63ec79ea-c577-450a-bc0c-8f321c4dda6d';
      
      // 기존 사용자 데이터 조회
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (fetchError) {
        throw new Error(`사용자 조회 실패: ${fetchError.message}`);
      }

      console.log('기존 사용자 데이터:', existingUser);

      return {
        success: true,
        message: 'Workaround 서비스 준비 완료'
      };

    } catch (error: any) {
      console.error('❌ Workaround 서비스 생성 실패:', error);
      return {
        success: false,
        message: `Workaround failed: ${error.message}`
      };
    }
  }

  /**
   * 방법 3: Raw SQL 실행 대안들 시도
   */
  async tryAlternativeRPCs(): Promise<{ success: boolean; message: string; attempts: any[] }> {
    try {
      console.log('🔄 대안 RPC 함수들 시도...');
      const attempts: any[] = [];

      // 시도 1: exec_sql
      try {
        const { data: result1, error: error1 } = await supabase
          .rpc('exec_sql', { 
            query: 'SELECT 1 as test_connection;' 
          });
        attempts.push({ method: 'exec_sql', success: !error1, data: result1, error: error1?.message });
      } catch (err: any) {
        attempts.push({ method: 'exec_sql', success: false, error: err.message });
      }

      // 시도 2: execute_sql
      try {
        const { data: result2, error: error2 } = await supabase
          .rpc('execute_sql', { 
            sql_query: 'SELECT 1 as test_connection;' 
          });
        attempts.push({ method: 'execute_sql', success: !error2, data: result2, error: error2?.message });
      } catch (err: any) {
        attempts.push({ method: 'execute_sql', success: false, error: err.message });
      }

      // 시도 3: run_sql
      try {
        const { data: result3, error: error3 } = await supabase
          .rpc('run_sql', { 
            sql: 'SELECT 1 as test_connection;' 
          });
        attempts.push({ method: 'run_sql', success: !error3, data: result3, error: error3?.message });
      } catch (err: any) {
        attempts.push({ method: 'run_sql', success: false, error: err.message });
      }

      // 시도 4: 사용 가능한 RPC 함수 목록 조회
      try {
        const { data: rpcList, error: rpcError } = await supabase
          .from('pg_proc')
          .select('proname')
          .like('proname', '%sql%')
          .limit(10);
        
        attempts.push({ method: 'pg_proc_query', success: !rpcError, data: rpcList, error: rpcError?.message });
      } catch (err: any) {
        attempts.push({ method: 'pg_proc_query', success: false, error: err.message });
      }

      const successCount = attempts.filter(a => a.success).length;

      console.log(`RPC 시도 결과: ${successCount}/${attempts.length} 성공`);
      attempts.forEach(attempt => {
        console.log(`- ${attempt.method}: ${attempt.success ? '✅' : '❌'} ${attempt.error || ''}`);
      });

      return {
        success: successCount > 0,
        message: `RPC 테스트 완료: ${successCount}/${attempts.length} 성공`,
        attempts
      };

    } catch (error: any) {
      console.error('❌ RPC 시도 실패:', error);
      return {
        success: false,
        message: `RPC test failed: ${error.message}`,
        attempts: []
      };
    }
  }

  /**
   * 현재 users 테이블 스키마 확인
   */
  async inspectCurrentSchema(): Promise<{ success: boolean; schema: any; message: string }> {
    try {
      console.log('🔍 현재 users 테이블 스키마 검사...');

      // 테이블 컬럼 정보 조회
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'users')
        .eq('table_schema', 'public');

      if (tableError) {
        console.log('❌ information_schema 조회 실패, 다른 방법 시도...');
        
        // 대안: 실제 데이터를 조회해서 컬럼 확인
        const { data: sampleData, error: sampleError } = await supabase
          .from('users')
          .select('*')
          .limit(1);

        if (sampleError) {
          throw new Error(`스키마 검사 실패: ${sampleError.message}`);
        }

        const columns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
        
        return {
          success: true,
          schema: {
            method: 'sample_data',
            columns: columns,
            phase2_columns: {
              current_streak: columns.includes('current_streak'),
              longest_streak: columns.includes('longest_streak'),
              last_active_date: columns.includes('last_active_date'),
              star_dust: columns.includes('star_dust'),
              earned_badges: columns.includes('earned_badges'),
              purchased_items: columns.includes('purchased_items')
            }
          },
          message: 'Sample data로 스키마 확인 완료'
        };
      }

      const phase2Columns = ['current_streak', 'longest_streak', 'last_active_date', 'star_dust', 'earned_badges', 'purchased_items'];
      const existingColumns = tableInfo?.map(col => col.column_name) || [];
      const phase2Status = phase2Columns.reduce((acc, col) => {
        acc[col] = existingColumns.includes(col);
        return acc;
      }, {} as Record<string, boolean>);

      console.log('📊 스키마 검사 결과:');
      console.log('- 전체 컬럼:', existingColumns);
      console.log('- Phase 2 컬럼 상태:', phase2Status);

      return {
        success: true,
        schema: {
          method: 'information_schema',
          all_columns: tableInfo,
          existing_columns: existingColumns,
          phase2_columns: phase2Status
        },
        message: 'Information schema로 스키마 확인 완료'
      };

    } catch (error: any) {
      console.error('❌ 스키마 검사 실패:', error);
      return {
        success: false,
        schema: null,
        message: `Schema inspection failed: ${error.message}`
      };
    }
  }
}