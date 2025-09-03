import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL과 SUPABASE_ANON_KEY 환경변수가 필요합니다.');
}

console.log('Supabase 연결 설정:', { url: supabaseUrl.substring(0, 30) + '...' });
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'pokemon-backend'
    }
  }
});

// 데이터베이스 테이블 정의
export interface Database {
  public: {
    Tables: {
      pokemon: {
        Row: {
          id: number;
          name: string;
          korean_name: string;
          image_url: string;
          region: string;
          multiplication_table: number;
          rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
          characteristics: string[];
          created_at?: string;
          updated_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['pokemon']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pokemon']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          nickname: string;
          trainer_level: number;
          current_region: string;
          completed_tables: number[];
          caught_pokemon: number[];
          total_experience: number;
          created_at: string;
          updated_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      math_problems: {
        Row: {
          id: string;
          story: string;
          hint: string;
          equation: string;
          answer: number;
          multiplication_table: number;
          pokemon_id: number;
          difficulty: 1 | 2 | 3;
          visual_elements: {
            pokemon_count: number;
            items_per_pokemon: number;
            total_items: number;
          } | null;
          created_at: string;
          updated_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['math_problems']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['math_problems']['Insert']>;
      };
      user_answers: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string;
          user_answer: number;
          correct_answer: number;
          is_correct: boolean;
          time_spent: number;
          hints_used: number;
          attempted_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_answers']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_answers']['Insert']>;
      };
    };
  };
}