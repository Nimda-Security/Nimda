// MOCK: 채점 워커 미구현 — 데모용 시뮬레이터.
// 실제 채점 서버가 배포되면 이 파일과 overlay 호출부(useMySubmissions, 제출 핸들러)만 삭제하면 된다.
//
// 동작: 제출 시각을 sessionStorage에 기록해 두고, 조회 시점의 경과 시간으로
// PENDING(<2초) → JUDGING(2~5초) → 최종 결과(≥5초)를 유도한다.
// setTimeout이 아니라 순수 함수라 페이지 이동/새로고침에 안전하고,
// 결과는 submissionId 기반으로 결정적이라 폴링마다 흔들리지 않는다.

import { MOCK_JUDGE_ENABLED } from '@/domains/Contest/contest.config';
import type { SubmissionStatus } from './submission';

const KEY_PREFIX = 'mockJudge:';

/** 제출 직후 호출 — 시뮬레이션 타이머 시작점 기록 */
export const simulateJudgement = (submissionId: number): void => {
  if (!MOCK_JUDGE_ENABLED) return;
  try {
    sessionStorage.setItem(`${KEY_PREFIX}${submissionId}`, String(Date.now()));
  } catch {
    // sessionStorage 불가 환경(시크릿 등)에서는 조용히 스킵 — PENDING으로 남을 뿐
  }
};

// 10건 중 7건 정답, 나머지는 오답/시간초과/런타임 에러로 분산 (결정적)
const FINAL_STATUSES: SubmissionStatus[] = [
  'ACCEPTED', 'ACCEPTED', 'WRONG_ANSWER', 'ACCEPTED', 'TIME_LIMIT_EXCEEDED',
  'ACCEPTED', 'ACCEPTED', 'RUNTIME_ERROR', 'ACCEPTED', 'ACCEPTED',
];

interface Judgeable {
  submissionId: number;
  status: SubmissionStatus;
  executionTimeMs: number | null;
  usedMemoryKb: number | null;
}

/**
 * PENDING 항목에만 시뮬레이션 상태를 덧입힌다.
 * 실제 워커가 생겨 백엔드 상태가 진행되면 PENDING이 아니게 되므로 자연히 실상태가 우선된다.
 */
export const overlaySimulatedStatus = <T extends Judgeable>(items: T[]): T[] => {
  if (!MOCK_JUDGE_ENABLED) return items;

  return items.map((item) => {
    if (item.status !== 'PENDING') return item;

    let startedAt: number | null = null;
    try {
      const raw = sessionStorage.getItem(`${KEY_PREFIX}${item.submissionId}`);
      if (raw) startedAt = Number(raw);
    } catch {
      return item;
    }
    if (!startedAt || Number.isNaN(startedAt)) return item;

    const elapsed = Date.now() - startedAt;
    if (elapsed < 2000) return item; // PENDING 유지
    if (elapsed < 5000) return { ...item, status: 'JUDGING' as SubmissionStatus };

    const status = FINAL_STATUSES[item.submissionId % FINAL_STATUSES.length];
    return {
      ...item,
      status,
      executionTimeMs:
        status === 'TIME_LIMIT_EXCEEDED' ? 2000 : 40 + (item.submissionId % 7) * 130,
      usedMemoryKb: 12000 + (item.submissionId % 11) * 8200,
    };
  });
};

/** 시뮬레이션이 아직 진행 중(최종 결과 전)인 항목이 있는지 — 폴링 지속 판단용 */
export const hasActiveSimulation = (items: Judgeable[]): boolean =>
  MOCK_JUDGE_ENABLED &&
  items.some((i) => i.status === 'PENDING' || i.status === 'JUDGING');
