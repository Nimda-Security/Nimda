import Layout from "@/components/Layout";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { submitCodeAPI, getAllSubmissionsAPI } from "@/api/judge";

interface JudgeStatus {
  status:
    | "JUDGING"
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "COMPILATION_ERROR"
    | "TIME_LIMIT_EXCEEDED"
    | "RUNTIME_ERROR"
    | "SYSTEM_ERROR";
  message?: string;
  executionTime?: number;
  score?: number;
  errorOutput?: string;
  memoryUsage?: number;
  submittedBy?: string;
  submissionId?: number;
}

interface Submission {
  id: number;
  code: string;
  language: string;
  status: string;
  submittedAt: string;
  problemId: number;
  problemTitle: string;
  username: string;
  executionTime?: number | null;
  memoryUsage?: number | null;
  score?: number | null;
}

function JudgingStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>({
    status: "JUDGING",
  });
  const [dots, setDots] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasSubmittedRef = useRef(false); // 중복 제출 방지용 ref

  // URL 파라미터에서 제출 정보 가져오기
  const submissionData = location.state?.submissionData;
  const isNewSubmission = location.state?.isNewSubmission; // 새로운 제출인지 구분하는 플래그

  useEffect(() => {
    // 모든 제출 목록 가져오기
    const fetchAllSubmissions = async () => {
      try {
        setIsLoading(true);
        const result = await getAllSubmissionsAPI();

        if (result.success) {
          setSubmissions(result.submissions);
        } else {
          console.error("제출 목록 가져오기 실패:", result.message);
        }
      } catch (error) {
        console.error("제출 목록 가져오기 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSubmissions();

    // 새로운 제출이 있고, 실제로 새로운 제출인 경우에만 처리 (중복 실행 방지)
    if (submissionData && isNewSubmission && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true; // 제출 플래그 설정
      // 채점 중 애니메이션 (점 3개 반복)
      const dotInterval = setInterval(() => {
        setDots((prev) => {
          if (prev === "...") return "";
          return prev + ".";
        });
      }, 500);

      // 실제 채점 API 호출
      const performJudging = async () => {
        try {
          // 새로운 judge API 사용 (토큰 자동 포함)
          const result = await submitCodeAPI(submissionData);

          // 채점 완료 후 상태 업데이트
          setTimeout(async () => {
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
                submittedBy: result.submittedBy,
                submissionId: result.submissionId,
              });

              // 제출 목록 새로고침
              await fetchAllSubmissions();
            } else {
              setJudgeStatus({
                status: "SYSTEM_ERROR",
                message: result.message,
              });
            }
          }, 2000); // 최소 2초 대기 (채점 중 느낌을 위해)
        } catch (error) {
          clearInterval(dotInterval);
          setJudgeStatus({
            status: "SYSTEM_ERROR",
            message: "채점 서버에 연결할 수 없습니다.",
          });
        }
      };

      performJudging();

      return () => clearInterval(dotInterval);
    }
  }, [submissionData, isNewSubmission, navigate]);

  const goBack = () => {
    navigate("/problem-submit");
  };

  const goToHome = () => {
    navigate("/");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white" style={{ paddingTop: "32px" }}>
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
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    제출 목록을 불러오는 중...
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    제출된 코드가 없습니다.
                  </div>
                ) : (
                  submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="grid grid-cols-8 gap-4 px-4 py-3 text-sm hover:bg-gray-50"
                    >
                      <div className="text-center text-blue-600 font-medium">
                        {submission.id}
                      </div>
                      <div className="text-center text-gray-600">
                        {new Date(submission.submittedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div className="text-center font-medium text-black">
                        {submission.username}
                      </div>
                      <div className="text-center">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {submission.problemTitle}
                        </span>
                      </div>
                      <div className="text-center text-gray-600">
                        {submission.language}
                      </div>
                      <div className="text-center">
                        {submission.status === "ACCEPTED" && (
                          <span className="text-green-600 font-medium">
                            Accepted
                          </span>
                        )}
                        {submission.status === "WRONG_ANSWER" && (
                          <span className="text-red-600 font-medium">
                            Wrong answer
                          </span>
                        )}
                        {submission.status === "COMPILATION_ERROR" && (
                          <span className="text-orange-600 font-medium">
                            Compilation error
                          </span>
                        )}
                        {submission.status === "TIME_LIMIT_EXCEEDED" && (
                          <span className="text-purple-600 font-medium">
                            Time limit exceeded
                          </span>
                        )}
                        {submission.status === "RUNTIME_ERROR" && (
                          <span className="text-red-500 font-medium">
                            Runtime error
                          </span>
                        )}
                        {submission.status === "SYSTEM_ERROR" && (
                          <span className="text-gray-600 font-medium">
                            System error
                          </span>
                        )}
                        {submission.status === "JUDGING" && (
                          <span className="text-gray-600">채점 중{dots}</span>
                        )}
                      </div>
                      <div className="text-center text-gray-600">
                        {submission.executionTime !== null &&
                        submission.executionTime !== undefined
                          ? `${submission.executionTime} ms`
                          : "- ms"}
                      </div>
                      <div className="text-center text-gray-600">
                        {submission.memoryUsage !== null &&
                        submission.memoryUsage !== undefined
                          ? `${Math.floor(submission.memoryUsage / 1024)} KB`
                          : "- KB"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 상세 정보 (채점 완료 후) */}
            {judgeStatus.status !== "JUDGING" && (
              <div className="mt-6 bg-white border border-gray-300">
                <div className="border-b border-gray-300 bg-gray-50 px-4 py-3">
                  <h3 className="text-lg font-medium text-black">
                    채점 결과 상세
                  </h3>
                </div>
                <div className="p-4">
                  {judgeStatus.status === "ACCEPTED" && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">상태:</span>
                        <span className="text-green-600 font-medium">
                          정답입니다!
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">실행 시간:</span>
                        <span className="text-black">
                          {judgeStatus.executionTime}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">점수:</span>
                        <span className="text-black font-medium">
                          {judgeStatus.score}점
                        </span>
                      </div>
                    </div>
                  )}

                  {judgeStatus.message && judgeStatus.status !== "ACCEPTED" && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-600 font-medium">
                          오류 메시지:
                        </span>
                        <div className="mt-1 p-2 bg-gray-100 border border-gray-300 text-sm font-mono">
                          {judgeStatus.message}
                        </div>
                      </div>
                    </div>
                  )}

                  {judgeStatus.errorOutput && (
                    <div className="mt-4">
                      <span className="text-gray-600 font-medium">
                        상세 오류:
                      </span>
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
    </Layout>
  );
}

export default JudgingStatusPage;
