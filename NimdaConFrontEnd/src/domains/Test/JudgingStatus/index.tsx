import NavBar from "@/components/Layout/Header/NavBar";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { submitCodeAPI } from "@/api/judge";

interface JudgeStatus {
  status: 'JUDGING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILATION_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'SYSTEM_ERROR';
  message?: string;
  executionTime?: number;
  score?: number;
  errorOutput?: string;
  memoryUsage?: number;
  submittedBy?: string;
}

function JudgingStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>({ status: 'JUDGING' });
  const [dots, setDots] = useState('');

  // URL 파라미터에서 제출 정보 가져오기
  const submissionData = location.state?.submissionData;

  useEffect(() => {
    // 제출 데이터가 없으면 문제 제출 페이지로 리다이렉트
    if (!submissionData) {
      navigate('/problem-submit');
      return;
    }

    // 채점 중 애니메이션 (점 3개 반복)
    const dotInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    // 실제 채점 API 호출
    const performJudging = async () => {
      try {
        // 새로운 judge API 사용 (토큰 자동 포함)
        const result = await submitCodeAPI(submissionData);
        
        // 채점 완료 후 상태 업데이트
        setTimeout(() => {
          clearInterval(dotInterval);
          
          if (result.success && result.result) {
            const judgeResult = result.result;
            setJudgeStatus({
              status: judgeResult.status as any,
              message: judgeResult.message,
              executionTime: judgeResult.executionTime,
              score: judgeResult.score,
              errorOutput: judgeResult.errorOutput,
              memoryUsage: judgeResult.memoryUsage,
              submittedBy: result.submittedBy
            });
          } else {
            setJudgeStatus({
              status: 'SYSTEM_ERROR',
              message: result.message
            });
          }
        }, 2000); // 최소 2초 대기 (채점 중 느낌을 위해)
        
      } catch (error) {
        clearInterval(dotInterval);
        setJudgeStatus({
          status: 'SYSTEM_ERROR',
          message: '채점 서버에 연결할 수 없습니다.'
        });
      }
    };

    performJudging();

    return () => clearInterval(dotInterval);
  }, [submissionData, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'JUDGING': return 'text-blue-600';
      case 'ACCEPTED': return 'text-green-600';
      case 'WRONG_ANSWER': return 'text-red-600';
      case 'COMPILATION_ERROR': return 'text-orange-600';
      case 'TIME_LIMIT_EXCEEDED': return 'text-purple-600';
      case 'RUNTIME_ERROR': return 'text-red-500';
      case 'SYSTEM_ERROR': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'JUDGING': return '채점 중';
      case 'ACCEPTED': return '맞았습니다!!';
      case 'WRONG_ANSWER': return '틀렸습니다';
      case 'COMPILATION_ERROR': return '컴파일 에러';
      case 'TIME_LIMIT_EXCEEDED': return '시간 초과';
      case 'RUNTIME_ERROR': return '런타임 에러';
      case 'SYSTEM_ERROR': return '시스템 에러';
      default: return '알 수 없음';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'JUDGING': return '⏳';
      case 'ACCEPTED': return '🎉';
      case 'WRONG_ANSWER': return '❌';
      case 'COMPILATION_ERROR': return '🔨';
      case 'TIME_LIMIT_EXCEEDED': return '⏰';
      case 'RUNTIME_ERROR': return '💥';
      case 'SYSTEM_ERROR': return '⚠️';
      default: return '❓';
    }
  };

  const goBack = () => {
    navigate('/problem-submit');
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <>
      <NavBar />
      <div 
        className="min-h-screen bg-white"
        style={{ paddingTop: '64px' }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-black">제출 현황</h1>
              <button 
                onClick={goBack}
                className="text-gray-600 hover:text-black text-sm font-medium"
              >
                ← 문제로 돌아가기
              </button>
            </div>

            {/* 테이블 */}
            <div className="bg-white border border-gray-300">
              {/* 테이블 헤더 */}
              <div className="border-b border-gray-300 bg-gray-50">
                <div className="grid grid-cols-8 gap-4 px-4 py-3 text-sm font-medium text-black">
                  <div className="text-center">#</div>
                  <div className="text-center">When</div>
                  <div className="text-center">Who</div>
                  <div className="text-center">Problem</div>
                  <div className="text-center">Lang</div>
                  <div className="text-center">Verdict</div>
                  <div className="text-center">Time</div>
                  <div className="text-center">Memory</div>
                </div>
              </div>

              {/* 테이블 바디 */}
              <div className="divide-y divide-gray-200">
                <div className="grid grid-cols-8 gap-4 px-4 py-3 text-sm hover:bg-gray-50">
                  <div className="text-center text-blue-600 font-medium">
                    {Date.now().toString().slice(-6)}
                  </div>
                  <div className="text-center text-gray-600">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-center font-medium text-black">
                    {judgeStatus.submittedBy || '사용자'}
                  </div>
                  <div className="text-center">
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      {submissionData?.title || 'A + B'}
                    </span>
                  </div>
                  <div className="text-center text-gray-600">
                    {submissionData?.language || 'Java'}
                  </div>
                  <div className="text-center">
                    {judgeStatus.status === 'JUDGING' && (
                      <span className="text-gray-600">
                        채점 중{dots}
                      </span>
                    )}
                    {judgeStatus.status === 'ACCEPTED' && (
                      <span className="text-green-600 font-medium">Accepted</span>
                    )}
                    {judgeStatus.status === 'WRONG_ANSWER' && (
                      <span className="text-red-600 font-medium">Wrong answer</span>
                    )}
                    {judgeStatus.status === 'COMPILATION_ERROR' && (
                      <span className="text-orange-600 font-medium">Compilation error</span>
                    )}
                    {judgeStatus.status === 'TIME_LIMIT_EXCEEDED' && (
                      <span className="text-purple-600 font-medium">Time limit exceeded</span>
                    )}
                    {judgeStatus.status === 'RUNTIME_ERROR' && (
                      <span className="text-red-500 font-medium">Runtime error</span>
                    )}
                    {judgeStatus.status === 'SYSTEM_ERROR' && (
                      <span className="text-gray-600 font-medium">System error</span>
                    )}
                  </div>
                  <div className="text-center text-gray-600">
                    {judgeStatus.status === 'JUDGING' ? '0 ms' : `${judgeStatus.executionTime || 0} ms`}
                  </div>
                  <div className="text-center text-gray-600">
                    {judgeStatus.status === 'JUDGING' ? '0 KB' : `${Math.floor((judgeStatus.memoryUsage || 0) / 1024)} KB`}
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 정보 (채점 완료 후) */}
            {judgeStatus.status !== 'JUDGING' && (
              <div className="mt-6 bg-white border border-gray-300">
                <div className="border-b border-gray-300 bg-gray-50 px-4 py-3">
                  <h3 className="text-lg font-medium text-black">채점 결과 상세</h3>
                </div>
                <div className="p-4">
                  {judgeStatus.status === 'ACCEPTED' && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">상태:</span>
                        <span className="text-green-600 font-medium">정답입니다!</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">실행 시간:</span>
                        <span className="text-black">{judgeStatus.executionTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">점수:</span>
                        <span className="text-black font-medium">{judgeStatus.score}점</span>
                      </div>
                    </div>
                  )}

                  {judgeStatus.message && judgeStatus.status !== 'ACCEPTED' && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-600 font-medium">오류 메시지:</span>
                        <div className="mt-1 p-2 bg-gray-100 border border-gray-300 text-sm font-mono">
                          {judgeStatus.message}
                        </div>
                      </div>
                    </div>
                  )}

                  {judgeStatus.errorOutput && (
                    <div className="mt-4">
                      <span className="text-gray-600 font-medium">상세 오류:</span>
                      <pre className="mt-1 p-2 bg-gray-100 border border-gray-300 text-sm font-mono whitespace-pre-wrap">
                        {judgeStatus.errorOutput}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={goBack}
                className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                다시 제출하기
              </button>
              <button
                onClick={goToHome}
                className="bg-gray-600 text-white px-6 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                메인으로 가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default JudgingStatusPage;
