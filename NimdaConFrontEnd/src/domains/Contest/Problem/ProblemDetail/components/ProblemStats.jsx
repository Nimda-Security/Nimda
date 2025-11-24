import React from 'react';

function ProblemStats({ problem, stats }) {
  const timeLimit = problem.timeLimit ? `${problem.timeLimit} 초` : '미정';
  const memoryLimit = problem.memoryLimit ? `${problem.memoryLimit} MB` : '미정';

  return (
    <div className="border-t border-b border-gray-200 py-4 mb-8">
      <div className="grid grid-cols-5 gap-4">
        {/* 시간 제한 */}
        <div>
          <div className="text-xs text-gray-500 mb-1">시간 제한</div>
          <div className="text-sm font-medium">{timeLimit}</div>
        </div>
        {/* 메모리 제한 */}
        <div>
          <div className="text-xs text-gray-500 mb-1">메모리 제한</div>
          <div className="text-sm font-medium">{memoryLimit}</div>
        </div>
        {/* 제출 */}
        <div>
          <div className="text-xs text-gray-500 mb-1">제출</div>
          <div className="text-sm font-medium">{stats.submitCount}</div>
        </div>
        {/* 정답 */}
        <div>
          <div className="text-xs text-gray-500 mb-1">정답</div>
          <div className="text-sm font-medium">{stats.correctCount}</div>
        </div>
        {/* 맞힌 사람 */}
        <div>
          <div className="text-xs text-gray-500 mb-1">맞힌 사람</div>
          <div className="text-sm font-medium">{stats.correctPeople}</div>
        </div>
      </div>
    </div>
  );
}

export default ProblemStats;
