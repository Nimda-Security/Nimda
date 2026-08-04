import { useCallback, useEffect, useRef, useState } from 'react';
import { getMySubmissionsAPI } from '@/api/submission';
import type { SubmissionSummary } from '@/api/submission';
import { hasActiveSimulation, overlaySimulatedStatus } from '@/api/judgeSimulator';

const POLL_INTERVAL_MS = 5000;
const POLL_HARD_STOP_MS = 2 * 60 * 1000; // 채점 워커 미구현 — PENDING 무한 폴링 가드

interface MySubmissionsState {
  submissions: SubmissionSummary[];
  totalPages: number;
  loading: boolean;
  error: string | null;
  pollTimedOut: boolean;
}

/**
 * 특정 문제의 내 제출 목록 + 진행 중(PENDING/JUDGING) 항목 폴링.
 * 시뮬레이터 오버레이는 PENDING 행에만 적용되므로 실제 채점 결과가 오면 자연히 우선된다.
 */
export const useMySubmissions = (problemId: string | null, uiPage: number): MySubmissionsState => {
  const [state, setState] = useState<MySubmissionsState>({
    submissions: [],
    totalPages: 1,
    loading: false,
    error: null,
    pollTimedOut: false,
  });
  const pollStartedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (silent: boolean) => {
      if (!problemId) return;
      if (!silent) setState((prev) => ({ ...prev, loading: true, error: null }));

      const result = await getMySubmissionsAPI(problemId, uiPage - 1);

      if (!result.success) {
        setState((prev) => ({ ...prev, loading: false, error: result.message }));
        return;
      }

      const items = overlaySimulatedStatus(result.data.content);
      const active = items.some((s) => s.status === 'PENDING' || s.status === 'JUDGING');

      setState((prev) => ({
        ...prev,
        submissions: items,
        totalPages: Math.max(1, result.data.totalPages),
        loading: false,
        error: null,
        pollTimedOut: prev.pollTimedOut && active,
      }));

      // 진행 중 항목이 있으면 폴링 유지 (하드 스톱 2분)
      if (active || hasActiveSimulation(items)) {
        if (pollStartedAtRef.current === null) pollStartedAtRef.current = Date.now();
        const elapsed = Date.now() - pollStartedAtRef.current;
        if (elapsed < POLL_HARD_STOP_MS) {
          timerRef.current = setTimeout(() => load(true), POLL_INTERVAL_MS);
        } else {
          setState((prev) => ({ ...prev, pollTimedOut: true }));
        }
      } else {
        pollStartedAtRef.current = null;
      }
    },
    [problemId, uiPage],
  );

  useEffect(() => {
    pollStartedAtRef.current = null;
    setState((prev) => ({ ...prev, pollTimedOut: false }));
    load(false);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [load]);

  return state;
};
