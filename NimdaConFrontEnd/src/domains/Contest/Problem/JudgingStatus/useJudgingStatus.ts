import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getAllSubmissionsAPI,
  submitCodeAPI,
  type SubmissionRequest,
} from '@/api/judge';
import { getCurrentNickname } from '@/utils/jwt';

export interface JudgeStatus {
  status:
    | 'JUDGING'
    | 'ACCEPTED'
    | 'WRONG_ANSWER'
    | 'COMPILATION_ERROR'
    | 'TIME_LIMIT_EXCEEDED'
    | 'RUNTIME_ERROR'
    | 'SYSTEM_ERROR';
  message?: string;
  executionTime?: number;
  score?: number;
  errorOutput?: string;
  memoryUsage?: number;
  submittedBy?: string;
  submissionId?: number;
}

interface JudgingStatusLocationState {
  submissionData?: SubmissionRequest & { nonce?: string };
  isNewSubmission?: boolean;
  problemId?: number | string;
}

const isJudgeStatus = (status: string): status is JudgeStatus['status'] => {
  return [
    'JUDGING',
    'ACCEPTED',
    'WRONG_ANSWER',
    'COMPILATION_ERROR',
    'TIME_LIMIT_EXCEEDED',
    'RUNTIME_ERROR',
    'SYSTEM_ERROR',
  ].includes(status);
};

export interface Submission {
  id: number;
  code: string;
  language: string;
  status: string;
  submittedAt: string;
  problemId: number;
  problemTitle: string;
  nickname: string;
  executionTime?: number | null;
  memoryUsage?: number | null;
  score?: number | null;
}

export function useJudgingStatus(
  locationState?: JudgingStatusLocationState | null
) {
  const navigate = useNavigate();
  const location = useLocation();
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>({
    status: 'JUDGING',
  });
  const [dots, setDots] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasSubmittedRef = useRef(false);

  // A submission belongs to the navigation that mounted this screen. Keep that
  // snapshot stable when the history state is cleared after accepting it.
  const initialLocationStateRef = useRef(locationState);
  const initialLocationState = initialLocationStateRef.current;
  const submissionData = initialLocationState?.submissionData;
  const isNewSubmission = initialLocationState?.isNewSubmission;
  const problemId = initialLocationState?.problemId;

  // 모든 제출 목록 가져오기
  const fetchAllSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAllSubmissionsAPI();

      if (result.success) {
        const currentNickname = getCurrentNickname();
        let userSubmissions = result.submissions
          .filter(
            (submission: Submission) => submission.nickname === currentNickname
          )
          .sort((a: Submission, b: Submission) => b.id - a.id);

        // problemId가 있으면 해당 문제의 제출만 필터링
        if (problemId) {
          userSubmissions = userSubmissions.filter(
            (submission: Submission) =>
              submission.problemId === Number(problemId)
          );
        }

        setSubmissions(userSubmissions);
      } else {
        console.error('제출 목록 가져오기 실패:', result.message);
      }
    } catch (error) {
      console.error('제출 목록 가져오기 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    void fetchAllSubmissions();

    // 새로운 제출이 있고, 실제로 새로운 제출인 경우에만 처리
    if (submissionData && isNewSubmission && !hasSubmittedRef.current) {
      // Nonce 체크
      const nonce = submissionData.nonce;
      if (nonce) {
        const processedKey = `processed_submission_${nonce}`;
        if (sessionStorage.getItem(processedKey)) {
          console.log('이미 처리된 제출입니다.');
          return;
        }
        sessionStorage.setItem(processedKey, 'true');
      }

      hasSubmittedRef.current = true;

      // URL 상태 초기화
      navigate(location.pathname, { replace: true, state: {} });

      // 채점 중 애니메이션
      const dotInterval = setInterval(() => {
        setDots((prev) => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);

      // 실제 채점 API 호출
      const performJudging = async () => {
        try {
          const result = await submitCodeAPI(submissionData);

          setTimeout(async () => {
            clearInterval(dotInterval);

            if (result.success && result.result) {
              const judgeResult = result.result;
              setJudgeStatus({
                status: isJudgeStatus(judgeResult.status)
                  ? judgeResult.status
                  : 'SYSTEM_ERROR',
                message: judgeResult.message,
                executionTime: judgeResult.executionTime,
                score: judgeResult.score,
                errorOutput: judgeResult.errorOutput,
                memoryUsage: judgeResult.memoryUsage,
                submittedBy: result.submittedBy,
                submissionId: result.submissionId,
              });

              await fetchAllSubmissions();
            } else {
              setJudgeStatus({
                status: 'SYSTEM_ERROR',
                message: result.message,
              });
            }
          }, 2000);
        } catch {
          clearInterval(dotInterval);
          setJudgeStatus({
            status: 'SYSTEM_ERROR',
            message: '채점 서버에 연결할 수 없습니다.',
          });
        }
      };

      void performJudging();

      return () => clearInterval(dotInterval);
    }
  }, [
    fetchAllSubmissions,
    isNewSubmission,
    location.pathname,
    navigate,
    submissionData,
  ]);

  return {
    judgeStatus,
    dots,
    submissions,
    isLoading,
    refreshSubmissions: fetchAllSubmissions,
  };
}
