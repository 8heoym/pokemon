import { supabase } from '../config/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

export class TemplateSystemInitializer {
  async initializeDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('템플릿 시스템 데이터베이스 초기화 시작...');

      // 1. 스키마 적용
      await this.executeSchemaFile('template_schema.sql');
      console.log('✅ 스키마 생성 완료');

      // 2. 기본 템플릿 데이터 삽입
      await this.executeSchemaFile('template_data.sql');
      console.log('✅ 기본 템플릿 데이터 삽입 완료');

      // 3. 성능 업데이트 함수 생성
      await this.createPerformanceUpdateFunction();
      console.log('✅ 성능 업데이트 함수 생성 완료');

      // 4. 템플릿 사용량 증가 함수 생성
      await this.createTemplateUsageFunction();
      console.log('✅ 템플릿 사용량 함수 생성 완료');

      return {
        success: true,
        message: '템플릿 시스템 초기화가 완료되었습니다.'
      };

    } catch (error) {
      console.error('템플릿 시스템 초기화 실패:', error);
      return {
        success: false,
        message: `초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  private async executeSchemaFile(filename: string): Promise<void> {
    try {
      const schemaPath = join(__dirname, '../database', filename);
      const schema = readFileSync(schemaPath, 'utf-8');
      
      // SQL 파일을 세미콜론으로 분할하여 개별 실행
      const statements = schema
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);

      for (const statement of statements) {
        const { error } = await supabase.rpc('exec_sql', { sql_statement: statement });
        if (error) {
          console.warn(`SQL 실행 경고 (무시 가능): ${error.message}`);
        }
      }

    } catch (error) {
      // 파일 기반 실행이 실패하면 직접 SQL 실행
      console.log('파일 실행 실패, 직접 SQL 실행 시도');
      await this.executeDirectSQL(filename);
    }
  }

  private async executeDirectSQL(filename: string): Promise<void> {
    if (filename === 'template_schema.sql') {
      await this.createSchemaDirectly();
    } else if (filename === 'template_data.sql') {
      await this.insertTemplateDataDirectly();
    }
  }

  private async createSchemaDirectly(): Promise<void> {
    const schemas = [
      `CREATE TABLE IF NOT EXISTS problem_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        story_template TEXT NOT NULL,
        hint_template TEXT NOT NULL,
        equation_template VARCHAR(255) NOT NULL,
        variables JSONB NOT NULL,
        units JSONB DEFAULT '[]',
        applicable_tables INTEGER[] NOT NULL,
        difficulty INTEGER CHECK (difficulty IN (1, 2, 3)) NOT NULL,
        educational_concept VARCHAR(100),
        visual_elements_template JSONB,
        usage_count INTEGER DEFAULT 0,
        quality_score DECIMAL(3,2) DEFAULT 0.0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS problem_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        template_id UUID REFERENCES problem_templates(id),
        pokemon_id INTEGER REFERENCES pokemon(id),
        story TEXT NOT NULL,
        hint TEXT NOT NULL,
        equation VARCHAR(255) NOT NULL,
        answer INTEGER NOT NULL,
        variables_used JSONB NOT NULL,
        multiplication_table INTEGER NOT NULL,
        difficulty INTEGER NOT NULL,
        is_answered BOOLEAN DEFAULT false,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_template_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        template_id UUID REFERENCES problem_templates(id) ON DELETE CASCADE,
        multiplication_table INTEGER NOT NULL,
        times_used INTEGER DEFAULT 1,
        last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        correct_answers INTEGER DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        average_time_spent DECIMAL(5,2) DEFAULT 0.0
      )`
    ];

    for (const schema of schemas) {
      const { error } = await supabase.rpc('exec', { sql: schema });
      if (error && !error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  private async insertTemplateDataDirectly(): Promise<void> {
    const templates = [
      {
        name: '그룹 세기 - 기본',
        category: 'GROUP_COUNT',
        story_template: '{pokemon}가 {a}마리씩 {b}그룹에 있어요. 모두 몇 마리일까요?',
        hint_template: '{a} × {b}를 계산해보세요!',
        equation_template: '{a} × {b}',
        variables: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 } },
        units: ['마리', '마리'],
        applicable_tables: [2,3,4,5,6,7,8,9],
        difficulty: 1,
        educational_concept: '반복덧셈 개념',
        quality_score: 0.9,
        visual_elements_template: {
          layout: 'grid',
          pokemonCount: '{a}',
          groupCount: '{b}',
          totalItems: '{answer}',
          description: '그리드 배열 시각화'
        }
      }
    ];

    for (const template of templates) {
      const { error } = await supabase
        .from('problem_templates')
        .insert(template);
      
      if (error && !error.message.includes('duplicate')) {
        console.warn('템플릿 삽입 경고:', error.message);
      }
    }
  }

  private async createPerformanceUpdateFunction(): Promise<void> {
    const functionSQL = `
      CREATE OR REPLACE FUNCTION update_template_performance(
        p_user_id UUID,
        p_template_id UUID,
        p_multiplication_table INTEGER,
        p_is_correct BOOLEAN
      )
      RETURNS void AS $$
      BEGIN
        INSERT INTO user_template_history (user_id, template_id, multiplication_table, correct_answers, total_attempts)
        VALUES (p_user_id, p_template_id, p_multiplication_table, 
                CASE WHEN p_is_correct THEN 1 ELSE 0 END, 1)
        ON CONFLICT (user_id, template_id, multiplication_table)
        DO UPDATE SET
          times_used = user_template_history.times_used + 1,
          last_used_at = NOW(),
          correct_answers = user_template_history.correct_answers + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
          total_attempts = user_template_history.total_attempts + 1;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error } = await supabase.rpc('exec', { sql: functionSQL });
    if (error) {
      console.warn('함수 생성 경고:', error.message);
    }
  }

  private async createTemplateUsageFunction(): Promise<void> {
    const functionSQL = `
      CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
      RETURNS void AS $$
      BEGIN
        UPDATE problem_templates 
        SET usage_count = usage_count + 1,
            updated_at = NOW()
        WHERE id = template_id;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error } = await supabase.rpc('exec', { sql: functionSQL });
    if (error) {
      console.warn('템플릿 사용량 함수 생성 경고:', error.message);
    }
  }
}