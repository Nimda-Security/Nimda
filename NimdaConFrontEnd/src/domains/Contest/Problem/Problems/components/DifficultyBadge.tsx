// src/components/Badge/DifficultyBadge.tsx
import React from 'react';

interface Props {
  difficulty: string;
}

const DIFFICULTY_CONFIG: Record<string, { text: string; color: string }> = {
  EASY: { text: '쉬움', color: 'text-green-600 bg-green-100' },
  MEDIUM: { text: '보통', color: 'text-yellow-600 bg-yellow-100' },
  HARD: { text: '어려움', color: 'text-red-600 bg-red-100' },
  default: { text: '알 수 없음', color: 'text-gray-600 bg-gray-100' },
};

const DifficultyBadge = ({ difficulty }: Props) => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.default;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  );
};

export default DifficultyBadge;
