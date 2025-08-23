# 🔥 포켓몬 수학 모험 ⚡

> 포켓몬과 함께하는 초등학교 2학년 곱셈 교육 게임

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.0.0-blue)](https://www.typescriptlang.org/)

## 📖 프로젝트 소개

**포켓몬 수학 모험**은 초등학교 2학년 학생들이 포켓몬 IP를 활용하여 곱셈과 구구단을 재미있게 학습할 수 있는 게이미피케이션 교육 플랫폼입니다.

### ✨ 주요 특징

- 🤖 **AI 개인화 학습**: Claude API를 활용한 맞춤형 문제 생성
- 🎮 **게이미피케이션**: 포켓몬 수집, 레벨업, 지역 해금 시스템
- 📚 **교육학적 접근**: CRA(구체-표상-추상) 교육 원리 적용
- 📊 **실시간 분석**: 오답 패턴 분석 및 개인화 피드백
- 🗺️ **지역별 학습**: 구구단별 포켓몬 지역 매핑

## 🏗️ 시스템 아키텍처

```
pokemon-math-adventure/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # API 컨트롤러
│   │   ├── models/          # MongoDB 스키마
│   │   ├── services/        # 비즈니스 로직
│   │   └── utils/           # 유틸리티 (크롤링, AI)
├── frontend/                # Next.js + React + TypeScript
│   ├── app/                 # Next.js 앱 라우터
│   ├── components/          # 리액트 컴포넌트
│   ├── utils/              # 프론트엔드 유틸리티
│   └── types/              # 타입 정의
└── shared/                  # 공통 타입 정의
```

## 🛠️ 기술 스택

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **AI**: Claude API (Anthropic)
- **Web Scraping**: Puppeteer

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **HTTP Client**: Axios

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/YOUR_USERNAME/pokemon-math-adventure.git
cd pokemon-math-adventure
```

### 2. 환경 변수 설정
```bash
# Backend 환경 변수
cp backend/.env.example backend/.env
```

`.env` 파일에 다음 정보를 입력하세요:
```env
MONGODB_URI=mongodb://localhost:27017/pokemon-math-adventure
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3001
NODE_ENV=development
```

### 3. Backend 실행
```bash
cd backend
npm install
npm run dev
```

### 4. 포켓몬 데이터 초기화
```bash
# 새로운 터미널에서 실행
curl -X POST http://localhost:3001/api/pokemon/initialize
```

### 5. Frontend 실행
```bash
cd frontend
npm install
npm run dev
```

### 6. 애플리케이션 접속
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🎯 주요 기능

### 🤖 AI 개인화 문제 생성
- 사용자의 학습 수준과 실수 패턴을 분석
- Claude API를 활용한 맞춤형 곱셈 문제 생성
- CRA 교육 원리에 따른 단계적 문제 제시

### 🎮 게이미피케이션 시스템
- **포켓몬 수집**: 문제를 맞추면 포켓몬 획득 기회
- **레벨 시스템**: 경험치 획득을 통한 트레이너 레벨업
- **지역 해금**: 구구단 완료 시 새로운 지역 해금
- **도감 시스템**: 수집한 포켓몬을 확인할 수 있는 도감

### 📊 학습 분석 시스템
- 실시간 오답 패턴 분석
- 개인화된 학습 경로 제안
- 동적 힌트 시스템
- 학습 진도 추적

## 📚 교육학적 설계

### CRA 교육 원리 적용
1. **Concrete (구체물)**: 포켓몬 이야기 문제
2. **Representational (반구체물)**: 시각적 힌트 제공
3. **Abstract (추상물)**: 곱셈식 표현

### 개인화 학습
- 학습자 수준별 문제 난이도 조절
- 실수 유형별 맞춤 피드백
- 반복 학습을 통한 개념 정착

## 🗂️ API 문서

### 사용자 관리
- `POST /api/users` - 새 사용자 생성
- `GET /api/users/:userId` - 사용자 정보 조회
- `GET /api/users/:userId/progress` - 학습 진도 조회

### 문제 생성 및 제출
- `POST /api/problems/generate` - AI 문제 생성
- `POST /api/problems/submit` - 답안 제출
- `GET /api/problems/:problemId/hint/:userId` - 힌트 조회

### 포켓몬 관리
- `GET /api/pokemon/stats` - 포켓몬 통계
- `GET /api/pokemon/table/:table` - 구구단별 포켓몬 조회
- `POST /api/pokemon/initialize` - 포켓몬 DB 초기화

## 🎨 사용자 인터페이스

### 주요 화면
- **환영 화면**: 사용자 등록 및 로그인
- **메인 대시보드**: 학습 현황 및 구구단 선택
- **문제 화면**: 포켓몬 문제 및 답안 입력
- **포켓몬 도감**: 수집한 포켓몬 확인
- **리더보드**: 다른 사용자와의 경쟁

## 🚀 배포 가이드

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway/Heroku (Backend)
```bash
cd backend
# railway.toml 또는 Procfile 설정 후
railway deploy
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 확인하세요.

## 👥 개발팀

- **Product Manager**: 초등 교육 전문가
- **AI Engineer**: Claude API 활용 및 개인화 엔진
- **Full-stack Developer**: 웹 애플리케이션 개발
- **UI/UX Designer**: 아동 친화적 인터페이스 설계

## 📞 문의사항

- **이슈**: [GitHub Issues](https://github.com/YOUR_USERNAME/pokemon-math-adventure/issues)
- **이메일**: your-email@example.com

## 🎯 로드맵

- [ ] 모바일 앱 버전 개발
- [ ] 더 많은 포켓몬 지역 추가
- [ ] 분수 학습 모드 추가
- [ ] 다국어 지원
- [ ] 학부모 대시보드

---

**포켓몬과 함께 수학을 마스터하세요!** 🔥⚡⭐