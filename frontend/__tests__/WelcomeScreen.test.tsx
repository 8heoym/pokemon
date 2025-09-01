import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WelcomeScreen from '../components/WelcomeScreen';

describe('WelcomeScreen', () => {
  const mockOnCreateUser = jest.fn();
  const mockOnLoadUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('컴포넌트가 정상적으로 렌더링되어야 함', () => {
    render(
      <WelcomeScreen
        onCreateUser={mockOnCreateUser}
        onLoadUser={mockOnLoadUser}
        error=""
        isLoading={false}
      />
    );

    expect(screen.getByText('포켓몬 수학 모험')).toBeInTheDocument();
    expect(screen.getByText('포켓몬과 함께 곱셈을 마스터하자!')).toBeInTheDocument();
    expect(screen.getByText('🆕 새로 시작하기')).toBeInTheDocument();
    expect(screen.getByText('📂 이어서 하기')).toBeInTheDocument();
  });

  it('새로 시작하기 버튼 클릭 시 닉네임 입력 폼이 나타나야 함', async () => {
    const user = userEvent.setup();
    
    render(
      <WelcomeScreen
        onCreateUser={mockOnCreateUser}
        onLoadUser={mockOnLoadUser}
        error=""
        isLoading={false}
      />
    );

    const newGameButton = screen.getByText('🆕 새로 시작하기');
    await user.click(newGameButton);

    expect(screen.getByPlaceholderText('예: 지우, 웅이, 이슬이...')).toBeInTheDocument();
    expect(screen.getByText('🚀 모험 시작!')).toBeInTheDocument();
  });

  it('이어하기 버튼 클릭 시 사용자 ID 입력 폼이 나타나야 함', async () => {
    const user = userEvent.setup();
    
    render(
      <WelcomeScreen
        onCreateUser={mockOnCreateUser}
        onLoadUser={mockOnLoadUser}
        error=""
        isLoading={false}
      />
    );

    const continueButton = screen.getByText('📂 이어서 하기');
    await user.click(continueButton);

    expect(screen.getByPlaceholderText('사용자 ID를 입력하세요')).toBeInTheDocument();
    expect(screen.getByText('🚀 모험 시작!')).toBeInTheDocument();
  });

  it('닉네임 입력 후 모험 시작 버튼 클릭 시 onCreateUser 호출', async () => {
    const user = userEvent.setup();
    
    render(
      <WelcomeScreen
        onCreateUser={mockOnCreateUser}
        onLoadUser={mockOnLoadUser}
        error=""
        isLoading={false}
      />
    );

    // 새로 시작하기 클릭
    await user.click(screen.getByText('새로 시작하기'));

    // 닉네임 입력
    const nicknameInput = screen.getByPlaceholderText('닉네임을 입력하세요');
    await user.type(nicknameInput, '테스트트레이너');

    // 모험 시작 버튼 클릭
    const startButton = screen.getByText('모험 시작!');
    await user.click(startButton);

    expect(mockOnCreateUser).toHaveBeenCalledWith('테스트트레이너');
  });

  it('사용자 ID 입력 후 불러오기 버튼 클릭 시 onLoadUser 호출', async () => {
    const user = userEvent.setup();
    
    render(
      <WelcomeScreen
        onCreateUser={mockOnCreateUser}
        onLoadUser={mockOnLoadUser}
        error=""
        isLoading={false}
      />
    );

    // 이어하기 클릭
    await user.click(screen.getByText('이어하기'));

    // 사용자 ID 입력
    const userIdInput = screen.getByPlaceholderText('사용자 ID를 입력하세요');
    await user.type(userIdInput, 'test-user-id');

    // 불러오기 버튼 클릭
    const loadButton = screen.getByText('불러오기');
    await user.click(loadButton);

    expect(mockOnLoadUser).toHaveBeenCalledWith('test-user-id');
  });

  it('빈 닉네임으로 모험 시작 시도 시 버튼이 비활성화되어야 함', async () => {
    const user = userEvent.setup();
    
    render(
      <WelcomeScreen
        onCreateUser={mockOnCreateUser}
        onLoadUser={mockOnLoadUser}
        error=""
        isLoading={false}
      />
    );

    await user.click(screen.getByText('새로 시작하기'));

    const startButton = screen.getByText('모험 시작!');
    expect(startButton).toBeDisabled();
  });

  it('에러 메시지가 있을 때 표시되어야 함', () => {
    const errorMessage = '사용자를 찾을 수 없습니다.';
    
    render(
      <WelcomeScreen
        onCreateUser={mockOnCreateUser}
        onLoadUser={mockOnLoadUser}
        error={errorMessage}
        isLoading={false}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('로딩 중일 때 로딩 스피너가 표시되어야 함', () => {
    render(
      <WelcomeScreen
        onCreateUser={mockOnCreateUser}
        onLoadUser={mockOnLoadUser}
        error=""
        isLoading={true}
      />
    );

    // 로딩 중일 때는 버튼들이 비활성화되어야 함
    expect(screen.getByText('새로 시작하기')).toBeDisabled();
    expect(screen.getByText('이어하기')).toBeDisabled();
  });
});