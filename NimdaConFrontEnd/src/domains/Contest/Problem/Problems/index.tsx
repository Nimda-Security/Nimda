// 01 대회 메인 — 대회 정보 + 문제 목록 (피그마 프레임 01)

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageHead from '../../components/PageHead';
import MetaStrip from '../../components/MetaStrip';
import PointsBadge from '../../components/PointsBadge';
import { SolveBadge } from '../../components/StatusBadge';
import ContestPagination from '../../components/ContestPagination';
import { getProblemsAPI } from '@/api/problem';
import type { ProblemSummary } from '@/api/problem';
import { getMySolveStatusAPI } from '@/api/submission';
import { CONTEST } from '../../contest.config';
import '../../Contest.css';

const PAGE_SIZE = 20;

const ProblemsPage = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1); // UI 1-기반, API 0-기반
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [tried, setTried] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (uiPage: number) => {
    setLoading(true);
    setError(null);
    const [problemsResult, statusResult] = await Promise.all([
      getProblemsAPI(uiPage - 1, PAGE_SIZE),
      getMySolveStatusAPI(),
    ]);

    if (problemsResult.success) {
      setProblems(problemsResult.data.content);
      setTotalPages(Math.max(1, problemsResult.data.totalPages));
    } else {
      setError(problemsResult.message);
    }
    if (statusResult.success) {
      setSolved(new Set(statusResult.data.solvedProblems));
      setTried(new Set(statusResult.data.incorrectProblems));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const solveState = (id: number): 'solved' | 'tried' | null =>
    solved.has(id) ? 'solved' : tried.has(id) ? 'tried' : null;

  const handleRegister = () => {
    if (CONTEST.registerUrl) {
      window.open(CONTEST.registerUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('참가 신청은 준비 중입니다. 곧 공지사항으로 안내드릴게요!');
    }
  };

  return (
    <Layout>
      <div className="contest-page">
        <PageHead
          crumb="대회 · NIMDACON"
          title={CONTEST.name}
          description={`NIMDA 알고리즘 온라인 저지 대회 · 개인전 · 총 ${CONTEST.stats.problems}`}
          actions={
            <>
              <Link to="/contest#rules" className="contest-btn contest-btn--secondary">
                대회 규정
              </Link>
              <button type="button" className="contest-btn contest-btn--primary" onClick={handleRegister}>
                참가 신청
              </button>
            </>
          }
        />

        <MetaStrip
          items={[
            { label: '대회 기간', value: CONTEST.periodLabel },
            { label: '진행 시간', value: CONTEST.durationLabel },
            { label: '참가 대상', value: CONTEST.audience },
            { label: '문제 수', value: CONTEST.stats.problems },
            { label: '참가자', value: CONTEST.stats.participants },
          ]}
        />

        <section>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: '#0c0c0c', margin: '0 0 12px' }}>
            문제 목록
          </h2>

          {loading ? (
            <p style={{ color: '#8b8b8b', padding: '24px 0' }}>문제 목록을 불러오는 중...</p>
          ) : error ? (
            <p style={{ color: '#d64454', padding: '24px 0' }}>{error}</p>
          ) : problems.length === 0 ? (
            <p style={{ color: '#8b8b8b', padding: '24px 0' }}>
              등록된 문제가 없습니다. 대회 시작과 함께 공개됩니다.
            </p>
          ) : (
            <table className="contest-table contest-table--clickable">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>번호</th>
                  <th>문제</th>
                  <th style={{ width: 90 }}>난이도</th>
                  <th style={{ width: 70 }}>제출</th>
                  <th style={{ width: 80 }}>정답률</th>
                  <th style={{ width: 90 }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, index) => (
                  <tr key={problem.id} onClick={() => navigate(`/contest/problems/${problem.id}`)}>
                    <td className="contest-table__num">
                      {problem.code || (page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="contest-table__strong">{problem.title}</td>
                    <td>
                      <PointsBadge points={problem.points} />
                    </td>
                    {/* 문제별 제출/정답률 통계 엔드포인트가 없어 표시하지 않는다 */}
                    <td className="contest-table__num">—</td>
                    <td className="contest-table__num">—</td>
                    <td>
                      <SolveBadge state={solveState(problem.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <ContestPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
      </div>
    </Layout>
  );
};

export default ProblemsPage;
