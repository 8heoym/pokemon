FROM node:18-alpine

WORKDIR /app

# 백엔드 의존성 설치
COPY backend/package*.json ./
RUN npm install

# 백엔드 소스 복사
COPY backend/ .

# TypeScript 빌드
RUN npm run build

# 포트 노출
EXPOSE 3001

# 프로덕션 서버 시작
CMD ["npm", "start"]