-- Pokemon Math Adventure Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pokemon 테이블
CREATE TABLE IF NOT EXISTS pokemon (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    korean_name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    multiplication_table INTEGER CHECK (multiplication_table >= 0 AND multiplication_table <= 9),
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary')) NOT NULL,
    characteristics TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname VARCHAR(50) NOT NULL,
    trainer_level INTEGER DEFAULT 1 CHECK (trainer_level >= 1),
    current_region VARCHAR(100) DEFAULT '관동지방',
    completed_tables INTEGER[] DEFAULT '{}',
    caught_pokemon INTEGER[] DEFAULT '{}',
    total_experience INTEGER DEFAULT 0 CHECK (total_experience >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Math Problems 테이블
CREATE TABLE IF NOT EXISTS math_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story TEXT NOT NULL,
    hint TEXT NOT NULL,
    equation VARCHAR(255) NOT NULL,
    answer INTEGER NOT NULL,
    multiplication_table INTEGER CHECK (multiplication_table >= 0 AND multiplication_table <= 9),
    pokemon_id INTEGER REFERENCES pokemon(id),
    difficulty INTEGER CHECK (difficulty IN (1, 2, 3)),
    visual_elements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Answers 테이블
CREATE TABLE IF NOT EXISTS user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES math_problems(id) ON DELETE CASCADE,
    user_answer INTEGER NOT NULL,
    correct_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER NOT NULL CHECK (time_spent >= 0),
    hints_used INTEGER DEFAULT 0 CHECK (hints_used >= 0),
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_pokemon_multiplication_table ON pokemon(multiplication_table);
CREATE INDEX IF NOT EXISTS idx_pokemon_region ON pokemon(region);
CREATE INDEX IF NOT EXISTS idx_pokemon_rarity ON pokemon(rarity);

CREATE INDEX IF NOT EXISTS idx_users_trainer_level ON users(trainer_level DESC);
CREATE INDEX IF NOT EXISTS idx_users_current_region ON users(current_region);

CREATE INDEX IF NOT EXISTS idx_math_problems_multiplication_table ON math_problems(multiplication_table);
CREATE INDEX IF NOT EXISTS idx_math_problems_difficulty ON math_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_math_problems_pokemon_id ON math_problems(pokemon_id);

CREATE INDEX IF NOT EXISTS idx_user_answers_user_id_attempted_at ON user_answers(user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_answers_problem_id ON user_answers(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_is_correct ON user_answers(is_correct);

-- Updated_at 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at 트리거 생성
CREATE TRIGGER update_pokemon_updated_at BEFORE UPDATE ON pokemon FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_math_problems_updated_at BEFORE UPDATE ON math_problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 포켓몬 데이터 삽입 (샘플)
INSERT INTO pokemon (id, name, korean_name, image_url, region, multiplication_table, rarity, characteristics) VALUES
(25, 'Pikachu', '피카츄', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', '관동지방', 2, 'uncommon', ARRAY['활발함', '친근함', '전기타입']),
(1, 'Bulbasaur', '이상해씨', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', '관동지방', 2, 'common', ARRAY['온순함', '풀타입', '씨앗포켓몬']),
(4, 'Charmander', '파이리', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png', '관동지방', 3, 'common', ARRAY['용감함', '불타입', '도마뱀포켓몬']),
(7, 'Squirtle', '꼬부기', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png', '관동지방', 4, 'common', ARRAY['신중함', '물타입', '거북포켓몬']),
(150, 'Mewtwo', '뮤츠', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png', '관동지방', 9, 'legendary', ARRAY['강력함', '에스퍼타입', '유전자포켓몬'])
ON CONFLICT (id) DO NOTHING;

-- RLS (Row Level Security) 정책 설정
ALTER TABLE pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 pokemon 테이블 읽기 가능
CREATE POLICY "Anyone can read pokemon" ON pokemon FOR SELECT USING (true);

-- 사용자는 자신의 데이터만 읽고 쓸 수 있음
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- 사용자는 자신의 답변만 읽고 쓸 수 있음
CREATE POLICY "Users can read own answers" ON user_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own answers" ON user_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 모든 사용자가 수학 문제 읽기 가능
CREATE POLICY "Anyone can read math problems" ON math_problems FOR SELECT USING (true);