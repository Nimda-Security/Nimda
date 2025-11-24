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

            <JudgingActions onRetry={goBack} onGoToProblems={goToProblems} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default JudgingStatusPage;
