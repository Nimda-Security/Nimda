import React from 'react';
import type { ProblemInfo, ProblemScore, ScoreboardEntry } from './types';

interface ScoreboardTableProps {
  entries: ScoreboardEntry[];
  problems: ProblemInfo[];
  isLoading: boolean;
  lastUpdated?: Date;
}

// [Helper] 문제를 A, B, C ... 로 표현하기 위한 유틸
const getProblemLabel = (index: number, fallback: string) => {
  const letter = String.fromCharCode(65 + index); // A = 65
  return fallback ? `${letter}. ${fallback}` : `${letter}`;
};

const getCellStyle = (score: ProblemScore) => {
  switch (score.status) {
    case 'ACCEPTED':
      return 'bg-green-600 text-white';
    case 'WRONG_ANSWER':
      return 'bg-red-500 text-white';
    case 'NOT_SUBMITTED':
      return 'bg-gray-200 text-gray-500';
    case 'JUDGING':
      return 'bg-yellow-300 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getCellText = (score: ProblemScore) => {
  if (score.status === 'ACCEPTED') {
    return `+${score.attemptCount}`;
  }
  if (score.status === 'WRONG_ANSWER') {
    return score.attemptCount > 0 ? `-${score.attemptCount}` : '-';
  }
  if (score.status === 'JUDGING') {
    return '채점중';
  }
  return '';
};

const formatMinutes = (minutes?: number) => {
  if (minutes === undefined || minutes === null) {
    return '-';
  }
  return `${minutes} min.`;
};

const ScoreboardTable: React.FC<ScoreboardTableProps> = ({
  entries,
  problems,
  isLoading,
  lastUpdated,
}) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">
              Rank
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">
              Team
            </th>
            {problems.map((problem, index) => (
              <th
                key={problem.problemId}
                className="px-3 py-3 text-center font-semibold text-gray-600"
              >
                <div>{getProblemLabel(index, problem.problemTitle)}</div>
                <div className="text-xs text-gray-400">
                  {problem.points} pts
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-center font-semibold text-gray-600">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {entries.length === 0 && (
            <tr>
              <td
                colSpan={problems.length + 3}
                className="px-4 py-10 text-center text-gray-500"
              >
                {isLoading
                  ? '스코어보드를 불러오는 중입니다...'
                  : '표시할 데이터가 없습니다.'}
              </td>
            </tr>
          )}
          {entries.map((entry) => (
            <tr key={entry.userId} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-gray-800 font-semibold">
                {entry.rank}
              </td>
              <td className="px-4 py-3">
                <div className="text-gray-900 font-medium">
                  {entry.nickname}
                </div>
                <div className="text-xs text-gray-400">ID: {entry.userId}</div>
              </td>
              {entry.problemScores.map((score) => (
                <td
                  key={`${entry.userId}-${score.problemId}`}
                  className={`px-3 py-2 text-center text-sm font-semibold ${getCellStyle(
                    score
                  )}`}
                >
                  {getCellText(score)}
                </td>
              ))}
              <td className="px-4 py-3 text-center font-bold text-gray-900">
                {entry.totalScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="justify-between px-4 py-2 bg-gray-50 text-sm text-gray-500 text-right">
        <span>
          {isLoading
            ? '동기화 중...'
            : lastUpdated
              ? `최근 업데이트: ${lastUpdated.toLocaleTimeString()}`
              : '대기 중'}
        </span>
      </div>
    </div>
  );
};

export default ScoreboardTable;
