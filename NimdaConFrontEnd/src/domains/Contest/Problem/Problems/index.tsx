import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProblemItem, { type Problem } from './components/ProblemItem';

// 로직만 따로 관리하는 커스텀 훅
const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/problems');
        if (!res.ok) throw new Error('응답 에러');
        const data = await res.json();
        setProblems(data.problems);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  return { problems, loading, error };
};

function ProblemsPage() {
  const navigate = useNavigate();
  const { problems, loading, error } = useProblems();

  const handleGoBack = () => navigate('/contest');
  const handleSolve = (id: number) => {
    navigate(`/problem/${id}`, {
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
              <div className="text-center py-12 text-red-600">{error}</div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {problems.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    문제가 없습니다.
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
