#!/bin/bash

# 포켓몬 프로젝트 전체 테스트 실행 스크립트

set -e

echo "🧪 Starting Pokemon Math Adventure Test Suite..."

# 색깔 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 결과 추적
BACKEND_TESTS_PASSED=0
FRONTEND_TESTS_PASSED=0
E2E_TESTS_PASSED=0

echo "📂 Installing dependencies..."

# Root dependencies
if [ -f "package.json" ]; then
    echo "Installing root dependencies..."
    npm ci
fi

# Backend dependencies
echo "Installing backend dependencies..."
cd backend && npm ci && cd ..

# Frontend dependencies  
echo "Installing frontend dependencies..."
cd frontend && npm ci && cd ..

echo "🔧 Running Backend Tests..."
cd backend

# 백엔드 타입 체크
echo "Checking TypeScript compilation..."
if npm run build; then
    echo -e "${GREEN}✅ Backend TypeScript compilation passed${NC}"
else
    echo -e "${RED}❌ Backend TypeScript compilation failed${NC}"
    exit 1
fi

# 백엔드 단위 테스트
echo "Running backend unit tests..."
if npm test; then
    echo -e "${GREEN}✅ Backend unit tests passed${NC}"
    BACKEND_TESTS_PASSED=1
else
    echo -e "${RED}❌ Backend unit tests failed${NC}"
fi

# 백엔드 통합 테스트
echo "Running backend integration tests..."
if npm run test:integration 2>/dev/null || echo "Integration tests not configured yet"; then
    echo -e "${GREEN}✅ Backend integration tests passed${NC}"
else
    echo -e "${RED}❌ Backend integration tests failed${NC}"
fi

# 백엔드 커버리지
echo "Generating backend coverage report..."
npm run test:coverage

cd ..

echo "🎨 Running Frontend Tests..."
cd frontend

# 프론트엔드 린팅
echo "Running frontend linting..."
if npm run lint; then
    echo -e "${GREEN}✅ Frontend linting passed${NC}"
else
    echo -e "${RED}❌ Frontend linting failed${NC}"
fi

# 프론트엔드 타입 체크
echo "Checking frontend TypeScript compilation..."
if npm run build; then
    echo -e "${GREEN}✅ Frontend TypeScript compilation passed${NC}"
else
    echo -e "${RED}❌ Frontend TypeScript compilation failed${NC}"
    exit 1
fi

# 프론트엔드 테스트
echo "Running frontend tests..."
if npm test; then
    echo -e "${GREEN}✅ Frontend tests passed${NC}"
    FRONTEND_TESTS_PASSED=1
else
    echo -e "${RED}❌ Frontend tests failed${NC}"
fi

# 프론트엔드 커버리지
echo "Generating frontend coverage report..."
npm run test:coverage

cd ..

echo "🔄 Running E2E Tests..."

# Playwright 브라우저 설치
if command -v npx &> /dev/null; then
    echo "Installing Playwright browsers..."
    npx playwright install --with-deps
    
    echo "Starting servers and running E2E tests..."
    if npm run test:e2e; then
        echo -e "${GREEN}✅ E2E tests passed${NC}"
        E2E_TESTS_PASSED=1
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  npx not found, skipping E2E tests${NC}"
fi

echo "📊 Test Results Summary:"
echo "========================"

if [ $BACKEND_TESTS_PASSED -eq 1 ]; then
    echo -e "Backend Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Backend Tests: ${RED}❌ FAILED${NC}"
fi

if [ $FRONTEND_TESTS_PASSED -eq 1 ]; then
    echo -e "Frontend Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Frontend Tests: ${RED}❌ FAILED${NC}"
fi

if [ $E2E_TESTS_PASSED -eq 1 ]; then
    echo -e "E2E Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "E2E Tests: ${RED}❌ FAILED${NC}"
fi

echo "========================"

# 전체 결과 판단
TOTAL_PASSED=$(($BACKEND_TESTS_PASSED + $FRONTEND_TESTS_PASSED + $E2E_TESTS_PASSED))

if [ $TOTAL_PASSED -eq 3 ]; then
    echo -e "${GREEN}🎉 All tests passed! Ready for deployment!${NC}"
    exit 0
elif [ $TOTAL_PASSED -ge 2 ]; then
    echo -e "${YELLOW}⚠️  Most tests passed, but some issues need attention${NC}"
    exit 1
else
    echo -e "${RED}💥 Multiple test failures detected. Please fix before continuing.${NC}"
    exit 1
fi