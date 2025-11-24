import React from 'react';
import { type JudgeStatus } from '../useJudgingStatus';

interface JudgingResultProps {
  judgeStatus: JudgeStatus;
}

function JudgingResult({ judgeStatus }: JudgingResultProps) {
  if (judgeStatus.status === 'JUDGING') return null;

  return (
    <div className="mt-6 bg-white border border-gray-300">
      <div className="border-b border-gray-300 bg-gray-50 px-4 py-3">
        <h3 className="text-lg font-medium text-black">채점 결과 상세</h3>
      </div>
      <div className="p-4">
        {judgeStatus.status === 'ACCEPTED' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">상태:</span>
              <span className="text-green-600 font-medium">정답입니다!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">실행 시간:</span>
              <span className="text-black">{judgeStatus.executionTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">점수:</span>
              <span className="text-black font-medium">
                {judgeStatus.score}점
              </span>
            </div>
          </div>
        )}

        {judgeStatus.message && judgeStatus.status !== 'ACCEPTED' && (
          <div className="space-y-2">
            <div>
              <span className="text-gray-600 font-medium">오류 메시지:</span>
              <div className="mt-1 p-2 bg-gray-100 border border-gray-300 text-sm font-mono">
                {judgeStatus.message}
              </div>
            </div>
          </div>
        )}

        {judgeStatus.errorOutput && (
          <div className="mt-4">
            <span className="text-gray-600 font-medium">상세 오류:</span>
            <pre className="mt-1 p-2 bg-gray-100 border border-gray-300 text-sm font-mono whitespace-pre-wrap">
              {judgeStatus.errorOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default JudgingResult;
