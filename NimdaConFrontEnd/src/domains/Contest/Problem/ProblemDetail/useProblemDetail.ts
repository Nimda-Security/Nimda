import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { getProblemDetailAPI, getProblemHtmlAPI } from '@/api/problem';
import type { ProblemDetail } from '@/api/problem';

interface ProblemDetailState {
  problem: ProblemDetail | null;
  html: string | null; // sanitize 완료된 지문 HTML (S3 원문)
  loading: boolean;
  error: string | null;
}

/** 문제 상세 + 지문 HTML 병렬 조회 */
export const useProblemDetail = (id: string | undefined): ProblemDetailState => {
  const [state, setState] = useState<ProblemDetailState>({
    problem: null,
    html: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ problem: null, html: null, loading: false, error: '잘못된 문제 번호입니다.' });
      return;
    }

    let cancelled = false;

    (async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const [detailResult, htmlResult] = await Promise.all([
        getProblemDetailAPI(id),
        getProblemHtmlAPI(id),
      ]);
      if (cancelled) return;

      if (!detailResult.success) {
        setState({ problem: null, html: null, loading: false, error: detailResult.message });
        return;
      }

      setState({
        problem: detailResult.data,
        html:
          htmlResult.success && htmlResult.html
            ? (DOMPurify.sanitize(htmlResult.html) as unknown as string)
            : null,
        loading: false,
        error: null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
};
