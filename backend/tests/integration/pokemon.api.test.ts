import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { SupabasePokemonService } from '../../src/services/SupabasePokemonService';

// Express 앱 설정 (테스트용)
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const pokemonService = new SupabasePokemonService();

  // 포켓몬 통계 API
  app.get('/api/pokemon/stats', async (req, res) => {
    try {
      const stats = await pokemonService.getPokemonStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: '포켓몬 통계 조회 실패' });
    }
  });

  // 구구단별 포켓몬 조회 API
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

  // 랜덤 포켓몬 조회 API
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

  return app;
};

describe('Pokemon API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/pokemon/stats', () => {
    it('포켓몬 통계를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/pokemon/stats')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('totalPokemon');
      expect(response.body).toHaveProperty('pokemonByTable');
      expect(typeof response.body.totalPokemon).toBe('number');
      expect(typeof response.body.pokemonByTable).toBe('object');
    });
  });

  describe('GET /api/pokemon/table/:table', () => {
    it('유효한 구구단으로 포켓몬을 조회해야 함', async () => {
      const response = await request(app)
        .get('/api/pokemon/table/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('koreanName');
        expect(response.body[0]).toHaveProperty('imageUrl');
        expect(response.body[0]).toHaveProperty('multiplicationTable');
      }
    });

    it('유효하지 않은 구구단에 대해 400 오류를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/pokemon/table/10')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('유효하지 않은 구구단입니다.');
    });
  });

  describe('GET /api/pokemon/random/:table', () => {
    it('랜덤 포켓몬을 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/pokemon/random/2')
        .expect('Content-Type', /json/);

      // 포켓몬이 있으면 200, 없으면 404
      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('koreanName');
        expect(response.body).toHaveProperty('multiplicationTable');
        expect(response.body.multiplicationTable).toBe(2);
      } else {
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('특정 희귀도로 랜덤 포켓몬을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/pokemon/random/2?rarity=common')
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body.rarity).toBe('common');
      } else {
        expect(response.status).toBe(404);
      }
    });
  });
});