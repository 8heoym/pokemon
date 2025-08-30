import { supabase, Database } from '../config/supabase';
import { User, UserAnswer } from '../types';
import { v4 as uuidv4 } from 'uuid';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserAnswerRow = Database['public']['Tables']['user_answers']['Row'];
type UserAnswerInsert = Database['public']['Tables']['user_answers']['Insert'];

export class SupabaseGameService {

  async createUser(nickname: string): Promise<User> {
    try {
      const userId = uuidv4();
      const userData: UserInsert = {
        id: userId,
        nickname: nickname.trim(),
        trainer_level: 1,
        current_region: '관동지방',
        completed_tables: [],
        caught_pokemon: [],
        total_experience: 0
      };

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;

      return this.convertUserToSharedType(data);
    } catch (error) {
      console.error('사용자 생성 실패:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.convertUserToSharedType(data);
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      throw error;
    }
  }

  async getUserByNickname(nickname: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('nickname', nickname)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.convertUserToSharedType(data);
    } catch (error) {
      console.error('닉네임으로 사용자 조회 실패:', error);
      return null; // 오류시 null 반환
    }
  }

  async updateUser(userId: string, updates: Partial<UserInsert>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.convertUserToSharedType(data);
    } catch (error) {
      console.error('사용자 업데이트 실패:', error);
      throw error;
    }
  }

  async catchPokemon(userId: string, pokemonId: number): Promise<{
    success: boolean;
    experienceGained: number;
    levelUp: boolean;
    newLevel?: number;
    pokemon?: any;
  }> {
    try {
      // 현재 사용자 정보 조회
      const user = await this.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      // 이미 잡은 포켓몬인지 확인
      if (user.caughtPokemon.includes(pokemonId)) {
        return { success: false, experienceGained: 0, levelUp: false };
      }

      // 포켓몬 정보 조회
      const { data: pokemon, error: pokemonError } = await supabase
        .from('pokemon')
        .select('*')
        .eq('id', pokemonId)
        .single();

      if (pokemonError) throw pokemonError;

      // 희귀도에 따른 경험치 계산
      const experienceGained = this.calculateExperienceGain(pokemon.rarity);
      const newTotalExperience = user.totalExperience + experienceGained;
      const currentLevel = this.calculateLevel(user.totalExperience);
      const newLevel = this.calculateLevel(newTotalExperience);
      const levelUp = newLevel > currentLevel;

      // 사용자 업데이트
      const updatedUser = await this.updateUser(userId, {
        caught_pokemon: [...user.caughtPokemon, pokemonId],
        total_experience: newTotalExperience,
        trainer_level: newLevel
      });

      return {
        success: true,
        experienceGained,
        levelUp,
        newLevel: levelUp ? newLevel : undefined,
        pokemon
      };

    } catch (error) {
      console.error('포켓몬 잡기 실패:', error);
      throw error;
    }
  }

  async getPokedex(userId: string) {
    try {
      const user = await this.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      if (user.caughtPokemon.length === 0) {
        return {
          totalCaught: 0,
          caughtPokemon: [],
          byRarity: {},
          byRegion: {}
        };
      }

      // 잡은 포켓몬 정보 조회
      const { data: caughtPokemon, error } = await supabase
        .from('pokemon')
        .select('*')
        .in('id', user.caughtPokemon);

      if (error) throw error;

      const byRarity = this.groupBy(caughtPokemon, 'rarity');
      const byRegion = this.groupBy(caughtPokemon, 'region');

      return {
        totalCaught: caughtPokemon.length,
        caughtPokemon,
        byRarity,
        byRegion
      };

    } catch (error) {
      console.error('포켓몬 도감 조회 실패:', error);
      throw error;
    }
  }

  async getUserStats(userId: string) {
    try {
      const user = await this.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      // 사용자 답변 통계 조회
      const { data: answers, error: answersError } = await supabase
        .from('user_answers')
        .select('*')
        .eq('user_id', userId);

      if (answersError) throw answersError;

      const totalAnswers = answers.length;
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      // 구구단별 통계
      const tableStats = this.calculateTableStats(answers || []);

      return {
        user,
        problemStats: {
          totalAnswers,
          correctAnswers,
          accuracy: Math.round(accuracy * 100) / 100,
          tableStats
        }
      };

    } catch (error) {
      console.error('사용자 통계 조회 실패:', error);
      throw error;
    }
  }

  async getLeaderboard(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('nickname, trainer_level, total_experience, caught_pokemon')
        .order('total_experience', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((user, index) => ({
        rank: index + 1,
        nickname: user.nickname,
        level: user.trainer_level,
        experience: user.total_experience,
        pokemonCaught: user.caught_pokemon.length
      }));

    } catch (error) {
      console.error('리더보드 조회 실패:', error);
      throw error;
    }
  }

  async recordAnswer(answer: Omit<UserAnswer, 'id'>): Promise<UserAnswer> {
    try {
      const answerData: UserAnswerInsert = {
        id: uuidv4(),
        user_id: answer.userId,
        problem_id: answer.problemId,
        user_answer: answer.userAnswer,
        correct_answer: answer.correctAnswer,
        is_correct: answer.isCorrect,
        time_spent: answer.timeSpent,
        hints_used: answer.hintsUsed,
        attempted_at: answer.attemptedAt.toISOString()
      };

      const { data, error } = await supabase
        .from('user_answers')
        .insert(answerData)
        .select()
        .single();

      if (error) throw error;

      return this.convertUserAnswerToSharedType(data);
    } catch (error) {
      console.error('답변 기록 실패:', error);
      throw error;
    }
  }

  private calculateExperienceGain(rarity: string): number {
    const experienceMap: { [key: string]: number } = {
      common: 10,
      uncommon: 20,
      rare: 50,
      legendary: 100
    };
    return experienceMap[rarity] || 10;
  }

  private calculateLevel(totalExperience: number): number {
    // 레벨 = √(총 경험치 / 100) + 1
    return Math.floor(Math.sqrt(totalExperience / 100)) + 1;
  }

  private calculateTableStats(answers: UserAnswerRow[]) {
    const tableStats: { [key: number]: any } = {};
    
    // 구구단별로 그룹화
    const answersByTable = answers.reduce((acc: { [key: string]: UserAnswerRow[] }, answer) => {
      // multiplication_table은 math_problems 테이블에 있으므로 별도 조회가 필요
      // 여기서는 간단히 처리
      const tableKey = 'unknown';
      if (!acc[tableKey]) acc[tableKey] = [];
      acc[tableKey].push(answer);
      return acc;
    }, {});

    Object.entries(answersByTable).forEach(([table, tableAnswers]) => {
      const correct = tableAnswers.filter(a => a.is_correct).length;
      const total = tableAnswers.length;
      (tableStats as any)[table] = {
        correct,
        total,
        accuracy: total > 0 ? (correct / total) * 100 : 0
      };
    });

    return tableStats;
  }

  private groupBy<T>(array: T[], key: keyof T) {
    return array.reduce((result: { [key: string]: number }, item) => {
      const group = String(item[key]);
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }

  private convertUserToSharedType(userRow: UserRow): User {
    return {
      id: userRow.id,
      nickname: userRow.nickname,
      trainerLevel: userRow.trainer_level,
      currentRegion: userRow.current_region,
      completedTables: userRow.completed_tables,
      caughtPokemon: userRow.caught_pokemon,
      totalExperience: userRow.total_experience,
      createdAt: new Date(userRow.created_at)
    };
  }

  // 기존 GameService 호환 메서드들 추가
  async getUser(userId: string): Promise<User | null> {
    return this.getUserById(userId);
  }

  async updateRegionProgress(userId: string, completedTable: number) {
    try {
      const user = await this.getUserById(userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      const updatedTables = [...user.completedTables];
      if (!updatedTables.includes(completedTable)) {
        updatedTables.push(completedTable);
      }

      // 지역 업데이트 로직 (간단화)
      let newRegion = user.currentRegion;
      if (updatedTables.length >= 4) {
        newRegion = '성도지방';
      }
      if (updatedTables.length >= 8) {
        newRegion = '호연지방';
      }

      await this.updateUser(userId, {
        completed_tables: updatedTables,
        current_region: newRegion
      });

      return { success: true, newRegion };
    } catch (error) {
      console.error('지역 진행도 업데이트 실패:', error);
      throw error;
    }
  }

  async getPokdexStatus(userId: string) {
    return this.getPokedex(userId);
  }

  private convertUserAnswerToSharedType(answerRow: UserAnswerRow): UserAnswer {
    return {
      id: answerRow.id,
      userId: answerRow.user_id,
      problemId: answerRow.problem_id,
      userAnswer: answerRow.user_answer,
      correctAnswer: answerRow.correct_answer,
      isCorrect: answerRow.is_correct,
      timeSpent: answerRow.time_spent,
      hintsUsed: answerRow.hints_used,
      attemptedAt: new Date(answerRow.attempted_at)
    };
  }
}