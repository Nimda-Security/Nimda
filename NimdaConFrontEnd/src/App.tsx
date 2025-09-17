import "./App.css";
import Layout from "@/components/Layout/Layout";
import BlackLineButton from "@/components/Button/BlackLine";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const goToLogIn = () => {
    navigate("/login");
  };

  const goToProblemSubmit = () => {
    navigate("/problem-submit");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-4">
        <BlackLineButton onClick={goToLogIn}>버튼버튼</BlackLineButton>
        <BlackLineButton onClick={goToProblemSubmit}>[테스트페이지] 문제제출</BlackLineButton>
      </div>
    </Layout>
  );
}

export default App;
