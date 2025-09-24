import "./App.css";
import Layout from "@/components/Layout";
import BlackLineButton from "@/components/Button/BlackLine";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const goToLogIn = () => {
    navigate("/login");
  };

  const goToProblemCreate = () => {
    navigate("/problem-create");
  };

  const goToJudgingStatus = () => {
    navigate("/judging-status");
  };

  const goToProblems = () => {
    navigate("/problems");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-4">
        <BlackLineButton onClick={goToLogIn}>버튼버튼</BlackLineButton>
        <BlackLineButton onClick={goToProblems}>[테스트페이지] 문제 모음</BlackLineButton>
        <BlackLineButton onClick={goToProblemCreate}>[관리자] 문제 출제</BlackLineButton>
        <BlackLineButton onClick={goToJudgingStatus}>[테스트페이지] 제출현황</BlackLineButton>
      </div>
    </Layout>
  );
}

export default App;
