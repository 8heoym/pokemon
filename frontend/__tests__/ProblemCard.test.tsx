import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProblemCard from '@/components/ProblemCard';
import { MathProblem } from '@/types';

// API 모킹
jest.mock('@/utils/api', () => ({
  problemAPI: {
    submit: jest.fn()
  }
}));

const mockProblem: MathProblem = {
  id: 'test-problem-id',
  story: '피카츄 3마리가 각각 4개의 나무열매를 가지고 있어요.',
  hint: '3개 그룹에 각각 4개씩 있으니, 4 + 4 + 4와 같아요!',
  equation: '3 × 4 = ?',
  answer: 12,
  multiplicationTable: 2,
  pokemonId: 25,
  difficulty: 1,
  visualElements: {
    pokemonCount: 3,
    itemsPerPokemon: 4,
    totalItems: 12
  }
};

describe('ProblemCard', () => {
  const mockOnAnswer = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('문제가 정상적으로 렌더링되어야 함', () => {
    render(
      <ProblemCard
        problem={mockProblem}
        onAnswer={mockOnAnswer}
        onNext={mockOnNext}
        userId="test-user-id"
      />
    );

    expect(screen.getByText(mockProblem.story)).toBeInTheDocument();
    expect(screen.getByText(mockProblem.equation)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('답을 입력하세요')).toBeInTheDocument();
    expect(screen.getByText('제출')).toBeInTheDocument();
  });

  it('답 입력 후 제출 버튼 클릭 시 onAnswer 호출', async () => {
    const user = userEvent.setup();
    
    render(
      <ProblemCard
        problem={mockProblem}
        onAnswer={mockOnAnswer}
        onNext={mockOnNext}
        userId="test-user-id"
      />
    );

    const answerInput = screen.getByPlaceholderText('답을 입력하세요');
    const submitButton = screen.getByText('제출');

    await user.type(answerInput, '12');
    await user.click(submitButton);

    expect(mockOnAnswer).toHaveBeenCalledWith(12);
  });

  it('숫자가 아닌 값 입력 시 제출 버튼이 비활성화되어야 함', async () => {
    const user = userEvent.setup();
    
    render(
      <ProblemCard
        problem={mockProblem}
        onAnswer={mockOnAnswer}
        onNext={mockOnNext}
        userId="test-user-id"
      />
    );

    const answerInput = screen.getByPlaceholderText('답을 입력하세요');
    const submitButton = screen.getByText('제출');

    await user.type(answerInput, 'abc');
    
    expect(submitButton).toBeDisabled();
  });

  it('힌트 버튼 클릭 시 힌트가 표시되어야 함', async () => {
    const user = userEvent.setup();
    
    render(
      <ProblemCard
        problem={mockProblem}
        onAnswer={mockOnAnswer}
        onNext={mockOnNext}
        userId="test-user-id"
      />
    );

    const hintButton = screen.getByText('💡 힌트');
    await user.click(hintButton);

    await waitFor(() => {
      expect(screen.getByText(mockProblem.hint)).toBeInTheDocument();
    });
  });

  it('정답 제출 시 축하 메시지가 표시되어야 함', async () => {
    const user = userEvent.setup();
    
    // API 모킹 - 정답인 경우
    const { problemAPI } = require('@/utils/api');
    problemAPI.submit.mockResolvedValue({
      data: {
        isCorrect: true,
        feedback: '정답입니다! 🎉',
        experience: 10,
        caughtPokemon: null
      }
    });

    render(
      <ProblemCard
        problem={mockProblem}
        onAnswer={mockOnAnswer}
        onNext={mockOnNext}
        userId="test-user-id"
      />
    );

    const answerInput = screen.getByPlaceholderText('답을 입력하세요');
    const submitButton = screen.getByText('제출');

    await user.type(answerInput, '12');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('정답입니다! 🎉')).toBeInTheDocument();
    });
  });

  it('오답 제출 시 재도전 버튼이 표시되어야 함', async () => {
    const user = userEvent.setup();
    
    // API 모킹 - 오답인 경우
    const { problemAPI } = require('@/utils/api');
    problemAPI.submit.mockResolvedValue({
      data: {
        isCorrect: false,
        feedback: '아쉽네요. 다시 한번 생각해보세요!',
        correctAnswer: 12
      }
    });

    render(
      <ProblemCard
        problem={mockProblem}
        onAnswer={mockOnAnswer}
        onNext={mockOnNext}
        userId="test-user-id"
      />
    );

    const answerInput = screen.getByPlaceholderText('답을 입력하세요');
    const submitButton = screen.getByText('제출');

    await user.type(answerInput, '10');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('다시 도전')).toBeInTheDocument();
    });
  });

  it('Enter 키로도 답안 제출이 가능해야 함', async () => {
    const user = userEvent.setup();
    
    render(
      <ProblemCard
        problem={mockProblem}
        onAnswer={mockOnAnswer}
        onNext={mockOnNext}
        userId="test-user-id"
      />
    );

    const answerInput = screen.getByPlaceholderText('답을 입력하세요');

    await user.type(answerInput, '12');
    await user.keyboard('{Enter}');

    expect(mockOnAnswer).toHaveBeenCalledWith(12);
  });
});