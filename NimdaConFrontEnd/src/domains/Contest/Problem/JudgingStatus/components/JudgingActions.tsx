import React from 'react';

interface JudgingActionsProps {
  onRetry: () => void;
  onGoToProblems: () => void;
}

function JudgingActions({ onRetry, onGoToProblems }: JudgingActionsProps) {
  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={onRetry}
        className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        다시 제출하기
      </button>
      <button
        onClick={onGoToProblems}
        className="bg-gray-600 text-white px-6 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        문제 목록
      </button>
    </div>
  );
}

export default JudgingActions;
