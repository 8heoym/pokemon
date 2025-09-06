/**
 * 🏗️ BaseGameService - 추상 서비스 클래스
 * 
 * 모든 게임 서비스 클래스들의 공통 기능을 제공하여 코드 중복을 제거:
 * - 로깅 및 에러 핸들링
 * - 공통 유틸리티 메서드
 * - 설정 관리
 * - 성능 모니터링
 */

import { GameCalculations } from '../utils/GameCalculations';
import { SESSION_CONFIG, DEV_CONFIG, API_CONFIG } from '../utils/gameConstants';

export interface ServiceOptions {
  enableLogging?: boolean;
  enablePerformanceMonitoring?: boolean;
  timeout?: number;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration?: number;
}

export abstract class BaseGameService {
  protected serviceName: string;
  protected options: ServiceOptions;

  constructor(serviceName: string, options: ServiceOptions = {}) {
    this.serviceName = serviceName;
    this.options = {
      enableLogging: DEV_CONFIG.ENABLE_CONSOLE_LOGS,
      enablePerformanceMonitoring: DEV_CONFIG.PERFORMANCE_MONITORING,
      timeout: API_CONFIG.TIMEOUT,
      ...options
    };
  }

  /**
   * 🔍 통합 로깅 시스템
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.options.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.serviceName}] ${message}`;

    switch (level) {
      case 'info':
        console.log(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');
        break;
    }
  }

  /**
   * ⚡ 성능 모니터링 래퍼
   */
  protected async measurePerformance<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<ServiceResult<T>> {
    const startTime = Date.now();

    try {
      this.log('info', `${operationName} 시작`);

      const result = await operation();
      const duration = Date.now() - startTime;

      this.log('info', `${operationName} 완료 (${duration}ms)`, result);

      return {
        success: true,
        data: result,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

      this.log('error', `${operationName} 실패 (${duration}ms)`, errorMessage);

      return {
        success: false,
        error: errorMessage,
        duration
      };
    }
  }

  /**
   * 🛡️ 안전한 비동기 실행
   */
  protected async safeExecute<T>(
    operation: () => Promise<T>,
    fallback?: T
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.log('error', '안전한 실행 중 오류 발생', error);
      return fallback || null;
    }
  }

  /**
   * ⏱️ 타임아웃이 적용된 실행
   */
  protected async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = this.options.timeout || API_CONFIG.TIMEOUT
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`작업이 ${timeoutMs}ms 내에 완료되지 않았습니다`));
      }, timeoutMs);

      operation()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  /**
   * 🔄 재시도 로직
   */
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error = new Error('재시도 작업 실패');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        this.log('warn', `재시도 ${attempt}/${maxRetries} 실패`, lastError.message);

        if (attempt < maxRetries) {
          await this.sleep(delayMs);
          delayMs *= 2; // 지수 백오프
        }
      }
    }

    throw lastError;
  }

  /**
   * ⏰ 지연 실행 유틸리티
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🧮 공통 게임 계산 메서드들
   */
  protected calculateUserLevel(experience: number): number {
    return GameCalculations.calculateLevel(experience);
  }

  protected calculateExperienceGain(rarity: string): number {
    return GameCalculations.calculateExperienceGain(rarity);
  }

  protected calculateCatchProbability(rarity: string, userLevel: number): number {
    return GameCalculations.calculateCatchProbability(rarity, userLevel);
  }

  /**
   * 📊 데이터 검증 유틸리티
   */
  protected validateUserId(userId: string): boolean {
    return typeof userId === 'string' && userId.length > 0;
  }

  protected validateTableNumber(table: number): boolean {
    return Number.isInteger(table) && table >= 0 && table <= 9;
  }

  protected validateDifficulty(difficulty: number): boolean {
    return [1, 2, 3].includes(difficulty);
  }

  /**
   * 🎯 공통 응답 포맷터
   */
  protected createSuccessResponse<T>(data: T, message?: string): ServiceResult<T> {
    return {
      success: true,
      data,
      ...(message && { message })
    };
  }

  protected createErrorResponse(error: string): ServiceResult<never> {
    return {
      success: false,
      error
    };
  }

  /**
   * 🧹 리소스 정리
   */
  protected async cleanup(): Promise<void> {
    this.log('info', '서비스 리소스 정리 시작');
    // 하위 클래스에서 구현
  }

  /**
   * 📈 메트릭 수집
   */
  protected recordMetric(metricName: string, value: number): void {
    if (!this.options.enablePerformanceMonitoring) return;

    this.log('info', `메트릭 수집: ${metricName} = ${value}`);
    // 실제 메트릭 시스템 연동은 여기서 구현
  }

  /**
   * 🔒 레이트 리미팅 검사
   */
  protected checkRateLimit(identifier: string): boolean {
    // 실제 레이트 리미팅 로직은 하위 클래스에서 구현
    return true;
  }

  /**
   * 💾 캐시 관련 유틸리티
   */
  protected generateCacheKey(...parts: (string | number)[]): string {
    return parts.map(p => String(p)).join(':');
  }

  protected getCacheExpiry(type: 'short' | 'medium' | 'long'): number {
    const expiries = {
      short: 5 * 60 * 1000,      // 5분
      medium: 60 * 60 * 1000,    // 1시간  
      long: 24 * 60 * 60 * 1000  // 24시간
    };
    return expiries[type];
  }

  /**
   * 🎮 게임 로직 헬퍼
   */
  protected isValidAnswer(userAnswer: number, correctAnswer: number): boolean {
    return Number.isInteger(userAnswer) && userAnswer === correctAnswer;
  }

  protected calculateScoreBonus(timeSpent: number, hintsUsed: number): number {
    const timeBonus = Math.max(0, 30 - timeSpent); // 30초 기준
    const hintPenalty = hintsUsed * 5; // 힌트당 -5점
    return Math.max(0, timeBonus - hintPenalty);
  }

  protected selectRandomElement<T>(array: T[]): T | null {
    if (array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 📝 데이터 변환 유틸리티
   */
  protected sanitizeString(input: string, maxLength: number = 255): string {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength);
  }

  protected parseInteger(value: any, defaultValue: number = 0): number {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * 🌐 환경 설정 접근
   */
  protected getEnvVar(key: string, defaultValue?: string): string {
    return process.env[key] || defaultValue || '';
  }

  protected isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  protected isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * 🎯 추상 메서드 정의 (하위 클래스에서 구현 필수)
   */
  abstract initialize(): Promise<void>;
  abstract healthCheck(): Promise<boolean>;
}

/**
 * 🎮 GameService 전용 기본 클래스
 */
export abstract class BaseGameServiceWithUser extends BaseGameService {
  /**
   * 사용자 관련 공통 검증
   */
  protected async validateUser(userId: string): Promise<boolean> {
    if (!this.validateUserId(userId)) {
      this.log('warn', '유효하지 않은 사용자 ID', userId);
      return false;
    }
    return true;
  }

  /**
   * 사용자 권한 검사 (확장 가능)
   */
  protected async checkUserPermission(userId: string, action: string): Promise<boolean> {
    // 기본적으로 모든 액션 허용, 하위 클래스에서 오버라이드 가능
    return true;
  }

  /**
   * 사용자 통계 업데이트 알림
   */
  protected async notifyUserStatsUpdate(userId: string, type: string): Promise<void> {
    this.log('info', `사용자 통계 업데이트: ${type}`, userId);
    // 실시간 알림 시스템 연동 등
  }
}

export default BaseGameService;