import { useState, useEffect } from 'react';
import { getAllSubmissionsAPI } from '@/api/judge';

export function useProblemDetail(id) {
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    submitCount: '-',
    correctCount: '-',
    correctPeople: '-',
  });

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. 문제 정보 가져오기
      const response = await fetch(`/api/problems/${encodeURIComponent(id)}`);

      if (!response.ok) {
        throw new Error(
          `문제 정보를 불러오지 못했습니다. (status: ${response.status})`
        );
      }

      const data = await response.json();
      // 데이터 구조 유효성 체크
      if (!data?.success && !data?.problem) {
        if (!data.problem)
          throw new Error('유효한 문제 데이터를 받지 못했습니다.');
      }

      setProblem(data.problem);
      setTestCases(data.testCases || []);

      // 2. 전체 제출 목록 가져와서 통계 계산
      try {
        const submissionsResult = await getAllSubmissionsAPI();
        if (submissionsResult.success) {
          const problemSubmissions = submissionsResult.submissions.filter(
            (s) => s.problemId === Number(id)
          );
          
          const correctSubmissions = problemSubmissions.filter(
            (s) => s.status === 'ACCEPTED'
          );

          // 맞힌 사람 (닉네임 기준 중복 제거)
          const uniqueCorrectUsers = new Set(
            correctSubmissions.map((s) => s.nickname)
          );

          setStats({
            submitCount: problemSubmissions.length,
            correctCount: correctSubmissions.length,
            correctPeople: uniqueCorrectUsers.size,
          });
        }
      } catch (subError) {
        console.error('제출/정답 횟수 계산 중 오류:', subError);
      }
    } catch (error) {
      console.error('문제 로드 오류:', error);
      setError('문제를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return { problem, testCases, loading, error, stats };
}
