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
      console.log('=== Pokedex Request Start ===');
      console.log('User ID:', userId);
      
      const user = await this.getUserById(userId);
      console.log('User found:', user ? 'YES' : 'NO');
      
      if (!user) {
        console.error('User not found for ID:', userId);
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      console.log('User caught pokemon count:', user.caughtPokemon?.length || 0);
      console.log('User caught pokemon IDs:', user.caughtPokemon);

      // 새로운 ID 기반 응답 구조: 전체 포켓몬 목록과 잡은 포켓몬 ID 목록을 분리하여 반환
      const result: any = {
        totalCaught: user.caughtPokemon?.length || 0,
        caughtPokemonIds: user.caughtPokemon || [], // 잡은 포켓몬의 ID 목록만 반환
        totalPokemon: 842, // 전체 포켓몬 수
        userInfo: {
          level: user.trainerLevel,
          region: user.currentRegion,
          completedTables: user.completedTables
        }
      };

      // 통계 정보를 위해 잡은 포켓몬의 기본 정보만 간단히 조회 (최대 100개로 제한)
      if (user.caughtPokemon && user.caughtPokemon.length > 0) {
        try {
          // 페이지네이션 방식으로 안전하게 조회
          const limit = Math.min(100, user.caughtPokemon.length);
          const { data: pokemonStats, error: statsError } = await supabase
            .from('pokemon')
            .select('id, rarity, region')
            .in('id', user.caughtPokemon.slice(0, limit));

          if (!statsError && pokemonStats) {
            const byRarity = this.groupBy(pokemonStats, 'rarity');
            const byRegion = this.groupBy(pokemonStats, 'region');
            
            // 통계 정보만 추가
            result.statistics = {
              byRarity,
              byRegion,
              statsBasedOn: pokemonStats.length // 통계 기준이 된 포켓몬 수
            };
          }
        } catch (statsError) {
          console.log('Statistics query failed, skipping stats:', statsError);
          // 통계 조회 실패해도 기본 정보는 반환
        }
      }

      console.log('=== Pokedex Request Success (ID-based) ===');
      return result;

    } catch (error: any) {
      console.error('=== Pokedex Request Error ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Full error:', error);
      console.error('==============================');
      
      // 에러 발생시에도 기본 구조는 반환
      return {
        totalCaught: 0,
        caughtPokemonIds: [],
        totalPokemon: 842,
        userInfo: null,
        error: error?.message || 'Unknown error'
      };
    }
  }

  async getPokemonByIds(pokemonIds: number[], limit: number = 50, offset: number = 0) {
    try {
      console.log(`=== Pokemon Batch Query: IDs count=${pokemonIds.length}, limit=${limit}, offset=${offset} ===`);
      
      // 요청된 ID들 중 offset부터 limit개만 처리
      const requestedIds = pokemonIds.slice(offset, offset + limit);
      
      if (requestedIds.length === 0) {
        return {
          pokemon: [],
          hasMore: false,
          total: pokemonIds.length
        };
      }

      const { data: pokemon, error } = await supabase
        .from('pokemon')
        .select('id, name, korean_name, image_url, rarity, region, characteristics')
        .in('id', requestedIds)
        .order('id');

      if (error) throw error;

      const hasMore = (offset + limit) < pokemonIds.length;

      console.log(`Pokemon batch query success: returned ${pokemon?.length || 0} pokemon, hasMore=${hasMore}`);
      
      return {
        pokemon: pokemon || [],
        hasMore,
        total: pokemonIds.length,
        returned: pokemon?.length || 0,
        offset,
        limit
      };

    } catch (error) {
      console.error('Pokemon batch query failed:', error);
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

  async getPokedexPaginated(userId: string, page: number = 1, limit: number = 50, filter: string = 'all') {
    try {
      console.log(`=== Paginated Pokedex Request: userId=${userId}, page=${page}, limit=${limit}, filter=${filter} ===`);
      
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const offset = (page - 1) * limit;
      let pokemonIds: number[] = [];
      let totalCount = 0;
      
      // 필터에 따라 포켓몬 ID 목록 결정
      switch (filter) {
        case 'caught':
          pokemonIds = user.caughtPokemon || [];
          totalCount = pokemonIds.length;
          break;
        case 'uncaught':
          const allIds = Array.from({ length: 842 }, (_, i) => i + 1);
          pokemonIds = allIds.filter(id => !user.caughtPokemon?.includes(id));
          totalCount = pokemonIds.length;
          break;
        default: // 'all'
          pokemonIds = Array.from({ length: 842 }, (_, i) => i + 1);
          totalCount = 842;
      }

      // 페이지네이션 적용
      const paginatedIds = pokemonIds.slice(offset, offset + limit);
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;

      // 포켓몬 데이터 조회 (잡은 포켓몬만 상세 정보 포함)
      let pokemonData: any[] = [];
      
      if (filter === 'caught' && paginatedIds.length > 0) {
        // 잡은 포켓몬의 경우 상세 정보 포함
        const { data: pokemon, error } = await supabase
          .from('pokemon')
          .select('*')
          .in('id', paginatedIds)
          .order('id');
        
        if (error) throw error;
        pokemonData = pokemon || [];
      } else if (filter === 'all') {
        // 전체 보기의 경우 잡은 포켓몬만 상세 정보 포함
        const caughtIds = paginatedIds.filter(id => user.caughtPokemon?.includes(id));
        
        if (caughtIds.length > 0) {
          const { data: pokemon, error } = await supabase
            .from('pokemon')
            .select('*')
            .in('id', caughtIds)
            .order('id');
          
          if (error) throw error;
          pokemonData = pokemon || [];
        }
      }

      // 응답 데이터 구성
      const entries = paginatedIds.map(pokemonId => {
        const pokemon = pokemonData.find(p => p.id === pokemonId);
        const isCaught = user.caughtPokemon?.includes(pokemonId) || false;
        
        return {
          pokemonId,
          caught: isCaught,
          pokemon: isCaught && pokemon ? {
            id: pokemon.id,
            name: pokemon.name,
            koreanName: pokemon.korean_name,
            imageUrl: pokemon.image_url,
            rarity: pokemon.rarity,
            region: pokemon.region,
            characteristics: pokemon.characteristics
          } : null
        };
      });

      console.log(`Paginated pokedex success: ${entries.length} entries, hasNextPage=${hasNextPage}`);
      
      return {
        entries,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage: page > 1,
          limit
        },
        userInfo: {
          level: user.trainerLevel,
          region: user.currentRegion,
          totalCaught: user.caughtPokemon?.length || 0,
          completedTables: user.completedTables
        }
      };

    } catch (error) {
      console.error('페이지네이션 도감 조회 실패:', error);
      throw error;
    }
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