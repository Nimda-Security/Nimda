import React from 'react';
import { type Submission } from '../useJudgingStatus';

interface SubmissionListProps {
  submissions: Submission[];
  isLoading: boolean;
  dots: string;
  onNavigateToProblem: (id: number) => void;
  onEdit: (submission: Submission) => void;
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const dateValue =
    !dateString.endsWith('Z') && !dateString.includes('+')
      ? `${dateString}Z`
      : dateString;
  const date = new Date(dateValue);
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return `${seconds}초 전`;
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  if (months < 12) return `${months}달 전`;
  return `${years}년 전`;
}

function SubmissionList({
  submissions,
  isLoading,
  dots,
  onNavigateToProblem,
  onEdit,
}: SubmissionListProps) {
  return (
    <div className="bg-white border border-gray-300">
      {/* 테이블 헤더 */}
      <div className="border-b border-gray-300">
        <div className="grid grid-cols-8 gap-4 px-4 py-3 text-sm font-medium text-black">
          <div className="text-center">#</div>
          <div className="text-center">ID</div>
          <div className="text-center">문제</div>
          <div className="text-center">결과</div>
          <div className="text-center">시간</div>
          <div className="text-center">메모리</div>
          <div className="text-center">언어</div>
          <div className="text-center">날짜</div>
        </div>
      </div>

      {/* 테이블 바디 */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            제출 목록을 불러오는 중...
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            제출된 코드가 없습니다.
          </div>
        ) : (
          submissions.map((submission, index) => (
            <div
              key={submission.id}
              className="grid grid-cols-8 gap-4 px-4 py-3 text-sm hover:bg-gray-50"
            >
              <div className="text-center text-blue-600 font-medium">
                {submissions.length - index}
              </div>

              <div className="text-center font-medium text-black">
                {submission.nickname}
              </div>
              <div className="text-center">
                <span
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => onNavigateToProblem(submission.problemId)}
                >
                  {submission.problemTitle}
                </span>
              </div>
              <div className="text-center">
                {submission.status === 'ACCEPTED' && (
                  <span className="text-green-600 font-medium">Accepted</span>
                )}
                {submission.status === 'WRONG_ANSWER' && (
                  <span className="text-red-600 font-medium">Wrong answer</span>
                )}
                {submission.status === 'COMPILATION_ERROR' && (
                  <span className="text-orange-600 font-medium">
                    Compilation error
                  </span>
                )}
                {submission.status === 'TIME_LIMIT_EXCEEDED' && (
                  <span className="text-purple-600 font-medium">
                    Time limit exceeded
                  </span>
                )}
                {submission.status === 'RUNTIME_ERROR' && (
                  <span className="text-red-500 font-medium">
                    Runtime error
                  </span>
                )}
                {submission.status === 'SYSTEM_ERROR' && (
                  <span className="text-gray-600 font-medium">
                    System error
                  </span>
                )}
                {submission.status === 'JUDGING' && (
                  <span className="text-gray-600">채점 중{dots}</span>
                )}
              </div>
              <div className="text-center text-gray-600">
                {submission.executionTime !== null &&
                submission.executionTime !== undefined
                  ? `${submission.executionTime} ms`
                  : '- ms'}
              </div>
              <div className="text-center text-gray-600">
                {submission.memoryUsage !== null &&
                submission.memoryUsage !== undefined
                  ? `${Math.floor(submission.memoryUsage / 1024)} KB`
                  : '- KB'}
              </div>
              <div className="text-center text-gray-600">
                {submission.language}
                <span className="mx-2 text-gray-300">|</span>
                <button
                  onClick={() => onEdit(submission)}
                  className="text-gray-500 hover:text-black hover:underline text-xs"
                >
                  수정
                </button>
              </div>
              <div className="text-center text-gray-600">
                {getRelativeTime(submission.submittedAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SubmissionList;
