import React, { useState } from 'react';

interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  imageUrl: string;
  rarity: string;
}

interface MathProblem {
  id: string;
  story: string;
  hint: string;
  equation: string;
  answer: number;
  difficulty: number;
}

interface ProblemCardProps {
  problem: MathProblem | null;
  pokemon: Pokemon | null;
  user: any;
  onAnswerSubmit: (userAnswer: number, timeSpent: number, hintsUsed: number) => Promise<any>;
  onNextProblem: () => void;
  onBackToSelect: () => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  pokemon,
  user,
  onAnswerSubmit,
  onNextProblem,
  onBackToSelect
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'correct' | 'incorrect' | null; message: string}>({
    type: null,
    message: ''
  });
  const [startTime] = useState(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const result = await onAnswerSubmit(parseInt(userAnswer), timeSpent, hintsUsed);
        
        if (result.isCorrect) {
          setFeedback({
            type: 'correct',
            message: result.pokemonCaught?.success 
              ? `정답입니다! ${result.pokemonCaught.pokemon.koreanName}을(를) 잡았어요! 🎉`
              : '정답입니다! 🎉'
          });
        } else {
          setFeedback({
            type: 'incorrect',
            message: '틀렸어요. 다시 생각해보세요!'
          });
        }
        setUserAnswer('');
      } catch (error) {
        console.error('Submit error:', error);
        setFeedback({
          type: 'incorrect',
          message: '오류가 발생했습니다. 다시 시도해주세요.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleHint = () => {
    setHintsUsed(prev => prev + 1);
    // 여기서 힌트를 표시하거나 처리할 수 있습니다
  };

  if (isSubmitting) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">답안을 처리하는 중...</p>
      </div>
    );
  }

  if (!problem || !pokemon) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <p className="text-gray-600">문제를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* 포켓몬 정보 */}
      <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
        <img 
          src={pokemon.imageUrl} 
          alt={pokemon.koreanName}
          className="w-16 h-16 object-contain mr-4"
        />
        <div>
          <h3 className="text-xl font-bold text-gray-800">{pokemon.koreanName}</h3>
          <p className="text-sm text-gray-600">레어도: {pokemon.rarity}</p>
        </div>
      </div>

      {/* 문제 */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">문제</h4>
        <p className="text-gray-700 leading-relaxed mb-4">{problem.story}</p>
        
        {feedback && feedback.type && (
          <div className={`p-3 rounded-lg mb-4 ${
            feedback.type === 'correct' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {feedback.message}
          </div>
        )}
      </div>

      {/* 답변 입력 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            답을 입력하세요:
          </label>
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="input-pokemon"
            placeholder="답을 입력하세요"
            min="0"
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!userAnswer.trim() || isSubmitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {isSubmitting ? '제출 중...' : '답안 제출'}
          </button>
          <button
            type="button"
            onClick={handleHint}
            className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors"
          >
            힌트 💡
          </button>
        </div>
      </form>

      {/* 힌트 표시 */}
      {problem.hint && hintsUsed > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">💡 힌트: {problem.hint}</p>
        </div>
      )}

      {/* 정답/오답 후 버튼들 */}
      {feedback.type && (
        <div className="mt-4 flex gap-3">
          {feedback.type === 'correct' ? (
            <>
              <button
                onClick={onNextProblem}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                다음 문제 ➡️
              </button>
              <button
                onClick={onBackToSelect}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              >
                구구단 선택
              </button>
            </>
          ) : (
            <button
              onClick={() => setFeedback({ type: null, message: '' })}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              다시 시도 🔄
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemCard;