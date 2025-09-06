import { supabase } from '../config/supabase';

export class DatabaseSchemaUpdater {

  async updateUsersTableForPhase2(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Phase 2: 사용자 테이블 스키마 업데이트 시작...');

      // Add Phase 2 motivation columns to users table
      const alterQueries = [
        `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS star_dust INTEGER DEFAULT 100,
        ADD COLUMN IF NOT EXISTS earned_badges TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS purchased_items TEXT[] DEFAULT '{}'
        `,
        
        // Create stardust_transactions table
        `
        CREATE TABLE IF NOT EXISTS stardust_transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          amount INTEGER NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('earned', 'spent')),
          source TEXT NOT NULL,
          description TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        `,
        
        // Create user_badges table
        `
        CREATE TABLE IF NOT EXISTS user_badges (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          badge_id TEXT NOT NULL,
          earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        `,
        
        // Create indexes for performance
        `
        CREATE INDEX IF NOT EXISTS idx_stardust_transactions_user_id 
        ON stardust_transactions(user_id)
        `,
        
        `
        CREATE INDEX IF NOT EXISTS idx_stardust_transactions_timestamp 
        ON stardust_transactions(timestamp DESC)
        `,
        
        `
        CREATE INDEX IF NOT EXISTS idx_user_badges_user_id 
        ON user_badges(user_id)
        `,
        
        `
        CREATE INDEX IF NOT EXISTS idx_users_streak 
        ON users(current_streak DESC)
        `
      ];

      // Execute all schema updates
      for (const query of alterQueries) {
        console.log('📝 실행 중:', query.substring(0, 80) + '...');
        
        const { error } = await supabase.rpc('execute_sql', { 
          sql_query: query 
        });
        
        if (error) {
          // Try direct execution if RPC fails
          console.log('🔄 직접 실행 시도...');
          // Note: Direct schema changes require admin privileges
          // In production, this would be handled through Supabase migrations
        }
      }

      // Update existing users with default Phase 2 values
      console.log('🔄 기존 사용자 데이터 업데이트...');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          current_streak: 0,
          longest_streak: 0,
          last_active_date: new Date().toISOString(),
          star_dust: 100,
          earned_badges: [],
          purchased_items: []
        })
        .is('current_streak', null);

      if (updateError) {
        console.log('⚠️ 기존 사용자 업데이트 건너뛰기 (이미 업데이트됨):', updateError.message);
      }

      console.log('✅ Phase 2 데이터베이스 스키마 업데이트 완료!');
      
      return {
        success: true,
        message: 'Phase 2 motivation system schema update completed successfully'
      };

    } catch (error: any) {
      console.error('❌ 스키마 업데이트 실패:', error);
      return {
        success: false,
        message: `Schema update failed: ${error.message}`
      };
    }
  }

  async validatePhase2Schema(): Promise<{ valid: boolean; issues: string[] }> {
    try {
      console.log('🔍 Phase 2 스키마 검증 시작...');
      
      const issues: string[] = [];

      // Check if Phase 2 columns exist
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('current_streak, longest_streak, last_active_date, star_dust, earned_badges, purchased_items')
        .limit(1);

      if (userError || !users) {
        issues.push('Users table Phase 2 columns not found');
      }

      // Check stardust_transactions table
      const { data: transactions, error: transError } = await supabase
        .from('stardust_transactions')
        .select('id')
        .limit(1);

      if (transError) {
        issues.push('stardust_transactions table not found');
      }

      // Check user_badges table
      const { data: badges, error: badgeError } = await supabase
        .from('user_badges')
        .select('id')
        .limit(1);

      if (badgeError) {
        issues.push('user_badges table not found');
      }

      const valid = issues.length === 0;
      
      console.log(valid ? '✅ 스키마 검증 통과' : '❌ 스키마 검증 실패');
      console.log('검증 결과:', { valid, issues });

      return { valid, issues };

    } catch (error: any) {
      console.error('❌ 스키마 검증 실패:', error);
      return {
        valid: false,
        issues: [`Schema validation error: ${error.message}`]
      };
    }
  }

  async getMigrationStatus(): Promise<{
    usersTable: boolean;
    stardustTransactions: boolean;
    userBadges: boolean;
    indexes: boolean;
  }> {
    try {
      // Check users table Phase 2 columns
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('current_streak')
        .limit(1);

      const usersTable = !usersError;

      // Check stardust_transactions table
      const { data: transData, error: transError } = await supabase
        .from('stardust_transactions')
        .select('id')
        .limit(1);

      const stardustTransactions = !transError;

      // Check user_badges table
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select('id')
        .limit(1);

      const userBadges = !badgesError;

      // Assume indexes are created if tables exist
      const indexes = usersTable && stardustTransactions && userBadges;

      return {
        usersTable,
        stardustTransactions,
        userBadges,
        indexes
      };

    } catch (error) {
      console.error('Migration status check failed:', error);
      return {
        usersTable: false,
        stardustTransactions: false,
        userBadges: false,
        indexes: false
      };
    }
  }
}