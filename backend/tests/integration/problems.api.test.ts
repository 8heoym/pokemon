import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { SimpleProblemController } from '../../src/controllers/SimpleProblemController';

// Express 앱 설정 (테스트용)
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const problemController = new SimpleProblemController();

  // 문제 생성 API
  app.post('/api/problems/generate', (req, res) => 
    problemController.generateProblem(req, res));

  // 답안 제출 API
  app.post('/api/problems/submit', (req, res) => 
    problemController.submitAnswer(req, res));

  // 힌트 조회 API
  app.get('/api/problems/:problemId/hint/:userId', (req, res) => 
    problemController.getHint(req, res));

  return app;
};

describe('Problems API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/problems/generate', () => {
    it('유효한 요청으로 문제를 생성해야 함', async () => {
      const requestBody = {
        userId: 'test-user-id',
        multiplicationTable: 2,
        difficulty: 1
      };

      const response = await request(app)
        .post('/api/problems/generate')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('problem');
      expect(response.body.problem).toHaveProperty('id');
      expect(response.body.problem).toHaveProperty('story');
      expect(response.body.problem).toHaveProperty('hint');
      expect(response.body.problem).toHaveProperty('equation');
      expect(response.body.problem).toHaveProperty('answer');
      expect(response.body.problem).toHaveProperty('multiplicationTable', 2);
      expect(response.body.problem).toHaveProperty('pokemonId');
    });

    it('잘못된 요청 데이터로 400 오류를 반환해야 함', async () => {
      const requestBody = {
        // userId 누락
        multiplicationTable: 2,
        difficulty: 1
      };

      const response = await request(app)
        .post('/api/problems/generate')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/problems/submit', () => {
    it('정답 제출 시 올바른 피드백을 반환해야 함', async () => {
      // 먼저 문제를 생성
      const generateResponse = await request(app)
        .post('/api/problems/generate')
        .send({
          userId: 'test-user-id',
          multiplicationTable: 2,
          difficulty: 1
        });

      const problem = generateResponse.body.problem;

      // 정답 제출
      const submitResponse = await request(app)
        .post('/api/problems/submit')
        .send({
          userId: 'test-user-id',
          problemId: problem.id,
          answer: problem.answer,
          timeSpent: 30,
          hintsUsed: 0
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(submitResponse.body).toHaveProperty('isCorrect', true);
      expect(submitResponse.body).toHaveProperty('feedback');
      expect(submitResponse.body).toHaveProperty('experience');
    });

    it('오답 제출 시 올바른 피드백을 반환해야 함', async () => {
      // 먼저 문제를 생성
      const generateResponse = await request(app)
        .post('/api/problems/generate')
        .send({
          userId: 'test-user-id',
          multiplicationTable: 2,
          difficulty: 1
        });

      const problem = generateResponse.body.problem;

      // 오답 제출
      const submitResponse = await request(app)
        .post('/api/problems/submit')
        .send({
          userId: 'test-user-id',
          problemId: problem.id,
          answer: problem.answer + 1, // 의도적으로 틀린 답
          timeSpent: 45,
          hintsUsed: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(submitResponse.body).toHaveProperty('isCorrect', false);
      expect(submitResponse.body).toHaveProperty('feedback');
      expect(submitResponse.body).toHaveProperty('correctAnswer', problem.answer);
    });

    it('잘못된 problemId로 404 오류를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/problems/submit')
        .send({
          userId: 'test-user-id',
          problemId: 'invalid-problem-id',
          answer: 10,
          timeSpent: 30,
          hintsUsed: 0
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/problems/:problemId/hint/:userId', () => {
    it('힌트를 반환해야 함', async () => {
      // 먼저 문제를 생성
      const generateResponse = await request(app)
        .post('/api/problems/generate')
        .send({
          userId: 'test-user-id',
          multiplicationTable: 2,
          difficulty: 1
        });

      const problem = generateResponse.body.problem;

      // 힌트 요청
      const hintResponse = await request(app)
        .get(`/api/problems/${problem.id}/hint/test-user-id`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(hintResponse.body).toHaveProperty('hint');
      expect(typeof hintResponse.body.hint).toBe('string');
    });

    it('존재하지 않는 problemId로 404 오류를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/problems/invalid-problem-id/hint/test-user-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});