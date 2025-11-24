import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useProblemDetail } from './useProblemDetail';
import ProblemHeader from './components/ProblemHeader';
import ProblemStats from './components/ProblemStats';
import ProblemContent from './components/ProblemContent';

function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from; // admin 등에서 왔는지 확인

  const { problem, testCases, loading, error, stats } = useProblemDetail(id);

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

  return (
    <Layout>
      <div className="min-h-screen pt-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <ProblemHeader
            problem={problem}
            from={from}
            onEdit={goToEdit}
            onBack={goBack}
            onSubmit={goToSubmit}
          />

          <ProblemStats problem={problem} stats={stats} />

          <ProblemContent problem={problem} testCases={testCases} />
        </div>
      </div>
    </Layout>
  );
}

export default ProblemDetail;
