# Node.js 20 사용
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package files 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 환경변수 설정 (기본값)
ENV NODE_ENV=production
ENV PORT=3001

# 포트 노출
EXPOSE 3001

# 애플리케이션 실행
CMD ["npm", "start"]
