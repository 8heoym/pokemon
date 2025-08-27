import { test, expect } from '@playwright/test';

test.describe('게임 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // 새 사용자 생성
    await page.getByText('새로 시작하기').click();
    await page.getByPlaceholder('닉네임을 입력하세요').fill('E2E테스트');
    await page.getByText('모험 시작!').click();
    
    // 게임 대시보드 로딩 대기
    await expect(page.locator('[data-testid="game-dashboard"]')).toBeVisible({ timeout: 10000 });
  });

  test('게임 대시보드가 올바르게 렌더링되어야 함', async ({ page }) => {
    // 사용자 정보 표시 확인
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    await expect(page.locator('text=E2E테스트')).toBeVisible();
    
    // 구구단 선택 영역 확인
    await expect(page.locator('[data-testid="multiplication-selector"]')).toBeVisible();
    
    // 2단부터 9단까지 버튼 확인
    for (let i = 2; i <= 9; i++) {
      await expect(page.getByText(`${i}단`)).toBeVisible();
    }
  });

  test('수학 문제 풀이 플로우', async ({ page }) => {
    // 2단 선택
    await page.getByText('2단').click();
    
    // 문제 카드가 나타나는지 확인
    await expect(page.locator('[data-testid="problem-card"]')).toBeVisible({ timeout: 10000 });
    
    // 문제 요소들이 있는지 확인
    await expect(page.locator('[data-testid="problem-story"]')).toBeVisible();
    await expect(page.locator('[data-testid="problem-equation"]')).toBeVisible();
    await expect(page.getByPlaceholder('답을 입력하세요')).toBeVisible();
    
    // 답 입력 및 제출
    const answerInput = page.getByPlaceholder('답을 입력하세요');
    await answerInput.fill('4'); // 2x2 = 4 (임시로 4 입력)
    
    await page.getByText('제출').click();
    
    // 피드백이 나타나는지 확인
    await expect(page.locator('[data-testid="feedback"]')).toBeVisible({ timeout: 5000 });
  });

  test('힌트 기능', async ({ page }) => {
    await page.getByText('2단').click();
    await expect(page.locator('[data-testid="problem-card"]')).toBeVisible({ timeout: 10000 });
    
    // 힌트 버튼 클릭
    await page.getByText('💡 힌트').click();
    
    // 힌트가 표시되는지 확인
    await expect(page.locator('[data-testid="hint"]')).toBeVisible();
  });

  test('포켓몬 도감 모달', async ({ page }) => {
    // 포켓몬 도감 버튼 클릭
    await page.getByText('포켓몬 도감').click();
    
    // 모달이 열리는지 확인
    await expect(page.locator('[data-testid="pokedex-modal"]')).toBeVisible();
    
    // 모달 닫기
    await page.getByText('닫기').click();
    await expect(page.locator('[data-testid="pokedex-modal"]')).not.toBeVisible();
  });

  test('리더보드 모달', async ({ page }) => {
    // 리더보드 버튼 클릭
    await page.getByText('리더보드').click();
    
    // 모달이 열리는지 확인
    await expect(page.locator('[data-testid="leaderboard-modal"]')).toBeVisible();
    
    // 모달 닫기
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="leaderboard-modal"]')).not.toBeVisible();
  });

  test('로그아웃 기능', async ({ page }) => {
    // 로그아웃 버튼 클릭
    await page.getByText('로그아웃').click();
    
    // 환영 화면으로 돌아가는지 확인
    await expect(page.getByText('포켓몬과 함께하는')).toBeVisible();
    await expect(page.getByText('새로 시작하기')).toBeVisible();
  });

  test('반응형 디자인 - 모바일 뷰', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 요소들이 모바일에서도 잘 보이는지 확인
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="multiplication-selector"]')).toBeVisible();
    
    // 스크롤이 가능한지 확인
    await page.getByText('9단').scrollIntoViewIfNeeded();
    await expect(page.getByText('9단')).toBeVisible();
  });
});