import { UserModel } from '../models/User';
import { PokemonService } from './PokemonService';
import { LearningAnalysisService } from './LearningAnalysisService';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';
import { GameCalculations } from '../utils/GameCalculations';
import { BaseGameServiceWithUser } from './BaseGameService';

export class GameService extends BaseGameServiceWithUser {
  private pokemonService: PokemonService;
  private learningService: LearningAnalysisService;

  constructor() {
    super('GameService');
    this.pokemonService = new PokemonService();
    this.learningService = new LearningAnalysisService();
  }

  async initialize(): Promise<void> {
    this.log('info', 'GameService 초기화 시작');
    // 초기화 로직이 필요한 경우 여기에 구현
  }

  async healthCheck(): Promise<boolean> {
    try {
      // MongoDB 연결 확인 등
      return true;
    } catch (error) {
      this.log('error', '헬스체크 실패', error);
      return false;
    }
  }

  async createUser(nickname: string): Promise<User> {
    return this.measurePerformance('createUser', async () => {
      const sanitizedNickname = this.sanitizeString(nickname, 50);
      
      if (!sanitizedNickname) {
        throw new Error('유효한 닉네임이 필요합니다.');
      }

      const newUser = new UserModel({
        id: uuidv4(),
        nickname: sanitizedNickname,
        trainerLevel: 1,
        currentRegion: '관동지방',
        completedTables: [],
        caughtPokemon: [],
        totalExperience: 0,
        createdAt: new Date()
      });

      const savedUser = await newUser.save();
      
      this.recordMetric('users_created_total', 1);
      return savedUser.toObject();
    }).then(result => {
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data!;
    });
  }

  async getUser(userId: string): Promise<User | null> {
    if (!await this.validateUser(userId)) {
      return null;
    }

    return this.safeExecute(async () => {
      const user = await UserModel.findOne({ id: userId }).lean();
      this.recordMetric('users_retrieved_total', 1);
      return user;
    });
  }

  async catchPokemon(userId: string, pokemonId: number): Promise<{ success: boolean; message: string; levelUp?: boolean }> {
    try {
      const user = await UserModel.findOne({ id: userId });
      if (!user) {
        return { success: false, message: '사용자를 찾을 수 없습니다.' };
      }

      // 이미 잡은 포켓몬인지 확인
      if (user.caughtPokemon.includes(pokemonId)) {
        return { success: false, message: '이미 잡은 포켓몬입니다.' };
      }

      // 포켓몬 정보 조회
      const pokemon = await this.pokemonService.getPokemonById(pokemonId);
      if (!pokemon) {
        return { success: false, message: '포켓몬 정보를 찾을 수 없습니다.' };
      }

      // 🚀 리팩토링: GameCalculations 클래스 사용
      const experienceGained = GameCalculations.calculateExperienceGain(pokemon.rarity);
      const oldLevel = user.trainerLevel;
      const newExperience = user.totalExperience + experienceGained;
      const newLevel = GameCalculations.calculateLevel(newExperience);

      // 사용자 정보 업데이트
      user.caughtPokemon.push(pokemonId);
      user.totalExperience = newExperience;
      user.trainerLevel = newLevel;

      await user.save();

      return {
        success: true,
        message: `${pokemon.koreanName}를 잡았다! (+${experienceGained} EXP)`,
        levelUp: newLevel > oldLevel
      };

    } catch (error) {
      console.error('포켓몬 잡기 실패:', error);
      return { success: false, message: '포켓몬 잡기 중 오류가 발생했습니다.' };
    }
  }

  async updateRegionProgress(userId: string): Promise<{ regionUnlocked?: string; message: string }> {
    try {
      const user = await UserModel.findOne({ id: userId });
      if (!user) {
        return { message: '사용자를 찾을 수 없습니다.' };
      }

      // 현재 지역의 구구단 완성도 확인
      const currentRegionTables = this.getRegionTables(user.currentRegion);
      const progressSummary = await this.learningService.getUserProgressSummary(userId);
      
      const completedCurrentRegionTables = currentRegionTables.filter(table => 
        progressSummary.completedTables.includes(table)
      );

      // 현재 지역의 모든 구구단을 완료했는지 확인
      if (completedCurrentRegionTables.length === currentRegionTables.length) {
        const nextRegion = this.getNextRegion(user.currentRegion);
        
        if (nextRegion && nextRegion !== user.currentRegion) {
          user.currentRegion = nextRegion;
          await user.save();

          return {
            regionUnlocked: nextRegion,
            message: `축하합니다! ${nextRegion}이 해금되었습니다!`
          };
        }
      }

      return { message: '현재 지역에서 더 많은 구구단을 완료하세요.' };

    } catch (error) {
      console.error('지역 진행 업데이트 실패:', error);
      return { message: '지역 업데이트 중 오류가 발생했습니다.' };
    }
  }

  async getPokdexStatus(userId: string) {
    try {
      const user = await UserModel.findOne({ id: userId });
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 현재 지역의 포켓몬 목록 조회
      const regionPokemon = await this.pokemonService.getPokemonByRegion(user.currentRegion);
      
      // 잡은 포켓몬 정보
      const caughtPokemonDetails = [];
      for (const pokemonId of user.caughtPokemon) {
        const pokemon = await this.pokemonService.getPokemonById(pokemonId);
        if (pokemon) {
          caughtPokemonDetails.push(pokemon);
        }
      }

      // 지역별 완성도
      const regionCompletion = this.calculateRegionCompletion(regionPokemon, user.caughtPokemon);

      return {
        currentRegion: user.currentRegion,
        totalPokemonInRegion: regionPokemon.length,
        caughtInRegion: regionCompletion.caught,
        regionCompletionRate: regionCompletion.percentage,
        caughtPokemon: caughtPokemonDetails,
        availablePokemon: regionPokemon.map(p => ({
          id: p.id,
          name: p.koreanName,
          imageUrl: p.imageUrl,
          isCaught: user.caughtPokemon.includes(p.id),
          multiplicationTable: p.multiplicationTable,
          rarity: p.rarity
        }))
      };

    } catch (error) {
      console.error('도감 상태 조회 실패:', error);
      throw error;
    }
  }

  async getLeaderboard(): Promise<any[]> {
    try {
      const topUsers = await UserModel
        .find({})
        .sort({ trainerLevel: -1, totalExperience: -1 })
        .limit(10)
        .lean();

      return topUsers.map((user, index) => ({
        rank: index + 1,
        nickname: user.nickname,
        trainerLevel: user.trainerLevel,
        totalExperience: user.totalExperience,
        caughtPokemonCount: user.caughtPokemon.length,
        currentRegion: user.currentRegion,
        completedTablesCount: user.completedTables.length
      }));

    } catch (error) {
      console.error('리더보드 조회 실패:', error);
      throw error;
    }
  }

  // 🚀 리팩토링: 중복된 계산 메서드 제거 - GameCalculations 클래스 사용
  // calculateExperienceGain과 calculateLevel 메서드는 GameCalculations로 이동됨

  private getRegionTables(region: string): number[] {
    const regionTableMap: { [key: string]: number[] } = {
      '관동지방': [2, 5],
      '성도지방': [3, 6],
      '호연지방': [4, 8],
      '신오지방': [7, 9],
      '하나지방': [1, 0],
      '칼로스지방': [2, 3],
      '알로라지방': [4, 5],
      '가라르지방': [6, 7],
      '팔데아지방': [8, 9]
    };

    return regionTableMap[region] || [2, 5];
  }

  private getNextRegion(currentRegion: string): string | null {
    const regionOrder = [
      '관동지방', '성도지방', '호연지방', '신오지방',
      '하나지방', '칼로스지방', '알로라지방', '가라르지방', '팔데아지방'
    ];

    const currentIndex = regionOrder.indexOf(currentRegion);
    if (currentIndex >= 0 && currentIndex < regionOrder.length - 1) {
      return regionOrder[currentIndex + 1];
    }
    return null;
  }

  private calculateRegionCompletion(regionPokemon: any[], caughtPokemon: number[]) {
    const regionPokemonIds = regionPokemon.map(p => p.id);
    const caughtInRegion = caughtPokemon.filter(id => regionPokemonIds.includes(id));
    
    return {
      caught: caughtInRegion.length,
      total: regionPokemon.length,
      percentage: regionPokemon.length > 0 ? (caughtInRegion.length / regionPokemon.length) * 100 : 0
    };
  }
}