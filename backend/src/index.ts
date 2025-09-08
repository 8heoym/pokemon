import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { connectDB } from './config/database'; // MongoDB는 사용하지 않음
import { SupabasePokemonService } from './services/SupabasePokemonService';
import { SimpleProblemController } from './controllers/SimpleProblemController';
import { SimpleGameController } from './controllers/SimpleGameController';
import { PerformanceController } from './controllers/PerformanceController';
import { SessionController } from './controllers/SessionController';
import { MotivationController } from './controllers/MotivationController';
import { DatabaseSchemaUpdater } from './utils/updateDatabaseSchema';
import { PokemonImageDownloader } from './utils/imageDownloader';
import { TemplateSystemInitializer } from './utils/initializeTemplateSystem';
import { SchemaFixController } from './controllers/SchemaFixController';
import { CompatibilityMotivationController } from './controllers/CompatibilityMotivationController';

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 서비스 및 컨트롤러 인스턴스
const pokemonService = new SupabasePokemonService();
const problemController = new SimpleProblemController();
const gameController = new SimpleGameController();
const performanceController = new PerformanceController();
const sessionController = new SessionController();
const motivationController = new MotivationController();
const schemaUpdater = new DatabaseSchemaUpdater();
const templateInitializer = new TemplateSystemInitializer();
const schemaFixController = new SchemaFixController();
const compatibilityController = new CompatibilityMotivationController();

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pokemon Math Adventure API Server', 
    version: '1.0.0',
    status: 'running'
  });
});

// 포켓몬 관련 API
app.get('/api/pokemon', async (req, res) => {
  try {
    const { table, region } = req.query;
    
    if (table) {
      const tableNum = parseInt(table as string);
      const pokemon = await pokemonService.getPokemonByMultiplicationTable(tableNum);
      res.json(pokemon);
    } else if (region) {
      const pokemon = await pokemonService.getPokemonByRegion(region as string);
      res.json(pokemon);
    } else {
      const stats = await pokemonService.getPokemonStats();
      res.json({ message: '포켓몬 도감 API', stats });
    }
  } catch (error) {
    res.status(500).json({ error: '포켓몬 도감 조회 중 오류가 발생했습니다.' });
  }
});

// 페이지네이션된 포켓몬 조회 API
app.get('/api/pokemon/paginated', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // 최대 100개까지
    const filterType = req.query.filter as string;
    const region = req.query.region as string;
    const rarity = req.query.rarity as string;
    
    let filter: any = {};
    
    if (region) filter.region = region;
    if (rarity) filter.rarity = rarity;
    
    const result = await pokemonService.getPokemonWithPagination(page, limit, filter);
    res.json(result);
  } catch (error) {
    console.error('페이지네이션 포켓몬 조회 실패:', error);
    res.status(500).json({ error: '페이지네이션 포켓몬 조회 실패' });
  }
});

app.get('/api/pokemon/stats', async (req, res) => {
  try {
    const stats = await pokemonService.getPokemonStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '포켓몬 통계 조회 실패' });
  }
});

app.get('/api/pokemon/table/:table', async (req, res) => {
  try {
    const table = parseInt(req.params.table);
    if (table < 0 || table > 9) {
      return res.status(400).json({ error: '유효하지 않은 구구단입니다.' });
    }
    
    const pokemon = await pokemonService.getPokemonByMultiplicationTable(table);
    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: '포켓몬 조회 실패' });
  }
});

app.get('/api/pokemon/region/:region', async (req, res) => {
  try {
    const region = req.params.region;
    const pokemon = await pokemonService.getPokemonByRegion(region);
    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: '지역별 포켓몬 조회 실패' });
  }
});

app.get('/api/pokemon/random/:table', async (req, res) => {
  try {
    const table = parseInt(req.params.table);
    const rarity = req.query.rarity as string;
    
    const pokemon = await pokemonService.getRandomPokemonByTable(table, rarity);
    if (!pokemon) {
      return res.status(404).json({ error: '해당 조건의 포켓몬이 없습니다.' });
    }
    
    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: '랜덤 포켓몬 조회 실패' });
  }
});

app.get('/api/pokemon/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pokemon = await pokemonService.getPokemonById(id);
    
    if (!pokemon) {
      return res.status(404).json({ error: '포켓몬을 찾을 수 없습니다.' });
    }
    
    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: '포켓몬 조회 실패' });
  }
});

// 포켓몬 데이터베이스 초기화 API
app.post('/api/pokemon/initialize', async (req, res) => {
  try {
    const result = await pokemonService.initializePokemonDatabase();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: '데이터베이스 초기화 실패' });
  }
});

// 템플릿 시스템 초기화 API
app.post('/api/templates/initialize', async (req, res) => {
  try {
    const result = await templateInitializer.initializeDatabase();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '템플릿 시스템 초기화 실패' });
  }
});

// 포켓몬 이름 수정 API
app.post('/api/pokemon/fix-names', async (req, res) => {
  try {
    const result = await pokemonService.fixPokemonNames();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '포켓몬 이름 수정 실패' });
  }
});

// 개별 포켓몬 업데이트 API
app.patch('/api/pokemon/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedPokemon = await pokemonService.updatePokemon(id, updates);
    if (!updatedPokemon) {
      return res.status(404).json({ error: '포켓몬을 찾을 수 없습니다.' });
    }
    
    res.json(updatedPokemon);
  } catch (error) {
    res.status(500).json({ error: '포켓몬 업데이트 실패' });
  }
});

// 포켓몬 크롤링 및 저장 API
app.post('/api/pokemon/crawl-and-save', async (req, res) => {
  try {
    console.log('포켓몬 크롤링 API 호출됨');
    const result = await pokemonService.crawlAndSavePokemon();
    res.json(result);
  } catch (error) {
    console.error('크롤링 API 오류:', error);
    res.status(500).json({ error: '포켓몬 크롤링 및 저장 실패' });
  }
});

// 포켓몬 이미지 다운로드 API
app.post('/api/pokemon/download-images', async (req, res) => {
  try {
    console.log('포켓몬 이미지 다운로드 API 호출됨');
    const downloader = new PokemonImageDownloader();
    
    // Get current stats
    const beforeStats = await downloader.getDownloadStats();
    console.log('다운로드 전 상태:', beforeStats);
    
    // Download images
    await downloader.downloadAllPokemonImages();
    
    // Get final stats
    const afterStats = await downloader.getDownloadStats();
    console.log('다운로드 후 상태:', afterStats);
    
    res.json({
      success: true,
      message: '포켓몬 이미지 다운로드 완료',
      before: beforeStats,
      after: afterStats,
      downloaded: afterStats.withImages - beforeStats.withImages
    });
    
  } catch (error) {
    console.error('이미지 다운로드 API 오류:', error);
    res.status(500).json({ 
      error: '포켓몬 이미지 다운로드 실패',
      message: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// 포켓몬 이미지 다운로드 상태 조회 API
app.get('/api/pokemon/download-stats', async (req, res) => {
  try {
    const downloader = new PokemonImageDownloader();
    const stats = await downloader.getDownloadStats();
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('다운로드 상태 조회 오류:', error);
    res.status(500).json({ error: '다운로드 상태 조회 실패' });
  }
});

// 개별 포켓몬 이미지 조회 API
app.get('/api/pokemon/:id/image', async (req, res) => {
  try {
    const pokemonId = parseInt(req.params.id);
    const downloader = new PokemonImageDownloader();
    
    const imageBuffer = await downloader.getPokemonImage(pokemonId);
    
    if (!imageBuffer) {
      return res.status(404).json({ error: '이미지를 찾을 수 없습니다.' });
    }
    
    // Set appropriate headers for image response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', imageBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('포켓몬 이미지 조회 오류:', error);
    res.status(500).json({ error: '이미지 조회 실패' });
  }
});

// 문제 관련 API 라우트
app.post('/api/problems/generate', (req, res) => problemController.generateProblem(req, res));
app.post('/api/problems/submit', (req, res) => problemController.submitAnswer(req, res));
app.get('/api/problems/:problemId/hint/:userId', (req, res) => problemController.getHint(req, res));
app.get('/api/users/:userId/progress', (req, res) => problemController.getUserProgress(req, res));

// 게임 관련 API 라우트
app.post('/api/users', (req, res) => gameController.createUser(req, res));
app.get('/api/users/:userId', (req, res) => gameController.getUser(req, res));
app.post('/api/users/:userId/catch', (req, res) => gameController.catchPokemon(req, res));
app.get('/api/users/:userId/pokedex', (req, res) => gameController.getPokedex(req, res));
app.get('/api/users/:userId/pokedex/paginated', (req, res) => gameController.getPokedexPaginated(req, res));
app.get('/api/users/:userId/stats', (req, res) => gameController.getUserStats(req, res));
app.get('/api/leaderboard', (req, res) => gameController.getLeaderboard(req, res));
app.post('/api/pokemon/batch', (req, res) => gameController.getPokemonByIds(req, res));

// 성능 최적화 관련 API 라우트
app.post('/api/performance/optimize', (req, res) => performanceController.applyOptimizations(req, res));
app.get('/api/performance/analyze', (req, res) => performanceController.analyzePerformance(req, res));
app.get('/api/performance/indexes', (req, res) => performanceController.validateIndexes(req, res));
app.get('/api/performance/status', (req, res) => performanceController.getOptimizationStatus(req, res));

// 세션 캐시 관리 API 라우트
app.get('/api/session/stats', (req, res) => sessionController.getSessionStats(req, res));
app.get('/api/session/user/:userId', (req, res) => sessionController.getUserSessions(req, res));
app.post('/api/session/cleanup', (req, res) => sessionController.cleanupSessions(req, res));
app.delete('/api/session/user/:userId', (req, res) => sessionController.clearUserSessions(req, res));
app.delete('/api/session/all', (req, res) => sessionController.clearAllSessions(req, res));
app.get('/api/session/test', (req, res) => sessionController.performanceTest(req, res));

// Phase 2: Motivation System API 라우트
app.post('/api/users/:userId/streak', (req, res) => motivationController.updateStreak(req, res));
app.post('/api/users/:userId/daily-bonus', (req, res) => motivationController.claimDailyBonus(req, res));
app.post('/api/users/:userId/stardust', (req, res) => motivationController.awardStarDust(req, res));
app.get('/api/users/:userId/shop', (req, res) => motivationController.getShopItems(req, res));
app.post('/api/users/:userId/purchase', (req, res) => motivationController.purchaseItem(req, res));
app.post('/api/users/:userId/badge', (req, res) => motivationController.awardBadge(req, res));
app.get('/api/users/:userId/motivation-stats', (req, res) => motivationController.getMotivationStats(req, res));

// Phase 2: Database schema update API
app.post('/api/database/update-schema', async (req, res) => {
  try {
    const result = await schemaUpdater.updateUsersTableForPhase2();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: `Schema update failed: ${error.message}` 
    });
  }
});

app.get('/api/database/schema-status', async (req, res) => {
  try {
    const status = await schemaUpdater.getMigrationStatus();
    const validation = await schemaUpdater.validatePhase2Schema();
    
    res.json({
      success: true,
      migrationStatus: status,
      validation: validation,
      ready: validation.valid
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: `Schema status check failed: ${error.message}` 
    });
  }
});

// Schema Fix API 라우트 (문제 해결 전용)
app.get('/api/schema-fix/inspect', (req, res) => schemaFixController.inspectSchema(req, res));
app.get('/api/schema-fix/test-rpcs', (req, res) => schemaFixController.testRPCs(req, res));
app.post('/api/schema-fix/add-columns', (req, res) => schemaFixController.addColumnsIndividually(req, res));
app.post('/api/schema-fix/workaround', (req, res) => schemaFixController.createWorkaround(req, res));
app.post('/api/schema-fix/comprehensive', (req, res) => schemaFixController.fixSchemaComprehensive(req, res));

// Compatibility Mode API 라우트 (스키마 변경 없이 Phase 2 기능)
app.post('/api/compat/users/:userId/streak', (req, res) => compatibilityController.updateStreak(req, res));
app.post('/api/compat/users/:userId/daily-bonus', (req, res) => compatibilityController.claimDailyBonus(req, res));
app.post('/api/compat/users/:userId/stardust', (req, res) => compatibilityController.awardStarDust(req, res));
app.get('/api/compat/users/:userId/shop', (req, res) => compatibilityController.getShopItems(req, res));
app.post('/api/compat/users/:userId/purchase', (req, res) => compatibilityController.purchaseItem(req, res));
app.post('/api/compat/users/:userId/badge', (req, res) => compatibilityController.awardBadge(req, res));
app.get('/api/compat/users/:userId/motivation-stats', (req, res) => compatibilityController.getMotivationStats(req, res));
app.get('/api/compat/status', (req, res) => compatibilityController.getCompatibilityStatus(req, res));

// 에러 핸들링
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

// 서버 시작
async function startServer() {
  try {
    // MongoDB 연결 (임시로 주석처리 - 데모용)
    // await connectDB();
    console.log('MongoDB 연결 건너뜀 (데모 모드)');
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API 문서: http://localhost:${PORT}/`);
    });
    
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();