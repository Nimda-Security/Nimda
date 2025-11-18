import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import BlackLineButton from '@/components/Button/BlackLine';
import { useEffect, useState } from 'react';

interface Problem {
  id: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  description: string;
}

function ProblemsPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/problems');
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        setProblems(data.problems);
      } catch (error) {
        console.error('문제 목록을 불러오는 중 오류가 발생했습니다.', error);
        // 오류 알리는 UI 추가 가능
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'HARD':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '쉬움';
      case 'MEDIUM':
        return '보통';
      case 'HARD':
        return '어려움';
      default:
        return '알 수 없음';
    }
  };

  const goToProblemSubmit = (problemId: number, problemTitle: string) => {
    navigate('/problem-submit', {
      state: {
        problemId,
        problemTitle,
      },
    });
  };

  const goBack = () => {
    navigate('/contest');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white" style={{ paddingTop: '32px' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-black">문제 모음</h1>
              <button
                onClick={goBack}
                className="text-gray-600 hover:text-black text-sm font-medium"
              >
                ← 메인으로 돌아가기
              </button>
            </div>

            {/* 문제 목록 */}
            {loading ? (
              <div className="text-center">
                <p className="text-gray-600">문제 목록을 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className="bg-white border border-gray-300 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-lg font-semibold text-black">
                            {problem.id}. {problem.title}
                          </h2>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                              problem.difficulty
                            )}`}
                          >
                            {getDifficultyText(problem.difficulty)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {problem.points}점
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-4">
                          {problem.description}
                        </p>
                      </div>

                      <div className="ml-6">
                        <BlackLineButton
                          onClick={() =>
                            goToProblemSubmit(problem.id, problem.title)
                          }
                        >
                          문제 풀기
                        </BlackLineButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                문제를 선택하면 코드 제출 페이지로 이동합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProblemsPage;
