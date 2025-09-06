import { Request, Response } from 'express';
import { PerformanceIndexManager } from '../utils/applyPerformanceIndexes';

export class PerformanceController {
  private indexManager: PerformanceIndexManager;

  constructor() {
    this.indexManager = new PerformanceIndexManager();
  }

  async applyOptimizations(req: Request, res: Response) {
    try {
      console.log('🚀 성능 최적화 시작...');
      
      const result = await this.indexManager.applyPerformanceIndexes();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          errors: result.errors,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error: any) {
      console.error('성능 최적화 실패:', error);
      res.status(500).json({
        error: '성능 최적화 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }

  async analyzePerformance(req: Request, res: Response) {
    try {
      console.log('📊 성능 분석 시작...');
      
      const analysis = await this.indexManager.analyzeQueryPerformance();
      const validation = await this.indexManager.validateIndexes();
      
      res.json({
        success: true,
        analysis,
        indexValidation: validation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('성능 분석 실패:', error);
      res.status(500).json({
        error: '성능 분석 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }

  async validateIndexes(req: Request, res: Response) {
    try {
      console.log('🔍 인덱스 유효성 검사 시작...');
      
      const validation = await this.indexManager.validateIndexes();
      
      res.json({
        success: true,
        validation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('인덱스 검사 실패:', error);
      res.status(500).json({
        error: '인덱스 유효성 검사 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }

  async getOptimizationStatus(req: Request, res: Response) {
    try {
      const validation = await this.indexManager.validateIndexes();
      const analysis = await this.indexManager.analyzeQueryPerformance();
      
      // 성능 개선 현황 요약
      const status = {
        indexesApplied: validation.details.filter(d => d.status === 'exists').length,
        totalIndexes: validation.details.length,
        indexHealth: validation.valid ? 'healthy' : 'needs_attention',
        recommendations: analysis.recommendations,
        lastChecked: new Date().toISOString()
      };
      
      res.json({
        success: true,
        status,
        details: {
          indexDetails: validation.details,
          performanceMetrics: analysis
        }
      });
      
    } catch (error: any) {
      console.error('최적화 상태 조회 실패:', error);
      res.status(500).json({
        error: '최적화 상태 조회 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }
}