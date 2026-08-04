// 내 제출 탭 — 실제 API (/api/judge/submission/my/status/{problemId})
// 백엔드에 "전체 문제 통합 내 제출" 엔드포인트가 없어 문제 셀렉터로 문제를 고른다.

import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProblemsAPI } from '@/api/problem';
import type { ProblemSummary } from '@/api/problem';
import { getSubmissionDetailAPI } from '@/api/submission';
import StatusBadge from '../components/StatusBadge';
import CodeBox from '../components/CodeBox';
import ContestPagination from '../components/ContestPagination';
import { useMySubmissions } from './useMySubmissions';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const MySubmissions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sourceById, setSourceById] = useState<Record<number, string>>({});

  const problemId = searchParams.get('problem');
  const { submissions, totalPages, loading, error, pollTimedOut } = useMySubmissions(
    problemId,
    page,
  );

  useEffect(() => {
    // 문제 셀렉터 채우기 (대회 규모라 1페이지 100건이면 충분)
    getProblemsAPI(0, 100).then((result) => {
      if (result.success) {
        setProblems(result.data.content);
        // 선택된 문제가 없으면 첫 문제를 자동 선택
        if (!searchParams.get('problem') && result.data.content.length > 0) {
          setSearchParams(
            (prev) => {
              prev.set('problem', String(result.data.content[0].id));
              return prev;
            },
            { replace: true },
          );
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProblemChange = (value: string) => {
    setPage(1);
    setExpandedId(null);
    setSearchParams((prev) => {
      prev.set('problem', value);
      return prev;
    });
  };

  const toggleExpand = async (submissionId: number) => {
    if (expandedId === submissionId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(submissionId);
    if (!sourceById[submissionId]) {
      const result = await getSubmissionDetailAPI(submissionId);
      if (result.success) {
        setSourceById((prev) => ({ ...prev, [submissionId]: result.data.sourceCode }));
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span className="contest-meta__label">문제</span>
        <select
          value={problemId ?? ''}
          onChange={(e) => handleProblemChange(e.target.value)}
          style={{
            minWidth: 240,
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #bcbcbc',
            borderRadius: 4,
            background: '#ffffff',
            color: '#0c0c0c',
          }}
        >
          {problems.length === 0 && <option value="">문제 불러오는 중...</option>}
          {problems.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.code ? `[${problem.code}] ` : ''}
              {problem.title}
            </option>
          ))}
        </select>
      </div>

      {pollTimedOut && (
        <p style={{ fontSize: 13, color: '#e17654', margin: '0 0 12px' }}>
          채점 대기열 처리 중입니다 — 결과 갱신이 지연되고 있어요. 잠시 후 새로고침해 주세요.
        </p>
      )}

      {loading ? (
        <p style={{ color: '#8b8b8b', padding: '24px 0' }}>제출 내역을 불러오는 중...</p>
      ) : error ? (
        <p style={{ color: '#d64454', padding: '24px 0' }}>{error}</p>
      ) : submissions.length === 0 ? (
        <p style={{ color: '#8b8b8b', padding: '24px 0' }}>아직 제출한 코드가 없습니다.</p>
      ) : (
        <table className="contest-table contest-table--clickable">
          <thead>
            <tr>
              <th style={{ width: 90 }}>제출 번호</th>
              <th style={{ width: 110 }}>상태</th>
              <th style={{ width: 100 }}>언어</th>
              <th style={{ width: 90 }}>시간</th>
              <th style={{ width: 100 }}>메모리</th>
              <th>제출 시각</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <Fragment key={submission.submissionId}>
                <tr onClick={() => toggleExpand(submission.submissionId)}>
                  <td className="contest-table__num contest-mono">
                    #{submission.submissionId}
                  </td>
                  <td>
                    <StatusBadge status={submission.status} />
                  </td>
                  <td>{submission.language}</td>
                  <td className="contest-mono">
                    {submission.executionTimeMs != null ? `${submission.executionTimeMs} ms` : '—'}
                  </td>
                  <td className="contest-mono">
                    {submission.usedMemoryKb != null
                      ? `${Math.round(submission.usedMemoryKb / 1024)} MB`
                      : '—'}
                  </td>
                  <td className="contest-mono">{formatTime(submission.createdAt)}</td>
                </tr>
                {expandedId === submission.submissionId && (
                  <tr>
                    <td colSpan={6} style={{ background: '#fafafa' }}>
                      {submission.errorMessage && (
                        <p style={{ color: '#d64454', fontSize: 13, margin: '0 0 8px' }}>
                          {submission.errorMessage}
                        </p>
                      )}
                      <CodeBox code={sourceById[submission.submissionId] ?? '소스코드 불러오는 중...'} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}

      <ContestPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default MySubmissions;
