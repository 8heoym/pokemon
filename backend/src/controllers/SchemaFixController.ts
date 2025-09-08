import { Request, Response } from 'express';
import { DirectSchemaUpdater } from '../utils/directSchemaUpdate';

export class SchemaFixController {
  private schemaUpdater: DirectSchemaUpdater;

  constructor() {
    this.schemaUpdater = new DirectSchemaUpdater();
  }

  /**
   * 현재 스키마 상태 검사
   */
  async inspectSchema(req: Request, res: Response) {
    try {
      const result = await this.schemaUpdater.inspectCurrentSchema();
      res.json(result);
    } catch (error) {
      console.error('스키마 검사 실패:', error);
      res.status(500).json({ 
        success: false, 
        message: '스키마 검사 중 오류가 발생했습니다.' 
      });
    }
  }

  /**
   * RPC 함수들 테스트
   */
  async testRPCs(req: Request, res: Response) {
    try {
      const result = await this.schemaUpdater.tryAlternativeRPCs();
      res.json(result);
    } catch (error) {
      console.error('RPC 테스트 실패:', error);
      res.status(500).json({ 
        success: false, 
        message: 'RPC 테스트 중 오류가 발생했습니다.' 
      });
    }
  }

  /**
   * Phase 2 컬럼 개별 추가
   */
  async addColumnsIndividually(req: Request, res: Response) {
    try {
      const result = await this.schemaUpdater.addPhase2ColumnsIndividually();
      res.json(result);
    } catch (error) {
      console.error('컬럼 추가 실패:', error);
      res.status(500).json({ 
        success: false, 
        message: '컬럼 추가 중 오류가 발생했습니다.' 
      });
    }
  }

  /**
   * Workaround 서비스 생성
   */
  async createWorkaround(req: Request, res: Response) {
    try {
      const result = await this.schemaUpdater.createWorkaroundService();
      res.json(result);
    } catch (error) {
      console.error('Workaround 생성 실패:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Workaround 생성 중 오류가 발생했습니다.' 
      });
    }
  }

  /**
   * 모든 해결 방안을 순차적으로 시도
   */
  async fixSchemaComprehensive(req: Request, res: Response) {
    try {
      console.log('🚀 포괄적 스키마 수정 시작...');
      const results: any[] = [];

      // 1단계: 현재 스키마 검사
      console.log('1️⃣ 스키마 검사...');
      const inspectionResult = await this.schemaUpdater.inspectCurrentSchema();
      results.push({ step: 'schema_inspection', ...inspectionResult });

      // 2단계: RPC 함수 테스트
      console.log('2️⃣ RPC 함수 테스트...');
      const rpcResult = await this.schemaUpdater.tryAlternativeRPCs();
      results.push({ step: 'rpc_test', ...rpcResult });

      // 3단계: 컬럼 개별 추가 시도 (RPC가 작동하는 경우)
      if (rpcResult.success) {
        console.log('3️⃣ 컬럼 개별 추가...');
        const columnResult = await this.schemaUpdater.addPhase2ColumnsIndividually();
        results.push({ step: 'add_columns', ...columnResult });
      }

      // 4단계: Workaround 서비스 준비
      console.log('4️⃣ Workaround 서비스 준비...');
      const workaroundResult = await this.schemaUpdater.createWorkaroundService();
      results.push({ step: 'workaround_setup', ...workaroundResult });

      // 전체 성공 여부 판정
      const overallSuccess = results.some(r => r.success);
      const successfulSteps = results.filter(r => r.success).length;

      console.log(`✅ 포괄적 수정 완료: ${successfulSteps}/${results.length} 단계 성공`);

      res.json({
        success: overallSuccess,
        message: `포괄적 스키마 수정 완료: ${successfulSteps}/${results.length} 단계 성공`,
        steps: results,
        summary: {
          total_steps: results.length,
          successful_steps: successfulSteps,
          overall_success: overallSuccess
        }
      });

    } catch (error: any) {
      console.error('❌ 포괄적 스키마 수정 실패:', error);
      res.status(500).json({ 
        success: false, 
        message: `포괄적 수정 실패: ${error.message}`,
        steps: [],
        summary: {
          total_steps: 0,
          successful_steps: 0,
          overall_success: false
        }
      });
    }
  }
}