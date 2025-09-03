import { supabase } from '../config/supabase';
import { Pokemon } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ProblemTemplate {
  id: string;
  name: string;
  category: string;
  storyTemplate: string;
  hintTemplate: string;
  equationTemplate: string;
  variables: {
    [key: string]: {
      min: number;
      max: number;
    };
  };
  units: string[];
  applicableTables: number[];
  difficulty: 1 | 2 | 3;
  educationalConcept?: string;
  visualElementsTemplate?: any;
  qualityScore: number;
  isActive: boolean;
}

export interface RenderedProblem {
  id: string;
  story: string;
  hint: string;
  equation: string;
  answer: number;
  multiplicationTable: number;
  pokemonId: number;
  difficulty: 1 | 2 | 3;
  templateId: string;
  variablesUsed: { [key: string]: any };
  visualElements?: any;
}

export class ProblemTemplateService {

  async createTemplate(template: Omit<ProblemTemplate, 'id'>): Promise<ProblemTemplate> {
    try {
      const { data, error } = await supabase
        .from('problem_templates')
        .insert({
          name: template.name,
          category: template.category,
          story_template: template.storyTemplate,
          hint_template: template.hintTemplate,
          equation_template: template.equationTemplate,
          variables: template.variables,
          units: template.units,
          applicable_tables: template.applicableTables,
          difficulty: template.difficulty,
          educational_concept: template.educationalConcept,
          visual_elements_template: template.visualElementsTemplate,
          quality_score: template.qualityScore,
          is_active: template.isActive
        })
        .select()
        .single();

      if (error) throw error;

      return this.convertToTemplateType(data);
    } catch (error) {
      console.error('템플릿 생성 실패:', error);
      throw error;
    }
  }

  async getAvailableTemplates(
    multiplicationTable: number, 
    difficulty: 1 | 2 | 3,
    userId?: string
  ): Promise<ProblemTemplate[]> {
    try {
      let query = supabase
        .from('problem_templates')
        .select('*')
        .contains('applicable_tables', [multiplicationTable])
        .eq('difficulty', difficulty)
        .eq('is_active', true)
        .order('quality_score', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;

      let templates = this.convertToTemplateTypes(data || []);

      // 사용자가 있는 경우, 최근 사용한 템플릿 제외
      if (userId) {
        templates = await this.filterRecentlyUsedTemplates(templates, userId, multiplicationTable);
      }

      return templates;
    } catch (error) {
      console.error('사용 가능한 템플릿 조회 실패:', error);
      throw error;
    }
  }

  async renderProblem(
    template: ProblemTemplate,
    pokemon: Pokemon,
    multiplicationTable: number,
    userId: string
  ): Promise<RenderedProblem> {
    try {
      // 1. 변수 생성 (구구단에 맞춰서)
      const variables = this.generateVariables(template, multiplicationTable);
      
      // 2. 템플릿 렌더링
      const renderedContent = this.renderTemplateContent(template, pokemon, variables);
      
      // 3. 문제 인스턴스 생성
      const problemInstance: RenderedProblem = {
        id: uuidv4(),
        story: renderedContent.story,
        hint: renderedContent.hint,
        equation: renderedContent.equation,
        answer: renderedContent.answer,
        multiplicationTable,
        pokemonId: pokemon.id,
        difficulty: template.difficulty,
        templateId: template.id,
        variablesUsed: variables,
        visualElements: this.renderVisualElements(template.visualElementsTemplate, variables, pokemon)
      };

      // 4. 세션에 저장 (30분 TTL)
      await this.saveToSession(userId, problemInstance);

      // 5. 사용 이력 업데이트
      await this.updateTemplateUsage(template.id, userId, multiplicationTable);

      return problemInstance;
    } catch (error) {
      console.error('문제 렌더링 실패:', error);
      throw error;
    }
  }

  private generateVariables(template: ProblemTemplate, multiplicationTable: number): { [key: string]: any } {
    const variables: { [key: string]: any } = {};
    
    // multiplicationTable을 포함하는 변수 조합 생성
    for (const [varName, config] of Object.entries(template.variables)) {
      if (varName === 'a') {
        // 'a' 변수는 구구단 숫자로 고정
        variables[varName] = multiplicationTable;
      } else if (varName === 'b') {
        // 'b' 변수는 범위 내에서 랜덤
        variables[varName] = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      } else {
        // 기타 변수들
        variables[varName] = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      }
    }

    // 답 계산
    variables.answer = variables.a * variables.b;
    
    // 단위 선택 (랜덤)
    if (template.units && template.units.length > 0) {
      variables.unit = template.units[Math.floor(Math.random() * template.units.length)];
    }

    return variables;
  }

  private renderTemplateContent(
    template: ProblemTemplate, 
    pokemon: Pokemon, 
    variables: { [key: string]: any }
  ): { story: string; hint: string; equation: string; answer: number } {
    
    // 템플릿 변수 치환
    const replacements = {
      ...variables,
      pokemon: pokemon.koreanName,
      pokemonName: pokemon.name
    };

    let story = template.storyTemplate;
    let hint = template.hintTemplate;
    let equation = template.equationTemplate;

    // 변수 치환
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      story = story.replace(regex, String(value));
      hint = hint.replace(regex, String(value));
      equation = equation.replace(regex, String(value));
    }

    return {
      story,
      hint,
      equation,
      answer: variables.answer
    };
  }

  private renderVisualElements(template: any, variables: any, pokemon: Pokemon): any {
    if (!template) return null;

    const rendered = JSON.parse(JSON.stringify(template));
    
    // 시각적 요소에도 변수 적용
    for (const [key, value] of Object.entries(rendered)) {
      if (typeof value === 'string') {
        for (const [varName, varValue] of Object.entries(variables)) {
          const regex = new RegExp(`\\{${varName}\\}`, 'g');
          rendered[key] = rendered[key].replace(regex, String(varValue));
        }
      }
    }

    return rendered;
  }

  async saveToSession(userId: string, problem: RenderedProblem): Promise<void> {
    try {
      // 기존 세션 삭제 (사용자당 하나만)
      await supabase
        .from('problem_instances')
        .delete()
        .eq('user_id', userId)
        .eq('is_answered', false);

      // 새 세션 저장
      const { error } = await supabase
        .from('problem_instances')
        .insert({
          id: problem.id,
          user_id: userId,
          template_id: problem.templateId,
          pokemon_id: problem.pokemonId,
          story: problem.story,
          hint: problem.hint,
          equation: problem.equation,
          answer: problem.answer,
          variables_used: problem.variablesUsed,
          multiplication_table: problem.multiplicationTable,
          difficulty: problem.difficulty,
          expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30분 후
        });

      if (error) throw error;
    } catch (error) {
      console.error('세션 저장 실패:', error);
      throw error;
    }
  }

  async getProblemFromSession(userId: string, problemId: string): Promise<RenderedProblem | null> {
    try {
      const { data, error } = await supabase
        .from('problem_instances')
        .select('*')
        .eq('id', problemId)
        .eq('user_id', userId)
        .eq('is_answered', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.convertToRenderedProblem(data);
    } catch (error) {
      console.error('세션 문제 조회 실패:', error);
      return null;
    }
  }

  async markProblemAnswered(problemId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('problem_instances')
        .update({ is_answered: true })
        .eq('id', problemId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('문제 답변 완료 표시 실패:', error);
      throw error;
    }
  }

  private async filterRecentlyUsedTemplates(
    templates: ProblemTemplate[], 
    userId: string, 
    multiplicationTable: number
  ): Promise<ProblemTemplate[]> {
    try {
      const recentlyUsedCutoff = new Date();
      recentlyUsedCutoff.setDate(recentlyUsedCutoff.getDate() - 7); // 1주일

      const { data, error } = await supabase
        .from('user_template_history')
        .select('template_id')
        .eq('user_id', userId)
        .eq('multiplication_table', multiplicationTable)
        .gte('last_used_at', recentlyUsedCutoff.toISOString());

      if (error) throw error;

      const recentlyUsedIds = new Set(data.map(record => record.template_id));
      
      return templates.filter(template => !recentlyUsedIds.has(template.id));
    } catch (error) {
      console.error('최근 사용 템플릿 필터링 실패:', error);
      return templates; // 오류 시 전체 반환
    }
  }

  private async updateTemplateUsage(
    templateId: string, 
    userId: string, 
    multiplicationTable: number
  ): Promise<void> {
    try {
      // Upsert 방식으로 사용 이력 업데이트
      const { error } = await supabase
        .from('user_template_history')
        .upsert({
          user_id: userId,
          template_id: templateId,
          multiplication_table: multiplicationTable,
          times_used: 1,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,template_id,multiplication_table',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // 전체 사용 횟수 증가 (RPC로 처리)
      await supabase.rpc('increment_template_usage', { template_id: templateId });

    } catch (error) {
      console.error('템플릿 사용 이력 업데이트 실패:', error);
    }
  }

  private convertToTemplateType(data: any): ProblemTemplate {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      storyTemplate: data.story_template,
      hintTemplate: data.hint_template,
      equationTemplate: data.equation_template,
      variables: data.variables,
      units: data.units || [],
      applicableTables: data.applicable_tables,
      difficulty: data.difficulty,
      educationalConcept: data.educational_concept,
      visualElementsTemplate: data.visual_elements_template,
      qualityScore: parseFloat(data.quality_score) || 0.0,
      isActive: data.is_active
    };
  }

  private convertToTemplateTypes(dataArray: any[]): ProblemTemplate[] {
    return dataArray.map(data => this.convertToTemplateType(data));
  }

  private convertToRenderedProblem(data: any): RenderedProblem {
    return {
      id: data.id,
      story: data.story,
      hint: data.hint,
      equation: data.equation,
      answer: data.answer,
      multiplicationTable: data.multiplication_table,
      pokemonId: data.pokemon_id,
      difficulty: data.difficulty,
      templateId: data.template_id,
      variablesUsed: data.variables_used,
      visualElements: data.visual_elements_template
    };
  }
}