import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://sgbjhwhwnldhgcydqqny.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnYmpod2h3bmxkaGdjeWRxcW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzc5MTEsImV4cCI6MjA3MTYxMzkxMX0.X7FMI_tNPsC7U0ZBzhYKZ3nsCbbrzMkbNH37C0HP2VE';

// 개발 중에는 하드코딩된 값 사용, 프로덕션에서는 환경변수 필수
if (process.env.NODE_ENV === 'production' && (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)) {
  throw new Error('Supabase URL과 Key가 환경변수에 설정되지 않았습니다.');
}

console.log('Supabase 연결 설정:', { url: supabaseUrl.substring(0, 30) + '...' });
export const supabase = createClient(supabaseUrl, supabaseKey);

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