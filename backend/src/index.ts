import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { connectDB } from './config/database'; // MongoDB는 사용하지 않음
import { SupabasePokemonService } from './services/SupabasePokemonService';
import { SimpleProblemController } from './controllers/SimpleProblemController';
import { SimpleGameController } from './controllers/SimpleGameController';
import { PokemonImageDownloader } from './utils/imageDownloader';

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

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pokemon Math Adventure API Server', 
    version: '1.0.0',
    status: 'running'
  });
});

// 포켓몬 관련 API
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
app.get('/api/users/:userId/stats', (req, res) => gameController.getUserStats(req, res));
app.get('/api/leaderboard', (req, res) => gameController.getLeaderboard(req, res));

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