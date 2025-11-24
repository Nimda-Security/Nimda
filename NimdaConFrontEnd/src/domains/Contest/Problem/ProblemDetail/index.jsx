import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import ContentCard from '@/domains/Contest/components/ContentCard'; // 카드 컴포넌트 import

function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from; // admin 등에서 왔는지 확인

  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/problems/${encodeURIComponent(id)}`);

      if (!response.ok) {
        throw new Error(
          `문제 정보를 불러오지 못했습니다. (status: ${response.status})`
        );
      }

      const data = await response.json();
      // 데이터 구조 유효성 체크
      if (!data?.success && !data?.problem) {
        // API 응답 구조에 따라 success 플래그가 없을 수도 있으므로 problem 객체 유무로 2차 체크
        if (!data.problem)
          throw new Error('유효한 문제 데이터를 받지 못했습니다.');
      }

      setProblem(data.problem);
      setTestCases(data.testCases || []);
    } catch (error) {
      console.error('문제 로드 오류:', error);
      setError('문제를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // --- 네비게이션 핸들러 ---
  const goBack = () => {
    if (from === 'admin') {
      navigate('/admin');
    } else {
      navigate('/contest'); // 혹은 /problems
    }
  };

  const goToEdit = () => {
    navigate(`/problem-edit/${id}`);
  };

  const goToSubmit = () => {
    navigate('/problem-submit', {
      state: { problemId: Number(id), problemTitle: problem?.title },
    });
  };

  // --- 로딩 및 에러 화면 ---
  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-gray-600">문제를 불러오는 중...</div>
        </div>
      </Layout>
    );
  }

  if (error || !problem) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg mb-6">
            {error || '문제를 찾을 수 없습니다.'}
          </div>
          <button
            onClick={goBack}
            className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            돌아가기
          </button>
        </div>
      </Layout>
    );
  }

  // --- 데이터 가공 ---
  const timeLimit = problem.timeLimit ? `${problem.timeLimit} 초` : '미정';
  const memoryLimit = problem.memoryLimit
    ? `${problem.memoryLimit} MB`
    : '미정';
  // 제출, 정답, 비율 데이터는 API에 없으면 '-' 표시 (나중에 추가되면 변수 교체)
  const submitCount = problem.submitCount || '-';
  const correctCount = problem.correctCount || '-';
  const correctRate = problem.correctRate || '-';

  return (
    <Layout>
      <div className="min-h-screen pt-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* 1. 헤더 영역 (제목 + 버튼 그룹) */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-black">
              [{problem.id}] {problem.title}
            </h1>

            <div className="flex gap-2">
              {from === 'admin' ? (
                <>
                  <button
                    onClick={goToEdit}
                    className="px-4 py-1.5 bg-black text-white text-md rounded hover:bg-blue transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={goBack}
                    className="px-4 py-1.5 bg-white border border-gray-300 text-black text-md rounded hover:bg-gray-100 transition-colors"
                  >
                    뒤로가기
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={goToSubmit}
                    className="px-4 py-1.5 bg-black text-white text-md rounded hover:bg-blue transition-colors"
                  >
                    제출
                  </button>
                  <button className="px-4 py-1.5 bg-black text-white text-md rounded hover:bg-blue transition-colors">
                    채점 현황
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 2. 정보 테이블 (시간, 메모리 등) */}
          <div className="border-t border-b border-gray-200 py-4 mb-8">
            <div className="grid grid-cols-5 gap-4">
              {/* 시간 제한 */}
              <div>
                <div className="text-xs text-gray-500 mb-1">시간 제한</div>
                <div className="text-sm font-medium">{timeLimit}</div>
              </div>
              {/* 메모리 제한 */}
              <div>
                <div className="text-xs text-gray-500 mb-1">메모리 제한</div>
                <div className="text-sm font-medium">{memoryLimit}</div>
              </div>
              {/* 제출 */}
              <div>
                <div className="text-xs text-gray-500 mb-1">제출</div>
                <div className="text-sm font-medium">{submitCount}</div>
              </div>
              {/* 정답 */}
              <div>
                <div className="text-xs text-gray-500 mb-1">정답</div>
                <div className="text-sm font-medium">{correctCount}</div>
              </div>
              {/* 정답 비율 */}
              <div>
                <div className="text-xs text-gray-500 mb-1">정답 비율</div>
                <div className="text-sm font-medium">{correctRate}</div>
              </div>
            </div>
          </div>

          {/* 3. 메인 내용 영역 (카드 배치) */}
          <div className="space-y-6">
            {/* 문제 설명 */}
            <ContentCard
              title="문제"
              content={problem.description || '설명이 없습니다.'}
              className="shadow-sm"
            />

            {/* 입력 설명 */}
            {problem.inputFormat && (
              <ContentCard
                title="입력"
                content={problem.inputFormat}
                className="shadow-sm"
              />
            )}

            {/* 출력 설명 */}
            {problem.outputFormat && (
              <ContentCard
                title="출력"
                content={problem.outputFormat}
                className="shadow-sm"
              />
            )}

            {/* 예제 영역 (2열 그리드) */}
            {testCases && testCases.length > 0 ? (
              testCases.map((tc, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <ContentCard
                    title={`입력 예시 ${index + 1}`}
                    content={tc.input}
                    className="h-full shadow-sm"
                  />
                  <ContentCard
                    title={`출력 예시 ${index + 1}`}
                    content={tc.output}
                    className="h-full shadow-sm"
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                등록된 예제가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProblemDetail;
