import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addVersionToHeaders } from '@/constants/version';
import Layout from '@/components/Layout';
import ProblemItem, { type Problem } from './components/ProblemItem';

type ProblemsError = {
  kind: 'unavailable' | 'temporary';
  status: number | null;
};

const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ProblemsError | null>(null);

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/problems', {
        headers: addVersionToHeaders(),
        credentials: 'include',
      });

      if (!res.ok) {
        setProblems([]);
        setError({
          kind: res.status === 404 ? 'unavailable' : 'temporary',
          status: res.status,
        });
        return;
      }

      const data = await res.json();
      setProblems(data.problems && Array.isArray(data.problems) ? data.problems : []);
    } catch {
      setProblems([]);
      setError({ kind: 'temporary', status: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  return { problems, loading, error, retry: fetchProblems };
};

function ProblemsPage() {
  const navigate = useNavigate();
  const { problems, loading, error, retry } = useProblems();

  const handleGoBack = () => navigate('/contest');
  const handleSolve = (id: number) => {
    navigate(`/problems/${id}`, {
      state: { from: 'problems' }
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* 헤더 */}
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-black">문제 모음</h1>
            <button
              onClick={handleGoBack}
              className="text-gray-600 hover:text-black text-sm"
            >
              ← 메인으로 돌아가기
            </button>
          </header>

          {/* 메인 컨텐츠 */}
          <main className="min-h-[200px]">
            {loading && (
              <div className="text-center py-12 text-gray-600">로딩 중...</div>
            )}

            {error && (
              <div className="text-center py-12" role="alert">
                <h2 className="text-lg font-semibold text-black">
                  {error.kind === 'unavailable'
                    ? '문제 서비스는 아직 준비 중입니다.'
                    : '문제 목록을 지금 불러올 수 없습니다.'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {error.kind === 'unavailable'
                    ? `요청한 기능을 아직 사용할 수 없습니다. (상태 코드: ${error.status})`
                    : error.status
                      ? `서버에서 일시적인 응답 오류가 발생했습니다. (상태 코드: ${error.status})`
                      : '네트워크 연결 또는 서버 상태를 확인한 뒤 다시 시도해주세요.'}
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={retry}
                    className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    다시 시도
                  </button>
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    대회 메인으로 돌아가기
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {problems.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    현재 등록된 문제가 없습니다. 새로운 문제가 등록되면 여기에서 확인할 수 있습니다.
                  </div>
                ) : (
                  problems.map((problem) => (
                    <ProblemItem
                      key={problem.id}
                      problem={problem}
                      onSolve={handleSolve}
                    />
                  ))
                )}
              </div>
            )}
          </main>

          {/* 푸터 */}
          <footer className="mt-8 p-4 bg-gray-100 text-center text-sm text-gray-600">
            문제를 클릭하면 문제 상세 페이지로 이동합니다.
          </footer>
        </div>
      </div>
    </Layout>
  );
}

export default ProblemsPage;
