import React from 'react';
import ContentCard from '@/domains/Contest/components/ContentCard';

function ProblemContent({ problem, testCases }) {
  return (
    <div className="space-y-6">
      {/* 문제 설명 */}
      <ContentCard
        title="문제"
        content={problem.description || '설명이 없습니다.'}
        className="shadow-sm"
      />

      {/* 입력 설명 */}
      {problem.inputFormat && (
        <ContentCard
          title="입력"
          content={problem.inputFormat}
          className="shadow-sm"
        />
      )}

      {/* 출력 설명 */}
      {problem.outputFormat && (
        <ContentCard
          title="출력"
          content={problem.outputFormat}
          className="shadow-sm"
        />
      )}

      {/* 예제 영역 (2열 그리드) */}
      {testCases && testCases.length > 0 ? (
        testCases.map((tc, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContentCard
              title={`입력 예시 ${index + 1}`}
              content={tc.input}
              className="h-full shadow-sm"
            />
            <ContentCard
              title={`출력 예시 ${index + 1}`}
              content={tc.output}
              className="h-full shadow-sm"
            />
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          등록된 예제가 없습니다.
        </div>
      )}
    </div>
  );
}

export default ProblemContent;
