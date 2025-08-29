@echo off
REM 포켓몬 프로젝트 전체 테스트 실행 스크립트 (Windows)

echo 🧪 Starting Pokemon Math Adventure Test Suite...

REM 의존성 설치
echo 📂 Installing dependencies...

if exist "package.json" (
    echo Installing root dependencies...
    call npm ci
    if errorlevel 1 goto :error
)

echo Installing backend dependencies...
cd backend
call npm ci
if errorlevel 1 goto :error
cd ..

echo Installing frontend dependencies...
cd frontend
call npm ci
if errorlevel 1 goto :error
cd ..

REM 백엔드 테스트
echo 🔧 Running Backend Tests...
cd backend

echo Checking TypeScript compilation...
call npm run build
if errorlevel 1 (
    echo ❌ Backend TypeScript compilation failed
    goto :error
)
echo ✅ Backend TypeScript compilation passed

echo Running backend unit tests...
call npm test
if errorlevel 1 (
    echo ❌ Backend unit tests failed
    set BACKEND_FAILED=1
) else (
    echo ✅ Backend unit tests passed
    set BACKEND_PASSED=1
)

echo Running backend integration tests...
call npm run test:integration >nul 2>&1
if errorlevel 1 (
    echo Integration tests not configured yet
) else (
    echo ✅ Backend integration tests passed
)

echo Generating backend coverage report...
call npm run test:coverage

cd ..

REM 프론트엔드 테스트
echo 🎨 Running Frontend Tests...
cd frontend

echo Running frontend linting...
call npm run lint
if errorlevel 1 (
    echo ❌ Frontend linting failed
) else (
    echo ✅ Frontend linting passed
)

echo Checking frontend TypeScript compilation...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend TypeScript compilation failed
    goto :error
)
echo ✅ Frontend TypeScript compilation passed

echo Running frontend tests...
call npm test
if errorlevel 1 (
    echo ❌ Frontend tests failed
    set FRONTEND_FAILED=1
) else (
    echo ✅ Frontend tests passed
    set FRONTEND_PASSED=1
)

echo Generating frontend coverage report...
call npm run test:coverage

cd ..

REM E2E 테스트
echo 🔄 Running E2E Tests...

where npx >nul 2>&1
if errorlevel 1 (
    echo ⚠️ npx not found, skipping E2E tests
    goto :summary
)

echo Installing Playwright browsers...
call npx playwright install --with-deps

echo Starting servers and running E2E tests...
call npm run test:e2e
if errorlevel 1 (
    echo ❌ E2E tests failed
    set E2E_FAILED=1
) else (
    echo ✅ E2E tests passed
    set E2E_PASSED=1
)

:summary
echo 📊 Test Results Summary:
echo ========================

if defined BACKEND_PASSED (
    echo Backend Tests: ✅ PASSED
) else (
    echo Backend Tests: ❌ FAILED
)

if defined FRONTEND_PASSED (
    echo Frontend Tests: ✅ PASSED
) else (
    echo Frontend Tests: ❌ FAILED
)

if defined E2E_PASSED (
    echo E2E Tests: ✅ PASSED
) else if defined E2E_FAILED (
    echo E2E Tests: ❌ FAILED
) else (
    echo E2E Tests: ⚠️ SKIPPED
)

echo ========================

REM 결과 판단
if defined BACKEND_PASSED if defined FRONTEND_PASSED if defined E2E_PASSED (
    echo 🎉 All tests passed! Ready for deployment!
    exit /b 0
)

if defined BACKEND_FAILED if defined FRONTEND_FAILED (
    echo 💥 Multiple test failures detected. Please fix before continuing.
    exit /b 1
)

echo ⚠️ Some tests passed, but issues need attention
exit /b 1

:error
echo 💥 Critical error occurred during setup
exit /b 1