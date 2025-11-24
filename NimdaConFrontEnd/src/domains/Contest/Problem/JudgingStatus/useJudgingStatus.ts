import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitCodeAPI, getAllSubmissionsAPI } from '@/api/judge';
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

export function useJudgingStatus(locationState: any) {
  const navigate = useNavigate();
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>({
    status: 'JUDGING',
  });
  const [dots, setDots] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasSubmittedRef = useRef(false);

  // URL 파라미터에서 제출 정보 가져오기
  const submissionData = locationState?.submissionData;
  const isNewSubmission = locationState?.isNewSubmission;

  // 모든 제출 목록 가져오기
  const fetchAllSubmissions = async () => {
    try {
      setIsLoading(true);
      const result = await getAllSubmissionsAPI();

      if (result.success) {
        const currentNickname = getCurrentNickname();
        const userSubmissions = result.submissions
          .filter(
            (submission: Submission) => submission.nickname === currentNickname
          )
          .sort((a: Submission, b: Submission) => b.id - a.id);
        setSubmissions(userSubmissions);
      } else {
        console.error('제출 목록 가져오기 실패:', result.message);
      }
    } catch (error) {
      console.error('제출 목록 가져오기 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSubmissions();

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
                status: judgeResult.status as any,
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
        } catch (error) {
          clearInterval(dotInterval);
          setJudgeStatus({
            status: 'SYSTEM_ERROR',
            message: '채점 서버에 연결할 수 없습니다.',
          });
        }
      };

      performJudging();

      return () => clearInterval(dotInterval);
    }
  }, [submissionData, isNewSubmission, navigate]);

  return {
    judgeStatus,
    dots,
    submissions,
    isLoading,
    refreshSubmissions: fetchAllSubmissions,
  };
}
