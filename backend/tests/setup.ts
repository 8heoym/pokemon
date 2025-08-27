import dotenv from 'dotenv';

// 테스트 환경 변수 로드
dotenv.config({ path: '.env.test' });

// 기본 환경 변수 설정 (테스트용)
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://sgbjhwhwnldhgcydqqny.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnYmpod2h3bmxkaGdjeWRxcW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzc5MTEsImV4cCI6MjA3MTYxMzkxMX0.X7FMI_tNPsC7U0ZBzhYKZ3nsCbbrzMkbNH37C0HP2VE';

// 테스트 타임아웃 설정
jest.setTimeout(30000);

// 전역 테스트 설정
beforeAll(async () => {
  // 테스트 시작 전 설정
});

afterAll(async () => {
  // 테스트 완료 후 정리
});