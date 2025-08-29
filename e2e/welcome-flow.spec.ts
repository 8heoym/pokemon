import { test, expect } from '@playwright/test';

test.describe('환영 화면 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('환영 화면이 올바르게 렌더링되어야 함', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('포켓몬과 함께하는');
    await expect(page.locator('h1')).toContainText('수학 모험');
    
    await expect(page.getByText('새로 시작하기')).toBeVisible();
    await expect(page.getByText('이어하기')).toBeVisible();
  });

  test('새 사용자 생성 플로우', async ({ page }) => {
    // 새로 시작하기 버튼 클릭
    await page.getByText('새로 시작하기').click();
    
    // 닉네임 입력 폼이 나타나는지 확인
    await expect(page.getByPlaceholder('닉네임을 입력하세요')).toBeVisible();
    
    // 닉네임 입력
    await page.getByPlaceholder('닉네임을 입력하세요').fill('테스트트레이너');
    
    // 모험 시작 버튼 클릭
    await page.getByText('모험 시작!').click();
    
    // 게임 대시보드로 이동하는지 확인 (로딩 시간 고려)
    await expect(page.locator('[data-testid="game-dashboard"]')).toBeVisible({ timeout: 10000 });
  });

  test('기존 사용자 로딩 플로우', async ({ page }) => {
    // 먼저 사용자를 생성하고 ID를 얻어야 함
    await page.getByText('새로 시작하기').click();
    await page.getByPlaceholder('닉네임을 입력하세요').fill('테스트유저');
    await page.getByText('모험 시작!').click();
    
    // 사용자 ID를 localStorage에서 확인
    const userInfo = await page.evaluate(() => {
      return localStorage.getItem('pokemonMathUser');
    });
    
    const user = JSON.parse(userInfo!);
    const userId = user.id;
    
    // 다시 환영 화면으로 이동
    await page.evaluate(() => {
      localStorage.removeItem('pokemonMathUser');
    });
    await page.reload();
    
    // 이어하기 플로우 테스트
    await page.getByText('이어하기').click();
    await expect(page.getByPlaceholder('사용자 ID를 입력하세요')).toBeVisible();
    
    await page.getByPlaceholder('사용자 ID를 입력하세요').fill(userId);
    await page.getByText('불러오기').click();
    
    // 게임 대시보드로 이동하는지 확인
    await expect(page.locator('[data-testid="game-dashboard"]')).toBeVisible({ timeout: 10000 });
  });

  test('빈 닉네임으로 시작 시도 시 버튼 비활성화', async ({ page }) => {
    await page.getByText('새로 시작하기').click();
    
    const startButton = page.getByText('모험 시작!');
    await expect(startButton).toBeDisabled();
    
    // 닉네임 입력 후 활성화 확인
    await page.getByPlaceholder('닉네임을 입력하세요').fill('테스트');
    await expect(startButton).toBeEnabled();
  });

  test('잘못된 사용자 ID로 로딩 시도 시 에러 표시', async ({ page }) => {
    await page.getByText('이어하기').click();
    await page.getByPlaceholder('사용자 ID를 입력하세요').fill('invalid-user-id');
    await page.getByText('불러오기').click();
    
    // 에러 메시지가 표시되는지 확인
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });
  });
});