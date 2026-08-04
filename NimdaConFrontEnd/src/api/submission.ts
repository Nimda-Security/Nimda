// 제출 관련 API
// 실제 백엔드 경로: /api/judge/submission (judgeServer.domain.submission.SubmissionController)

import { judgeFetch } from './apiHelpers';
import type { ApiResult, SpringPage } from './apiHelpers';

// 백엔드 SubmissionStatus enum과 1:1 (TS enum 금지 — erasableSyntaxOnly)
export type SubmissionStatus =
  | 'PENDING'
  | 'JUDGING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR';

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  PENDING: '대기 중',
  JUDGING: '채점 중',
  ACCEPTED: '정답',
  WRONG_ANSWER: '오답',
  TIME_LIMIT_EXCEEDED: '시간 초과',
  MEMORY_LIMIT_EXCEEDED: '메모리 초과',
  COMPILE_ERROR: '컴파일 에러',
  RUNTIME_ERROR: '런타임 에러',
} as const;

export interface SubmitPending {
  submissionId: number;
  status: SubmissionStatus;
  message: string;
}

export interface SubmissionSummary {
  submissionId: number;
  problemId: number;
  problemTitle: string | null; // 백엔드가 목록에서는 항상 null — 문제 목록에서 클라이언트 조인
  userId: number;
  language: string;
  createdAt: string;
  status: SubmissionStatus;
  executionTimeMs: number | null;
  usedMemoryKb: number | null;
  errorMessage: string | null;
}

export interface SubmissionDetail extends SubmissionSummary {
  sourceCode: string;
}

export interface MySolveStatus {
  solvedProblems: number[];
  incorrectProblems: number[];
}

/** 코드 제출 — language는 표시값("Java"|"Python"|"C++17"|"C99")을 보내야 한다 */
export const submitSolutionAPI = (body: {
  problemId: number;
  language: string;
  sourceCode: string;
}): Promise<ApiResult<SubmitPending>> =>
  judgeFetch<SubmitPending>(
    '/judge/submission',
    { method: 'POST', body: JSON.stringify(body) },
    '코드 제출 API',
  );

/** 특정 문제에 대한 내 제출 목록 (0-기반 페이지) */
export const getMySubmissionsAPI = (
  problemId: number | string,
  page = 0,
  size = 20,
): Promise<ApiResult<SpringPage<SubmissionSummary>>> =>
  judgeFetch<SpringPage<SubmissionSummary>>(
    `/judge/submission/my/status/${problemId}?page=${page}&size=${size}`,
    {},
    '내 제출 목록 API',
  );

/** 제출 상세 (소스코드 포함) */
export const getSubmissionDetailAPI = (
  submissionId: number,
): Promise<ApiResult<SubmissionDetail>> =>
  judgeFetch<SubmissionDetail>(
    `/judge/submission/detail/${submissionId}`,
    {},
    '제출 상세 API',
  );

/** 내 문제별 해결/시도 현황 */
export const getMySolveStatusAPI = (): Promise<ApiResult<MySolveStatus>> =>
  judgeFetch<MySolveStatus>('/judge/submission/my/status', {}, '내 풀이 현황 API');
