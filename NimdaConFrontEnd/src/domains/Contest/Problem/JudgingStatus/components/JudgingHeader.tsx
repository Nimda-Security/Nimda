import React from 'react';

interface JudgingHeaderProps {
  onBack: () => void;
}

function JudgingHeader({ onBack }: JudgingHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-black">채점 현황</h1>
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-black text-sm font-medium"
      >
        ← 문제로 돌아가기
      </button>
    </div>
  );
}

export default JudgingHeader;
