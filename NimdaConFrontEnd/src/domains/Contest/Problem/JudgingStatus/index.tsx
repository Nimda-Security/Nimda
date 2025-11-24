import Layout from '@/components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useJudgingStatus, type Submission } from './useJudgingStatus';
import JudgingHeader from './components/JudgingHeader';
import SubmissionList from './components/SubmissionList';
import JudgingResult from './components/JudgingResult';
import JudgingActions from './components/JudgingActions';

function JudgingStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    judgeStatus,
    dots,
    submissions,
    isLoading,
  } = useJudgingStatus(location.state);

  const goBack = () => {
    navigate('/problem-submit');
  };

  const goToProblems = () => {
    navigate('/problems');
  };

  const handleNavigateToProblem = (id: number) => {
    navigate(`/problems/${id}`);
  };

  const handleEdit = (submission: Submission) => {
    navigate('/problem-submit', {
      state: {
        problemId: submission.problemId,
        problemTitle: submission.problemTitle,
        code: submission.code,
        language: submission.language,
      },
    });
  };

  const handleRetry = () => {
    if (submissions.length > 0) {
      const latestSubmission = submissions[0];
      navigate('/problem-submit', {
        state: {
          problemId: latestSubmission.problemId,
          problemTitle: latestSubmission.problemTitle,
          code: latestSubmission.code,
          language: latestSubmission.language,
        },
      });
    } else if (location.state?.problemId) {
      // 제출 내역이 없지만 문제 정보가 있는 경우
      navigate('/problem-submit', {
        state: {
          problemId: location.state.problemId,
          problemTitle: location.state.problemTitle,
        },
      });
    } else {
      // 정보가 없는 경우 기본 페이지로 이동
      navigate('/problem-submit');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <JudgingHeader onBack={goBack} />

            <SubmissionList
              submissions={submissions}
              isLoading={isLoading}
              dots={dots}
              onNavigateToProblem={handleNavigateToProblem}
              onEdit={handleEdit}
            />

            <JudgingResult judgeStatus={judgeStatus} />

            <JudgingActions onRetry={handleRetry} onGoToProblems={goToProblems} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default JudgingStatusPage;
